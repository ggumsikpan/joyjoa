import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 조모닝 키워드 목록
const MORNING_KEYWORDS = ['조모닝', '굿모닝', '좋은 아침', '모두모닝', '모두 모닝', '굿 모닝', '금모닝', '꽃모닝']

// 오전 시간대만 (오전 12시~오전 11시59분)
const MORNING_TIME_REGEX = /\[오전 \d{1,2}:\d{2}\]/

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 })
  }

  const text = await file.text()

  // 멤버 목록 가져오기
  const { data: members } = await supabase.from('members').select('id, name, nickname')
  if (!members || members.length === 0) {
    return NextResponse.json({ error: '멤버 데이터를 불러올 수 없습니다.' }, { status: 500 })
  }

  // 카카오톡 이름 → member_id 매핑 생성
  const nameMap = new Map<string, string>()
  for (const m of members) {
    nameMap.set(m.name, m.id)
    if (m.nickname) {
      nameMap.set(m.nickname, m.id)
    }
  }

  // 파싱
  const lines = text.split('\n')
  let currentDate = ''
  const morningEntries: { member_id: string; date: string; kakao_name: string }[] = []
  const seenToday = new Set<string>() // 같은 날 중복 방지

  for (const line of lines) {
    // 날짜 구분선: --------------- 2026년 4월 1일 수요일 ---------------
    const dateMatch = line.match(/^-+ (\d{4})년 (\d{1,2})월 (\d{1,2})일/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      currentDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      seenToday.clear()
      continue
    }

    if (!currentDate) continue

    // 메시지 라인: [이름] [오전/오후 시:분] 내용
    const msgMatch = line.match(/^\[(.+?)\] \[(오전|오후) (\d{1,2}:\d{2})\] (.+)/)
    if (!msgMatch) continue

    const [, senderName, ampm, , content] = msgMatch

    // 오전 시간대만 체크
    if (ampm !== '오전') continue

    // 조모닝 키워드 포함 여부
    const hasMorning = MORNING_KEYWORDS.some(kw => content.includes(kw))
    if (!hasMorning) continue

    // 멤버 매칭: 전체 이름 → 괄호 앞 본명 → 괄호 안 별명 순으로 시도
    // 예: "홍성호(검마사)" → "홍성호" 또는 "검마사"로 매칭
    let memberId = nameMap.get(senderName)
    if (!memberId) {
      const parenMatch = senderName.match(/^(.+?)\s*\((.+?)\)\s*$/)
      if (parenMatch) {
        memberId = nameMap.get(parenMatch[1].trim()) || nameMap.get(parenMatch[2].trim())
      }
    }
    if (!memberId) continue

    // 같은 날 중복 방지
    const key = `${memberId}_${currentDate}`
    if (seenToday.has(key)) continue
    seenToday.add(key)

    morningEntries.push({ member_id: memberId, date: currentDate, kakao_name: senderName })
  }

  // DB에 upsert (UNIQUE 제약조건으로 중복 무시)
  let inserted = 0
  let skipped = 0

  for (const entry of morningEntries) {
    const { error } = await supabase
      .from('mornings')
      .insert({ member_id: entry.member_id, date: entry.date })

    if (error) {
      // 중복 (23505) 이면 스킵
      if (error.code === '23505') {
        skipped++
      }
    } else {
      inserted++
    }
  }

  // 날짜별 요약
  const dateMap = new Map<string, string[]>()
  for (const e of morningEntries) {
    if (!dateMap.has(e.date)) dateMap.set(e.date, [])
    dateMap.get(e.date)!.push(e.kakao_name)
  }

  const summary = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, names]) => ({ date, count: names.length, names }))

  return NextResponse.json({
    total: morningEntries.length,
    inserted,
    skipped,
    summary,
  })
}
