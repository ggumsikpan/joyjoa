'use client'

import { useState } from 'react'

// ── 멤버 데이터 (카톡 오픈채팅 49명) ────────────────────
const MEMBERS = [
  '이석훈','가밀라','강형만','김기훈','김복희','김한욱(리치아빠)','김형희','꽃피랑',
  '꾸미조아','나유미','뉴질랜드새댁','리더그릿 김미진님','무공 김낙범','문원식(코치 아마토르)',
  '민선미','박수용','박유하','박재현','배재희','비티오님','사유숲','솔솔~~여행은 덤!',
  '신지원','신현섭','아론','안성현','오제용','왕명옥(라임향기)','은영','전수현(다정다감)',
  '정다은(Alice)','조이천사 조남희 작가님','즐거운호호씨 김인회님','지금, 여기♡♡',
  '지혜로운숲(혜림)','진강','최은화','한기숙(종하&윤하)','한끼방패 최명국님','혜림',
  '홍성원','홍성호(검마사)','홍은주','Aram','J','latte','Wendy','Y. Hwang','ㅡ김종희-',
]

// ── 탭 정의 ─────────────────────────────────────────────
type TabId = 'home' | 'members' | 'events' | 'photos' | 'books' | 'share'
const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'home', icon: '🏠', label: '조이조아' },
  { id: 'members', icon: '👥', label: '함께조아' },
  { id: 'events', icon: '📅', label: '모임조아' },
  { id: 'photos', icon: '📸', label: '추억조아' },
  { id: 'books', icon: '📚', label: '소식조아' },
  { id: 'share', icon: '🎁', label: '나눔조아' },
]

// ── 조모닝 Mock 데이터 ──────────────────────────────────
const MOCK_MORNING = [
  { date: '4/6', count: 12, names: ['조이천사 조남희 작가님','이석훈','김복희','꽃피랑','나유미'] },
  { date: '4/5', count: 18, names: ['이석훈','김형희','박수용','안성현'] },
  { date: '4/4', count: 15, names: ['가밀라','김기훈','배재희'] },
  { date: '4/3', count: 20, names: ['홍성원','진강','최은화'] },
  { date: '4/2', count: 11, names: ['신지원','오제용'] },
]

export default function Page() {
  const [tab, setTab] = useState<TabId>('home')
  const [morningDone, setMorningDone] = useState(false)

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col" style={{ background: '#FFF9F5' }}>
      {/* ── 헤더 ── */}
      <header className="px-5 pt-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: '#E8846B' }}>조이조아</h1>
            <p className="text-xs text-gray-400 mt-0.5">JoyJoa · 따뜻한 연대의 아지트</p>
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: '#F5E6DF' }}>
            🌸
          </div>
        </div>
      </header>

      {/* ── 콘텐츠 ── */}
      <main className="flex-1 px-5 pb-24 overflow-y-auto">

        {/* ═══ 홈 (조모닝 대시보드) ═══ */}
        {tab === 'home' && (
          <div>
            {/* 조모닝 버튼 */}
            <div className="rounded-2xl p-6 text-center mb-5"
              style={{ background: 'linear-gradient(135deg, #E8846B, #F5A891)' }}>
              <p className="text-white/80 text-sm mb-2">오늘도 좋은 아침!</p>
              <button onClick={() => setMorningDone(true)} disabled={morningDone}
                className="bg-white font-black text-lg px-8 py-3 rounded-2xl shadow-lg transition-all disabled:opacity-60"
                style={{ color: '#E8846B' }}>
                {morningDone ? '✅ 조모닝 완료!' : '☀️ 조모닝!'}
              </button>
              <p className="text-white/70 text-xs mt-2">오늘 {morningDone ? 13 : 12}명이 인사했어요</p>
            </div>

            {/* 최근 5일 현황 */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-50 mb-5">
              <h3 className="font-black text-base mb-3" style={{ color: '#E8846B' }}>최근 조모닝 현황</h3>
              <div className="flex gap-2">
                {MOCK_MORNING.map((d, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="rounded-xl py-2 mb-1" style={{ background: i === 0 ? '#E8846B' : '#F5E6DF' }}>
                      <p className="font-black text-lg" style={{ color: i === 0 ? 'white' : '#E8846B' }}>{d.count}</p>
                    </div>
                    <p className="text-xs text-gray-400">{d.date}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 오늘의 조모닝 명단 */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-50 mb-5">
              <h3 className="font-black text-base mb-3" style={{ color: '#E8846B' }}>오늘의 조모닝 멤버</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_MORNING[0].names.map((n, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: '#F5E6DF', color: '#E8846B' }}>{n}</span>
                ))}
                {morningDone && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">나 ✓</span>
                )}
              </div>
            </div>

            {/* 다가오는 모임 */}
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-orange-50">
              <h3 className="font-black text-base mb-3" style={{ color: '#7B6CA5' }}>다가오는 모임</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F0FF' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: '#7B6CA5' }}>12</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">4월 독서 모임</p>
                    <p className="text-xs text-gray-400">4/12 (토) 14:00 · 참여 8/15</p>
                  </div>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: '#7B6CA5' }}>신청</button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#FFF5F0' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white" style={{ background: '#E8846B' }}>19</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">봉사활동 (양로원 방문)</p>
                    <p className="text-xs text-gray-400">4/19 (토) 10:00 · 참여 5/20</p>
                  </div>
                  <button className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: '#E8846B' }}>신청</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ 식구들 ═══ */}
        {tab === 'members' && (
          <div>
            <h2 className="font-black text-xl mb-1" style={{ color: '#E8846B' }}>조이조아 식구들</h2>
            <p className="text-sm text-gray-400 mb-4">함께하는 {MEMBERS.length}명의 소중한 가족</p>
            <div className="space-y-2">
              {MEMBERS.map((name, i) => {
                const isAuthor = name.includes('조남희')
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-orange-50 shadow-sm">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: isAuthor ? '#E8846B' : '#F5E6DF', color: isAuthor ? 'white' : '#E8846B' }}>
                      {name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{name}</p>
                      {isAuthor && <p className="text-xs" style={{ color: '#E8846B' }}>✨ 작가님</p>}
                    </div>
                    <span className="text-xs text-gray-300">#{i + 1}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══ 모임일정 ═══ */}
        {tab === 'events' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ color: '#E8846B' }}>모임일정</h2>
                <p className="text-sm text-gray-400">함께하면 더 즐거운 시간</p>
              </div>
              <button className="text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#E8846B' }}>+ 모임 만들기</button>
            </div>
            {[
              { title: '4월 독서 모임', date: '4/12 (토) 14:00', place: '강남 스터디카페', cap: '8/15', color: '#7B6CA5', emoji: '📖' },
              { title: '봉사활동 (양로원 방문)', date: '4/19 (토) 10:00', place: '서울 은평구', cap: '5/20', color: '#E8846B', emoji: '🤝' },
              { title: '조남희 작가 북토크', date: '4/26 (토) 15:00', place: '종로 교보문고', cap: '12/30', color: '#5B9A6B', emoji: '🎤' },
            ].map((ev, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: ev.color + '15' }}>{ev.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-black text-base">{ev.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">📍 {ev.place}</p>
                    <p className="text-sm text-gray-500">🕐 {ev.date}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: ev.color + '20', color: ev.color }}>
                        참여 {ev.cap}
                      </span>
                      <button className="text-sm font-bold px-5 py-2 rounded-xl text-white shadow-sm" style={{ background: ev.color }}>
                        참여 신청
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ 모임사진 ═══ */}
        {tab === 'photos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ color: '#E8846B' }}>모임사진</h2>
                <p className="text-sm text-gray-400">함께한 순간들</p>
              </div>
              <button className="text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#E8846B' }}>+ 사진 올리기</button>
            </div>
            {/* 앨범 카드 */}
            {[
              { title: '3월 독서 모임', date: '2026.03.15', count: 12 },
              { title: '봄맞이 소풍', date: '2026.03.22', count: 24 },
              { title: '조남희 작가 사인회', date: '2026.03.29', count: 18 },
            ].map((album, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-orange-50 mb-3">
                <div className="grid grid-cols-3 gap-1 mb-3 rounded-xl overflow-hidden">
                  {[0,1,2].map(j => (
                    <div key={j} className="aspect-square" style={{ background: ['#F5E6DF','#E8D5F5','#D5E8F5'][j] }}>
                      <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">📷</div>
                    </div>
                  ))}
                </div>
                <h3 className="font-bold text-sm">{album.title}</h3>
                <p className="text-xs text-gray-400">{album.date} · 사진 {album.count}장</p>
              </div>
            ))}
          </div>
        )}

        {/* ═══ 신간소식 ═══ */}
        {tab === 'books' && (
          <div>
            <h2 className="font-black text-xl mb-1" style={{ color: '#E8846B' }}>신간소식</h2>
            <p className="text-sm text-gray-400 mb-4">조이조아 작가들의 새 책</p>
            {[
              { title: '오늘부터 자아실현 꽃피우자!', author: '조남희(JOY)', desc: '대학기에서 노년기까지 행복한 나를 만드는 가이드 북', color: '#E8846B' },
              { title: '흔들리는 삶 속에서 찾아가는 진정한 나', author: '조남희', desc: '23년 이상 경력, 3,300회 이상 세션 경험', color: '#7B6CA5' },
            ].map((book, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-orange-50 mb-3">
                <div className="flex gap-4">
                  <div className="w-20 h-28 rounded-xl flex items-center justify-center shrink-0" style={{ background: book.color + '15' }}>
                    <span className="text-3xl">📕</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-base mb-1">{book.title}</h3>
                    <p className="text-xs font-medium mb-1" style={{ color: book.color }}>{book.author}</p>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{book.desc}</p>
                    <button className="text-xs font-bold px-4 py-1.5 rounded-lg text-white" style={{ background: book.color }}>
                      구매하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ 나눔조아 ═══ */}
        {tab === 'share' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-black text-xl" style={{ color: '#E8846B' }}>나눔조아</h2>
                <p className="text-sm text-gray-400">서로 나누면 더 커지는 기쁨</p>
              </div>
              <button className="text-xs font-bold px-4 py-2 rounded-xl text-white" style={{ background: '#E8846B' }}>+ 나눔 올리기</button>
            </div>
            {[
              { title: '📖 읽은 책 나눔합니다', author: '김복희', desc: '자기계발서 3권 세트, 상태 깨끗해요!', status: '나눔중', color: '#5B9A6B' },
              { title: '🌱 화분 나눔해요', author: '꽃피랑', desc: '다육이 2개, 직접 키운 건강한 아이들', status: '나눔중', color: '#5B9A6B' },
              { title: '✏️ 노트/다이어리 나눔', author: '나유미', desc: '미사용 노트 5권, 선착순 가져가세요', status: '나눔완료', color: '#bbb' },
              { title: '🎨 미술용품 나눔', author: '조이천사 조남희 작가님', desc: '색연필 세트, 수채화 물감 나눔합니다', status: '나눔중', color: '#5B9A6B' },
            ].map((item, i) => (
              <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border border-orange-50 mb-3 ${item.status === '나눔완료' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-black text-base">{item.title}</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: item.color + '20', color: item.color }}>{item.status}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{item.desc}</p>
                <p className="text-xs text-gray-400">🙋 {item.author}</p>
                {item.status === '나눔중' && (
                  <button className="w-full text-sm font-bold py-2.5 rounded-xl text-white mt-3" style={{ background: '#E8846B' }}>
                    나눔 신청하기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── 하단 탭 바 ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 z-50">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all"
              style={{ color: tab === t.id ? '#E8846B' : '#bbb' }}>
              <span className="text-lg">{t.icon}</span>
              <span className="text-[10px] font-bold">{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
