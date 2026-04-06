'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ── 타입 ─────────────────────────────────────────────────
type Member = { id: string; name: string; nickname: string | null; is_author: boolean; sort_order: number }
type Morning = { id: string; member_id: string; date: string }
type Rsvp = { id: string; event_id: string; member_id: string; created_at: string; members?: { name: string } }
type Event = { id: string; title: string; description: string; place: string; event_date: string; capacity: number; emoji: string; color: string; event_note: string | null }
type Book = { id: string; title: string; author: string; description: string; cover_url: string; buy_link: string; color: string }
type Share = { id: string; title: string; description: string; status: string; created_at: string; shared_by: string; members?: { name: string } }
type Album = { id: string; title: string; description: string; cover_url: string | null; created_at: string; photo_count?: number }
type Photo = { id: string; album_id: string; album_title: string; image_url: string; created_at: string }

type TabId = 'home' | 'members' | 'events' | 'photos' | 'books' | 'share'
const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: '조이조아' },
  { id: 'members', icon: '👥', label: '함께조아' },
  { id: 'events', icon: '📅', label: '모임조아' },
  { id: 'photos', icon: '📸', label: '추억조아' },
  { id: 'books', icon: '📚', label: '소식조아' },
  { id: 'share', icon: '🎁', label: '나눔조아' },
]

const today = () => new Date().toISOString().slice(0, 10)

export default function Page() {
  const [tab, setTab] = useState<TabId>('home')
  const [members, setMembers] = useState<Member[]>([])
  const [todayMornings, setTodayMornings] = useState<Morning[]>([])
  const [todayMorningNames, setTodayMorningNames] = useState<string[]>([])
  const [recentMornings, setRecentMornings] = useState<{ date: string; count: number }[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [eventRsvps, setEventRsvps] = useState<Record<string, Rsvp[]>>({})
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [shares, setShares] = useState<Share[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [openAlbum, setOpenAlbum] = useState<Album | null>(null)
  const [newAlbumTitle, setNewAlbumTitle] = useState('')
  const [showNewAlbum, setShowNewAlbum] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [editingProfile, setEditingProfile] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editNickname, setEditNickname] = useState('')
  const [bookQuery, setBookQuery] = useState('')
  const [bookResults, setBookResults] = useState<{ id: string; title: string; authors: string[]; publisher: string; thumbnail: string; link: string; description: string }[]>([])
  const [bookSearching, setBookSearching] = useState(false)
  const photoInput = useRef<HTMLInputElement>(null)

  // ── 이름 로컬 저장 ─────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('joyjoa-member')
    if (saved) setSelectedMember(saved)
  }, [])
  useEffect(() => {
    if (selectedMember) localStorage.setItem('joyjoa-member', selectedMember)
  }, [selectedMember])

  // ── 데이터 로드 ────────────────────────────────────────
  const loadMembers = useCallback(async () => {
    const { data } = await supabase.from('members').select('*').order('sort_order')
    if (data) setMembers(data)
  }, [])

  const loadTodayMornings = useCallback(async () => {
    const { data } = await supabase.from('mornings').select('*, members(name)').eq('date', today())
    if (data) {
      setTodayMornings(data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTodayMorningNames(data.map((m: any) => m.members?.name ?? ''))
    }
  }, [])

  const loadRecentMornings = useCallback(async () => {
    const days: { date: string; count: number }[] = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().slice(0, 10)
      const { count } = await supabase.from('mornings').select('*', { count: 'exact', head: true }).eq('date', dateStr)
      days.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count: count ?? 0 })
    }
    setRecentMornings(days)
  }, [])

  const loadEvents = useCallback(async () => {
    const { data } = await supabase.from('events').select('*').order('event_date')
    if (data) setEvents(data)
  }, [])

  const loadEventRsvps = useCallback(async (eventId: string) => {
    const { data } = await supabase.from('event_rsvps').select('*, members(name)').eq('event_id', eventId).order('created_at')
    if (data) setEventRsvps(prev => ({ ...prev, [eventId]: data }))
  }, [])

  const loadAllRsvps = useCallback(async () => {
    const { data: evts } = await supabase.from('events').select('id')
    if (evts) {
      for (const ev of evts) await loadEventRsvps(ev.id)
    }
  }, [loadEventRsvps])

  const loadBooks = useCallback(async () => {
    const { data } = await supabase.from('books').select('*').order('created_at', { ascending: false })
    if (data) setBooks(data)
  }, [])

  const loadShares = useCallback(async () => {
    const { data } = await supabase.from('shares').select('*, members(name)').order('created_at', { ascending: false })
    if (data) setShares(data)
  }, [])

  const loadAlbums = useCallback(async () => {
    const { data } = await supabase.from('albums').select('*').order('created_at', { ascending: false })
    if (data) {
      const withCount = await Promise.all(data.map(async (a: Album) => {
        const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('album_id', a.id)
        // 대표 썸네일: cover_url이 없으면 첫 번째 사진 사용
        let cover = a.cover_url
        if (!cover) {
          const { data: first } = await supabase.from('photos').select('image_url').eq('album_id', a.id).order('created_at').limit(1)
          cover = first?.[0]?.image_url ?? null
        }
        return { ...a, photo_count: count ?? 0, cover_url: cover }
      }))
      setAlbums(withCount)
    }
  }, [])

  const loadPhotos = useCallback(async (albumId?: string) => {
    let query = supabase.from('photos').select('*').order('created_at', { ascending: true })
    if (albumId) query = query.eq('album_id', albumId)
    const { data } = await query
    if (data) setPhotos(data)
  }, [])

  useEffect(() => {
    loadMembers(); loadTodayMornings(); loadRecentMornings()
    loadEvents(); loadAllRsvps(); loadBooks(); loadShares(); loadAlbums(); loadPhotos()
  }, [loadMembers, loadTodayMornings, loadRecentMornings, loadEvents, loadAllRsvps, loadBooks, loadShares, loadAlbums, loadPhotos])


  // ── 꼬리달기 (참여 신청 / 취소) ────────────────────────
  const rsvpEvent = async (eventId: string) => {
    if (!selectedMember) { alert('먼저 조이조아 탭에서 이름을 선택해주세요!'); return }
    const { error } = await supabase.from('event_rsvps').insert({ event_id: eventId, member_id: selectedMember })
    if (error) { alert('참여 신청 실패: ' + error.message); return }
    await loadEventRsvps(eventId)
  }

  const cancelRsvp = async (eventId: string) => {
    if (!selectedMember) return
    const { error } = await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('member_id', selectedMember)
    if (error) { alert('취소 실패: ' + error.message); return }
    await loadEventRsvps(eventId)
  }

  const isRsvped = (eventId: string) => (eventRsvps[eventId] ?? []).some(r => r.member_id === selectedMember)

  // ── 도서 검색 (API 라우트 → fallback 직접 호출) ─────────
  const searchBooks = async () => {
    if (!bookQuery.trim()) return
    setBookSearching(true)
    try {
      // 먼저 API 라우트 시도
      let items = []
      try {
        const res = await fetch(`/api/books/search?q=${encodeURIComponent(bookQuery)}`)
        const data = await res.json()
        items = data.items ?? []
      } catch {
        // fallback: 직접 Google Books API 호출
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookQuery)}&maxResults=10&printType=books`)
        const data = await res.json()
        items = (data.items ?? []).map((item: Record<string, unknown>) => {
          const info = item.volumeInfo as Record<string, unknown>
          const imageLinks = info.imageLinks as Record<string, string> | undefined
          return {
            id: item.id, title: info.title ?? '', authors: (info.authors as string[]) ?? [],
            publisher: info.publisher ?? '', description: ((info.description as string) ?? '').slice(0, 100),
            thumbnail: imageLinks?.thumbnail ?? imageLinks?.smallThumbnail ?? '',
            link: info.infoLink ?? '',
          }
        })
      }
      setBookResults(items)
    } catch { setBookResults([]) }
    setBookSearching(false)
  }

  // ── 추천 도서에 추가 ───────────────────────────────────
  const addBookToRecommend = async (b: { title: string; authors: string[]; thumbnail: string; link: string; description: string }) => {
    await supabase.from('books').insert({
      title: b.title,
      author: b.authors.join(', '),
      description: b.description,
      cover_url: b.thumbnail,
      buy_link: b.link,
      color: '#7B5EA7',
    })
    await loadBooks()
    alert(`"${b.title}" 추천 도서에 추가했어요!`)
  }

  // ── 사진 업로드 (앨범 기반) ──────────────────────────────
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || !openAlbum) return
    setUploading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split('.').pop()
      const path = `${openAlbum.id}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('photos').upload(path, file)
      if (!error) {
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
        await supabase.from('photos').insert({
          album_id: openAlbum.id,
          album_title: openAlbum.title,
          image_url: urlData.publicUrl,
          uploaded_by: selectedMember || null,
        })
      }
    }
    await loadPhotos(openAlbum.id)
    await loadAlbums()
    setUploading(false)
    e.target.value = ''
  }

  // ── 앨범 생성 ──────────────────────────────────────────
  const createAlbum = async () => {
    if (!newAlbumTitle.trim()) return
    await supabase.from('albums').insert({ title: newAlbumTitle.trim(), created_by: selectedMember || null })
    setNewAlbumTitle('')
    setShowNewAlbum(false)
    await loadAlbums()
  }

  // ── 프로필 수정 ─────────────────────────────────────────
  const startEditProfile = (m: Member) => {
    setEditingProfile(m.id)
    setEditName(m.name)
    setEditNickname(m.nickname ?? '')
  }
  const saveProfile = async () => {
    if (!editingProfile || !editName.trim()) return
    const { error } = await supabase.from('members').update({ name: editName.trim(), nickname: editNickname.trim() || null }).eq('id', editingProfile)
    if (error) { alert('수정 실패: ' + error.message); return }
    setEditingProfile(null)
    // 전체 데이터 새로고침
    const { data } = await supabase.from('members').select('*').order('sort_order')
    if (data) setMembers(data)
    alert('수정 완료!')
  }

  // ── 모임 공유 ───────────────────────────────────────────
  const shareEvent = async (ev: Event) => {
    const d = new Date(ev.event_date)
    const dateStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
    const rsvps = eventRsvps[ev.id] ?? []
    const names = rsvps.map((r, i) => `${i+1}. ${rsvpName(r)}`).join('\n')
    const text = `📅 ${ev.title}\n📍 ${ev.place ?? '추후 공지'}\n🕐 ${dateStr}\n👥 참여 ${rsvps.length}/${ev.capacity}\n${ev.event_note ? `🎤 ${ev.event_note}\n` : ''}${ev.description ? `\n${ev.description}\n` : ''}\n${names ? `\n꼬리달기 현황:\n${names}` : ''}\n\n👉 참여 신청: ${window.location.href}`

    if (navigator.share) {
      try { await navigator.share({ title: ev.title, text }) } catch { /* 취소 */ }
    } else {
      await navigator.clipboard.writeText(text)
      alert('모임 정보가 복사되었어요! 카톡에 붙여넣기 하세요 📋')
    }
  }

  // ── 헬퍼 ──────────────────────────────────────────────
  const memberName = (id: string) => members.find(m => m.id === id)?.name ?? ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rsvpName = (r: Rsvp) => (r as any).members?.name ?? ''

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col" style={{ background: '#FAF8FF' }}>
      {/* ── 헤더 ── */}
      <header className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: '#7B5EA7' }}>조이조아</h1>
            <p className="text-xs text-gray-400 mt-0.5">JoyJoa · 따뜻한 연대의 아지트</p>
          </div>
          {selectedMember && (
            <button onClick={() => { setSelectedMember(''); localStorage.removeItem('joyjoa-member') }}
              className="flex items-center gap-2 hover:opacity-70 transition-all" title="다른 사람으로 변경">
              <span className="text-xs text-gray-500 font-medium">{memberName(selectedMember)}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#EDE6F5', color: '#7B5EA7' }}>
                {memberName(selectedMember)?.[0]}
              </div>
            </button>
          )}
        </div>
      </header>

      {/* ── 콘텐츠 ── */}
      <main className="flex-1 px-5 pb-24 overflow-y-auto">

        {/* ═══ 조이조아 (홈) ═══ */}
        {tab === 'home' && (
          <div>
            {/* 멤버 선택 */}
            {!selectedMember && (
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-purple-50 mb-5">
                <p className="font-black text-base mb-2" style={{ color: '#7B5EA7' }}>먼저 이름을 선택해주세요</p>
                <p className="text-xs text-gray-400 mb-3">한 번 선택하면 기억됩니다 (카톡 인앱 브라우저에서도 OK!)</p>
                <select value={selectedMember} onChange={e => setSelectedMember(e.target.value)}
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-[#7B5EA7]">
                  <option value="">-- 이름 선택 --</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}

            {/* 조모닝 현황 */}
            <div className="rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg, #7B5EA7, #A78BCA)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-black text-lg">☀️ 오늘의 조모닝</p>
                  <p className="text-white/70 text-sm mt-1">오늘 {todayMornings.length}명이 카톡에서 인사했어요</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-black text-2xl">{todayMornings.length}</span>
                </div>
              </div>
            </div>

            {/* 최근 5일 */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-purple-50 mb-5">
              <h3 className="font-black text-base mb-3" style={{ color: '#7B5EA7' }}>최근 조모닝 현황</h3>
              <div className="flex gap-2">
                {recentMornings.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="rounded-xl py-2 mb-1" style={{ background: i === 0 ? '#7B5EA7' : '#EDE6F5' }}>
                      <p className="font-black text-lg" style={{ color: i === 0 ? 'white' : '#7B5EA7' }}>{d.count}</p>
                    </div>
                    <p className="text-xs text-gray-400">{d.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 오늘 조모닝 명단 */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-purple-50 mb-5">
              <h3 className="font-black text-base mb-3" style={{ color: '#7B5EA7' }}>오늘의 조모닝 멤버</h3>
              <div className="flex flex-wrap gap-2">
                {todayMorningNames.length === 0 && <p className="text-sm text-gray-300">아직 아무도 인사하지 않았어요</p>}
                {todayMorningNames.map((n, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: '#EDE6F5', color: '#7B5EA7' }}>{n}</span>
                ))}
              </div>
            </div>

            {/* 다가오는 모임 */}
            {events.length > 0 && (
              <div className="rounded-2xl bg-white p-5 shadow-sm border border-purple-50">
                <h3 className="font-black text-base mb-3" style={{ color: '#4A8C6F' }}>다가오는 모임</h3>
                {events.slice(0, 2).map(ev => {
                  const d = new Date(ev.event_date)
                  const rsvps = eventRsvps[ev.id] ?? []
                  return (
                    <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: ev.color + '15' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: ev.color }}>{d.getDate()}</div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{ev.title}</p>
                        {ev.event_note && <p className="text-xs font-medium" style={{ color: '#4A8C6F' }}>🎤 {ev.event_note}</p>}
                        <p className="text-xs text-gray-400">{d.getMonth()+1}/{d.getDate()} · 참여 {rsvps.length}/{ev.capacity}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ 함께조아 ═══ */}
        {tab === 'members' && (
          <div>
            <h2 className="font-black text-xl mb-1" style={{ color: '#7B5EA7' }}>함께조아</h2>
            <p className="text-sm text-gray-400 mb-2">함께하는 {members.length}명의 소중한 가족</p>
            {selectedMember ? (
              <div className="rounded-xl px-4 py-2.5 mb-4 text-xs" style={{ background: '#EDE6F5', color: '#7B5EA7' }}>
                💡 내 이름 옆의 <span className="font-bold">수정</span> 버튼을 눌러 이름과 별명을 변경할 수 있어요
              </div>
            ) : (
              <div className="rounded-xl px-4 py-2.5 mb-4 text-xs bg-yellow-50 text-yellow-700">
                ⚠️ 조이조아 탭에서 먼저 이름을 선택하면 수정할 수 있어요
              </div>
            )}
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={m.id} className="rounded-xl bg-white border border-purple-50 shadow-sm">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: m.is_author ? '#7B5EA7' : '#EDE6F5', color: m.is_author ? 'white' : '#7B5EA7' }}>
                      {m.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{m.name}</p>
                      {m.nickname && <p className="text-xs text-gray-400">💬 {m.nickname}</p>}
                      {m.is_author && <p className="text-xs" style={{ color: '#7B5EA7' }}>✨ 작가님</p>}
                    </div>
                    {m.id === selectedMember && editingProfile !== m.id && (
                      <button onClick={() => startEditProfile(m)} className="text-xs px-2 py-1 rounded-lg border border-purple-200 text-[#7B5EA7] font-medium">수정</button>
                    )}
                    {m.id !== selectedMember && <span className="text-xs text-gray-300">#{i + 1}</span>}
                  </div>
                  {/* 수정 폼 */}
                  {editingProfile === m.id && (
                    <div className="px-3 pb-3 space-y-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">이름</label>
                        <input value={editName} onChange={e => setEditName(e.target.value)}
                          className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B5EA7]" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">별명 (카톡 대화명 등)</label>
                        <input value={editNickname} onChange={e => setEditNickname(e.target.value)} placeholder="선택사항"
                          className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7B5EA7]" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveProfile} className="flex-1 text-sm font-bold py-2 rounded-lg text-white" style={{ background: '#7B5EA7' }}>저장</button>
                        <button onClick={() => setEditingProfile(null)} className="flex-1 text-sm font-bold py-2 rounded-lg border border-gray-200 text-gray-500">취소</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 모임조아 (꼬리달기 고도화) ═══ */}
        {tab === 'events' && (
          <div>
            <h2 className="font-black text-xl mb-1" style={{ color: '#7B5EA7' }}>모임조아</h2>
            <p className="text-sm text-gray-400 mb-4">함께하면 더 즐거운 시간</p>
            {events.length === 0 && <p className="text-sm text-gray-300 text-center py-10">아직 등록된 모임이 없어요</p>}
            {events.map(ev => {
              const d = new Date(ev.event_date)
              const dateStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
              const rsvps = eventRsvps[ev.id] ?? []
              const myRsvp = isRsvped(ev.id)
              const confirmed = rsvps.slice(0, ev.capacity)
              const waitlist = rsvps.slice(ev.capacity)
              const isExpanded = expandedEvent === ev.id
              const isFull = rsvps.length >= ev.capacity

              return (
                <div key={ev.id} className="bg-white rounded-2xl shadow-sm border border-purple-50 mb-4 overflow-hidden">
                  {/* 헤더 */}
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: ev.color + '15' }}>{ev.emoji}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-black text-base">{ev.title}</h3>
                          <button onClick={() => shareEvent(ev)} title="카톡에 공유하기"
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 hover:bg-purple-50 transition-all" style={{ color: '#7B5EA7' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                            </svg>
                          </button>
                        </div>
                        {ev.place && <p className="text-sm text-gray-500 mt-1">📍 {ev.place}</p>}
                        <p className="text-sm text-gray-500">🕐 {dateStr}</p>
                        {ev.description && <p className="text-xs text-gray-400 mt-1">{ev.description}</p>}
                        {ev.event_note && (
                          <div className="mt-2 px-3 py-2 rounded-lg" style={{ background: '#4A8C6F15' }}>
                            <p className="text-xs font-bold" style={{ color: '#4A8C6F' }}>🎤 {ev.event_note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 참여 현황 바 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: ev.color }}>
                          참여 {Math.min(rsvps.length, ev.capacity)}/{ev.capacity}
                          {waitlist.length > 0 && <span className="text-gray-400"> · 대기 {waitlist.length}</span>}
                        </span>
                        <button onClick={() => setExpandedEvent(isExpanded ? null : ev.id)}
                          className="text-xs text-gray-400 font-medium">
                          {isExpanded ? '접기 ▲' : '명단 보기 ▼'}
                        </button>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (rsvps.length / ev.capacity) * 100)}%`, background: ev.color }} />
                      </div>
                    </div>
                    {/* 신청/취소 버튼 */}
                    <div className="mt-3">
                      {myRsvp ? (
                        <button onClick={() => cancelRsvp(ev.id)}
                          className="w-full text-sm font-bold py-2.5 rounded-xl border-2 transition-all"
                          style={{ borderColor: ev.color, color: ev.color, background: ev.color + '10' }}>
                          ✓ 참여 신청됨 (취소하기)
                        </button>
                      ) : (
                        <button onClick={() => rsvpEvent(ev.id)}
                          className="w-full text-sm font-bold py-2.5 rounded-xl text-white shadow-sm transition-all"
                          style={{ background: isFull ? '#999' : ev.color }}>
                          {isFull ? '대기자로 참여 신청' : '꼬리달기! 참여 신청'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 꼬리달기 명단 (확장) */}
                  {isExpanded && (
                    <div className="border-t border-purple-50 px-5 py-4" style={{ background: '#F8F5FF' }}>
                      {/* 확정 명단 */}
                      {confirmed.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-bold text-gray-400 mb-2">✅ 확정 명단</p>
                          <div className="space-y-1.5">
                            {confirmed.map((r, i) => (
                              <div key={r.id} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: ev.color }}>
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium flex-1">{rsvpName(r)}</span>
                                {r.member_id === selectedMember && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold">나</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* 대기자 명단 */}
                      {waitlist.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 mb-2">⏳ 대기자 명단</p>
                          <div className="space-y-1.5">
                            {waitlist.map((r, i) => (
                              <div key={r.id} className="flex items-center gap-2 opacity-70">
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-500">
                                  {i + 1}
                                </span>
                                <span className="text-sm font-medium flex-1">{rsvpName(r)}</span>
                                {r.member_id === selectedMember && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600 font-bold">나(대기)</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {rsvps.length === 0 && <p className="text-sm text-gray-300 text-center py-2">아직 신청자가 없어요. 첫 번째 꼬리를 달아보세요!</p>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ═══ 추억조아 (앨범 기반) ═══ */}
        {tab === 'photos' && !openAlbum && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ color: '#7B5EA7' }}>추억조아</h2>
                <p className="text-sm text-gray-400">함께한 순간들</p>
              </div>
              <button onClick={() => setShowNewAlbum(true)}
                className="text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#7B5EA7' }}>
                + 앨범 만들기
              </button>
            </div>
            {showNewAlbum && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-purple-50 mb-4">
                <input value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)}
                  placeholder="앨범 이름 (예: 4/6 간식봉사 모임)"
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:border-[#7B5EA7]" />
                <div className="flex gap-2">
                  <button onClick={createAlbum} className="flex-1 text-sm font-bold py-2 rounded-xl text-white" style={{ background: '#7B5EA7' }}>만들기</button>
                  <button onClick={() => { setShowNewAlbum(false); setNewAlbumTitle('') }} className="flex-1 text-sm font-bold py-2 rounded-xl border border-gray-200 text-gray-500">취소</button>
                </div>
              </div>
            )}
            {albums.length === 0 && !showNewAlbum && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">📸</p>
                <p className="text-gray-400 text-sm">아직 앨범이 없어요</p>
                <p className="text-gray-300 text-xs mt-1">첫 번째 앨범을 만들어보세요!</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {albums.map(album => (
                <button key={album.id} onClick={async () => { setOpenAlbum(album); await loadPhotos(album.id) }}
                  className="text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-purple-50 hover:shadow-md transition-all">
                  {album.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={album.cover_url} alt={album.title} className="w-full aspect-[4/3] object-cover" />
                  ) : (
                    <div className="w-full aspect-[4/3] flex items-center justify-center" style={{ background: '#EDE6F5' }}>
                      <span className="text-4xl">📷</span>
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-bold text-sm truncate">{album.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">사진 {album.photo_count}장</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === 'photos' && openAlbum && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { setOpenAlbum(null); loadAlbums() }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ background: '#EDE6F5', color: '#7B5EA7' }}>←</button>
              <div className="flex-1">
                <h2 className="font-black text-lg" style={{ color: '#7B5EA7' }}>{openAlbum.title}</h2>
                <p className="text-xs text-gray-400">{photos.length}장의 추억</p>
              </div>
              <button onClick={() => photoInput.current?.click()} disabled={uploading}
                className="text-xs font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50" style={{ background: '#7B5EA7' }}>
                {uploading ? '업로드 중...' : '+ 사진'}
              </button>
              <input ref={photoInput} type="file" accept="image/*" multiple className="hidden" onChange={uploadPhoto} />
            </div>
            {photos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">📸</p>
                <p className="text-gray-400 text-sm">아직 사진이 없어요</p>
                <p className="text-gray-300 text-xs mt-1">여러 장 한번에 올릴 수 있어요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.map(p => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.image_url} alt=""
                    className="w-full aspect-square object-cover rounded-xl" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ 소식조아 ═══ */}
        {tab === 'books' && (
          <div>
            <h2 className="font-black text-xl mb-1" style={{ color: '#7B5EA7' }}>소식조아</h2>
            <p className="text-sm text-gray-400 mb-4">도서를 검색하고 추천해보세요</p>

            {/* 검색 바 */}
            <div className="flex gap-2 mb-5">
              <input value={bookQuery} onChange={e => setBookQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchBooks()}
                placeholder="책 제목, 작가명 검색..."
                className="flex-1 border-2 border-purple-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7B5EA7]" />
              <button onClick={searchBooks} disabled={bookSearching}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-sm shrink-0 disabled:opacity-50"
                style={{ background: '#7B5EA7' }}>
                {bookSearching ? '...' : '검색'}
              </button>
            </div>

            {/* 검색 결과 */}
            {bookResults.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-400 mb-2">검색 결과 {bookResults.length}건</p>
                <div className="space-y-2">
                  {bookResults.map(b => (
                    <div key={b.id} className="flex gap-3 p-3 bg-white rounded-xl border border-purple-50 shadow-sm">
                      {b.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.thumbnail} alt={b.title} className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-sm" />
                      ) : (
                        <div className="w-14 h-20 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#EDE6F5' }}>
                          <span className="text-xl">📚</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate">{b.title}</h4>
                        <p className="text-xs mt-0.5" style={{ color: '#7B5EA7' }}>{b.authors.join(', ')}</p>
                        {b.publisher && <p className="text-xs text-gray-400 mt-0.5">{b.publisher}</p>}
                        <div className="flex gap-2 mt-2">
                          {b.link && (
                            <a href={b.link} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold px-3 py-1 rounded-lg border border-purple-200 text-[#7B5EA7] hover:bg-purple-50">
                              상세보기
                            </a>
                          )}
                          <button onClick={() => addBookToRecommend(b)}
                            className="text-xs font-bold px-3 py-1 rounded-lg text-white" style={{ background: '#7B5EA7' }}>
                            + 추천 추가
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DB에 저장된 추천 도서 */}
            {books.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">📚 추천 도서</p>
                {books.map(book => (
                  <div key={book.id} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-50 mb-3">
                    <div className="flex gap-4">
                      <div className="w-16 h-22 rounded-xl flex items-center justify-center shrink-0" style={{ background: book.color + '15' }}>
                        {book.cover_url
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-xl" />
                          : <span className="text-2xl">📕</span>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-base mb-1">{book.title}</h3>
                        <p className="text-xs font-medium mb-1" style={{ color: book.color }}>{book.author}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{book.description}</p>
                        {book.buy_link && (
                          <a href={book.buy_link} target="_blank" rel="noopener noreferrer"
                            className="text-xs font-bold px-4 py-1.5 rounded-lg text-white inline-block mt-2" style={{ background: book.color }}>
                            구매하기
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ 나눔조아 ═══ */}
        {tab === 'share' && (
          <div>
            <h2 className="font-black text-xl mb-1" style={{ color: '#7B5EA7' }}>나눔조아</h2>
            <p className="text-sm text-gray-400 mb-4">서로 나누면 더 커지는 기쁨</p>
            {shares.length === 0 && (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">🎁</p>
                <p className="text-gray-400 text-sm">아직 나눔이 없어요</p>
                <p className="text-gray-300 text-xs mt-1">첫 번째 나눔을 시작해보세요!</p>
              </div>
            )}
            {shares.map(item => {
              const isActive = item.status === '나눔중'
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sharedBy = (item as any).members?.name ?? ''
              return (
                <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm border border-purple-50 mb-3 ${!isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-black text-base">{item.title}</h3>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: isActive ? '#4A8C6F20' : '#eee', color: isActive ? '#4A8C6F' : '#bbb' }}>{item.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{item.description}</p>
                  {sharedBy && <p className="text-xs text-gray-400">🙋 {sharedBy}</p>}
                </div>
              )
            })}
          </div>
        )}
        {/* ═══ 저작권 ═══ */}
        <div className="text-center py-6 mt-8">
          <p className="text-xs text-gray-300">© 2026 조이조아 · All rights reserved.</p>
          <p className="text-xs text-gray-300 mt-0.5">홈페이지 제작 · <span style={{ color: '#A78BCA' }}>꿈식판 꿈식맨</span></p>
        </div>
      </main>

      {/* ── 하단 탭 바 ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-100 z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all"
              style={{ color: tab === t.id ? '#7B5EA7' : '#bbb' }}>
              <span className="text-lg">{t.icon}</span>
              <span className="text-[10px] font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
