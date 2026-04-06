-- ═══ 봉사활동 기록 테이블 ═══
CREATE TABLE IF NOT EXISTS volunteer_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  log_date DATE NOT NULL,
  summary TEXT,
  content TEXT,
  created_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE volunteer_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read volunteer_logs" ON volunteer_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert volunteer_logs" ON volunteer_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update volunteer_logs" ON volunteer_logs FOR UPDATE USING (true);

-- ═══ 첫 봉사 기록 ═══
INSERT INTO volunteer_logs (title, log_date, summary, content) VALUES (
  '조이조아 에듀존 봉사 활동',
  '2026-04-06',
  '에듀존 지역아동센터 간식 바구니 전달 및 영어 교육 지원 방안 논의',
  '## 에듀존은 어떤 곳?
- 2010년 개원한 지역 아동센터
- 방과후~보호자 귀가까지 아이들을 돌보는 기관 (학습, 돌봄, 급식, 문화 체험)
- 2004년 법제화로 동네 공부방이 체계화
- 처음에는 취약 계층 대상 → 현재 다둥이 가정 등 모든 아이들 이용 가능
- 무료 이용 가능 (국가 운영비 지원, 시설비 수준)
- 프로그램 운영에는 후원이 필요

## 센터장님 말씀
- "선물을 구성하며 많이 고심하셨을 걸 생각하니 몹시 감사하다"
- 프리미엄 돌봄 서비스 고안 중
- 높은 수준의 영어 교육 제공 방안 모색 중

## 영어 교육 지원 아이디어
- **라떼우유님**: 봉사활동 원하는 영어학원 원장님들 연결 가능, 온라인 학습 활용
- **위드웬디님**: EBS 교재 매일 10분 읽기 추천, 선생님이 잡아주시면 효과적
- **꿈일님**: 수학 선생님이 단어 등 읽기를 확인·체크하면 좋겠음. 초등 영어는 싱크빅 활용
- **지원님**: Oxford Phonics(저학년), Bricks(3~6학년), Subject Link(중학생 이상) 추천. QR로 읽기 가능, 비전문가도 쉽게 가르칠 수 있음

## 추천 자료
- 유튜브 **알파블럭스** (파닉스 학습)
- 수학은 사회복지사 실습생, 학부모님 등 교육 가능

## 참여자
Joy1004, 비티오, 윤지연, 꿈꾸는 일상, 행복한금작가, 신지원, 무공, 위드웬디, 사유하, 꾸미루미, 라떼우유, 꿈식맨, 검마사 (총 13명)'
);
