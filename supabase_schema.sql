-- ═══ 조이조아 DB 스키마 ═══

-- 1. 멤버
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nickname TEXT,
  is_author BOOLEAN DEFAULT false,
  avatar_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 조모닝 (매일 인사)
CREATE TABLE mornings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, date)
);

-- 3. 모임일정
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  place TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  capacity INT DEFAULT 20,
  emoji TEXT DEFAULT '📅',
  color TEXT DEFAULT '#7B6CA5',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. 모임 참여 신청
CREATE TABLE event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, member_id)
);

-- 5. 모임사진
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. 신간소식
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  buy_link TEXT,
  color TEXT DEFAULT '#E8846B',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. 나눔
CREATE TABLE shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  shared_by UUID REFERENCES members(id),
  status TEXT DEFAULT '나눔중' CHECK (status IN ('나눔중', '나눔완료')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ RLS (Row Level Security) ═══
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE mornings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- 모든 테이블 읽기 허용 (공개 커뮤니티)
CREATE POLICY "Anyone can read members" ON members FOR SELECT USING (true);
CREATE POLICY "Anyone can read mornings" ON mornings FOR SELECT USING (true);
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Anyone can read event_rsvps" ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Anyone can read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Anyone can read books" ON books FOR SELECT USING (true);
CREATE POLICY "Anyone can read shares" ON shares FOR SELECT USING (true);

-- 쓰기도 임시 허용 (추후 인증 추가 시 변경)
CREATE POLICY "Anyone can insert mornings" ON mornings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert event_rsvps" ON event_rsvps FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert photos" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert shares" ON shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update shares" ON shares FOR UPDATE USING (true);

-- ═══ 초기 멤버 데이터 삽입 ═══
INSERT INTO members (name, is_author, sort_order) VALUES
  ('이석훈', false, 1),
  ('가밀라', false, 2),
  ('강형만', false, 3),
  ('김기훈', false, 4),
  ('김복희', false, 5),
  ('김한욱(리치아빠)', false, 6),
  ('김형희', false, 7),
  ('꽃피랑', false, 8),
  ('꾸미조아', false, 9),
  ('나유미', false, 10),
  ('뉴질랜드새댁', false, 11),
  ('리더그릿 김미진님', false, 12),
  ('무공 김낙범', false, 13),
  ('문원식(코치 아마토르)', false, 14),
  ('민선미', false, 15),
  ('박수용', false, 16),
  ('박유하', false, 17),
  ('박재현', false, 18),
  ('배재희', false, 19),
  ('비티오님', false, 20),
  ('사유숲', false, 21),
  ('솔솔~~여행은 덤!', false, 22),
  ('신지원', false, 23),
  ('신현섭', false, 24),
  ('아론', false, 25),
  ('안성현', false, 26),
  ('오제용', false, 27),
  ('왕명옥(라임향기)', false, 28),
  ('은영', false, 29),
  ('전수현(다정다감)', false, 30),
  ('정다은(Alice)', false, 31),
  ('조이천사 조남희 작가님', true, 0),
  ('즐거운호호씨 김인회님', false, 33),
  ('지금, 여기♡♡', false, 34),
  ('지혜로운숲(혜림)', false, 35),
  ('진강', false, 36),
  ('최은화', false, 37),
  ('한기숙(종하&윤하)', false, 38),
  ('한끼방패 최명국님', false, 39),
  ('혜림', false, 40),
  ('홍성원', false, 41),
  ('홍성호(검마사)', false, 42),
  ('홍은주', false, 43),
  ('Aram', false, 44),
  ('J', false, 45),
  ('latte', false, 46),
  ('Wendy', false, 47),
  ('Y. Hwang', false, 48),
  ('ㅡ김종희-', false, 49);

-- ═══ 초기 도서 데이터 ═══
INSERT INTO books (title, author, description, color) VALUES
  ('오늘부터 자아실현 꽃피우자!', '조남희(JOY)', '대학기에서 노년기까지 행복한 나를 만드는 가이드 북', '#E8846B'),
  ('흔들리는 삶 속에서 찾아가는 진정한 나', '조남희', '23년 이상 경력, 3,300회 이상 세션 경험의 상담 전문가', '#7B6CA5');

-- ═══ Storage 버킷 (Supabase Dashboard에서 생성) ═══
-- photos 버킷: 모임사진 업로드용
-- avatars 버킷: 프로필 사진용
