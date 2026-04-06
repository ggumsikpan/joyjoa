-- ═══ 앨범 테이블 추가 ═══
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Anyone can insert albums" ON albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update albums" ON albums FOR UPDATE USING (true);

-- photos 테이블에 album_id 컬럼 추가
ALTER TABLE photos ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES albums(id) ON DELETE CASCADE;

-- photos 테이블 쓰기 정책 추가 (앨범 기반)
CREATE POLICY "Anyone can insert photos" ON photos FOR INSERT WITH CHECK (true);

-- events 테이블에 event_note 컬럼 추가
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_note TEXT;

-- 6월 모임 이벤트 노트 추가
UPDATE events SET event_note = '비체 박유하님 경제 특강' WHERE title = '6월 조이조아 모임';

-- 첫 번째 앨범 생성
INSERT INTO albums (title, description) VALUES
('4/6 간식봉사 모임', '에듀존 학생들에게 학용품과 간식 바구니 전달 봉사');
