'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

// ── 타입 ─────────────────────────────────────────────────
type Member = { id: string; name: string; is_author: boolean; sort_order: number }
type Morning = { id: string; member_id: string; date: string }
type Rsvp = { id: string; event_id: string; member_id: string; created_at: string; members?: { name: string } }
type Event = { id: string; title: string; description: string; place: string; event_date: string; capacity: number; emoji: string; color: string }
type Book = { id: string; title: string; author: string; description: string; cover_url: string; buy_link: string; color: string }
type Share = { id: string; title: string; description: string; status: string; created_at: string; shared_by: string; members?: { name: string } }
type Photo = { id: string; album_title: string; image_url: string; created_at: string }

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
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [uploading, setUploading] = useState(false)
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

  const loadPhotos = useCallback(async () => {
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    if (data) setPhotos(data)
  }, [])

  useEffect(() => {
    loadMembers(); loadTodayMornings(); loadRecentMornings()
    loadEvents(); loadAllRsvps(); loadBooks(); loadShares(); loadPhotos()
  }, [loadMembers, loadTodayMornings, loadRecentMornings, loadEvents, loadAllRsvps, loadBooks, loadShares, loadPhotos])


  // ── 꼬리달기 (참여 신청 / 취소) ────────────────────────
  const rsvpEvent = async (eventId: string) => {
    if (!selectedMember) { alert('먼저 조이조아 탭에서 이름을 선택해주세요!'); return }
    await supabase.from('event_rsvps').insert({ event_id: eventId, member_id: selectedMember })
    await loadEventRsvps(eventId)
  }

  const cancelRsvp = async (eventId: string) => {
    if (!selectedMember) return
    await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('member_id', selectedMember)
    await loadEventRsvps(eventId)
  }

  const isRsvped = (eventId: string) => (eventRsvps[eventId] ?? []).some(r => r.member_id === selectedMember)

  // ── 사진 업로드 ────────────────────────────────────────
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('photos').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
      await supabase.from('photos').insert({
        album_title: '모임 사진',
        image_url: urlData.publicUrl,
        uploaded_by: selectedMember || null,
      })
      await loadPhotos()
    }
    setUploading(false)
    e.target.value = ''
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
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">{memberName(selectedMember)}</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: '#EDE6F5', color: '#7B5EA7' }}>
                {memberName(selectedMember)?.[0]}
              </div>
            </div>
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
            <p className="text-sm text-gray-400 mb-4">함께하는 {members.length}명의 소중한 가족</p>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-purple-50 shadow-sm">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: m.is_author ? '#7B5EA7' : '#EDE6F5', color: m.is_author ? 'white' : '#7B5EA7' }}>
                    {m.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{m.name}</p>
                    {m.is_author && <p className="text-xs" style={{ color: '#7B5EA7' }}>✨ 작가님</p>}
                  </div>
                  <span className="text-xs text-gray-300">#{i + 1}</span>
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
                        <h3 className="font-black text-base">{ev.title}</h3>
                        {ev.place && <p className="text-sm text-gray-500 mt-1">📍 {ev.place}</p>}
                        <p className="text-sm text-gray-500">🕐 {dateStr}</p>
                        {ev.description && <p className="text-xs text-gray-400 mt-1">{ev.description}</p>}
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

        {/* ═══ 추억조아 (사진 업로드) ═══ */}
        {tab === 'photos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ color: '#7B5EA7' }}>추억조아</h2>
                <p className="text-sm text-gray-400">함께한 순간들</p>
              </div>
              <button onClick={() => photoInput.current?.click()} disabled={uploading}
                className="text-xs font-bold px-4 py-2 rounded-xl text-white disabled:opacity-50" style={{ background: '#7B5EA7' }}>
                {uploading ? '업로드 중...' : '+ 사진 올리기'}
              </button>
              <input ref={photoInput} type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
            </div>

            {photos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-3">📸</p>
                <p className="text-gray-400 text-sm">아직 사진이 없어요</p>
                <p className="text-gray-300 text-xs mt-1">첫 번째 추억을 남겨보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.map(p => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.image_url} alt={p.album_title}
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
            <p className="text-sm text-gray-400 mb-4">조이조아 작가들의 새 책</p>
            {books.map(book => (
              <div key={book.id} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-50 mb-3">
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-xl flex items-center justify-center shrink-0" style={{ background: book.color + '15' }}>
                    {book.cover_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover rounded-xl" />
                      : <span className="text-3xl">📕</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-base mb-1">{book.title}</h3>
                    <p className="text-xs font-medium mb-1" style={{ color: book.color }}>{book.author}</p>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{book.description}</p>
                    {book.buy_link && (
                      <a href={book.buy_link} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-bold px-4 py-1.5 rounded-lg text-white inline-block" style={{ background: book.color }}>
                        구매하기
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
