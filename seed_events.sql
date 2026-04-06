-- ═══ 대화 내용 기반 일정 기록 ═══

-- 4/1 조이천사님 라디오 방송
INSERT INTO events (title, description, place, event_date, capacity, emoji, color) VALUES
(
  '대전 극동방송 라디오 출연',
  '조이천사 조남희 작가님의 "사랑의 뜰안" 가사심리분석 연구소 코너 진행',
  '대전 극동방송 (YouTube 라이브)',
  '2026-04-01 09:40:00+09',
  50, '📻', '#E8846B'
);

-- 4/6 아이들 간식후원 모임 (봉사)
INSERT INTO events (title, description, place, event_date, capacity, emoji, color) VALUES
(
  '아이들 간식후원 봉사 모임',
  '에듀존 학생들에게 학용품과 간식 바구니 전달. 간식 바구니를 함께 만들어요!',
  '로카우스 뷔페',
  '2026-04-06 11:30:00+09',
  20, '🤝', '#5B9A6B'
);

-- 4/6 봉사 참여자 꼬리달기 (대화에서 확인된 13명)
-- 참여자: Joy1004, 비티오, 윤지연, 꿈꾸는 일상, 행복한금작가, 신지원, 무공, 위드웬디, 사유하, 꾸미루미, 라떼우유, 꿈식맨, 검마사
DO $$
DECLARE
  v_event_id UUID;
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '조이천사 조남희 작가님',
    '신지원',
    '이석훈',
    '홍성호(검마사)'
  ];
  v_name TEXT;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE title = '아이들 간식후원 봉사 모임' LIMIT 1;
  IF v_event_id IS NOT NULL THEN
    FOREACH v_name IN ARRAY v_names LOOP
      SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
      IF v_member_id IS NOT NULL THEN
        INSERT INTO event_rsvps (event_id, member_id) VALUES (v_event_id, v_member_id) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 4/12 독서 모임 (예정)
INSERT INTO events (title, description, place, event_date, capacity, emoji, color) VALUES
(
  '4월 독서 모임',
  '이달의 추천 도서를 함께 읽고 이야기 나눠요',
  '추후 공지',
  '2026-04-12 14:00:00+09',
  15, '📖', '#7B6CA5'
);

-- 4/25 조이조아 정기 모임
INSERT INTO events (title, description, place, event_date, capacity, emoji, color) VALUES
(
  '4월 조이조아 정기 모임',
  '조이조아 식구들의 정기 모임. 반갑게 만나요!',
  '추후 공지',
  '2026-04-25 14:00:00+09',
  30, '🌸', '#E8846B'
);

-- ═══ 조모닝 기록 (대화에서 추출) ═══
-- 4/1 조모닝 참여자
DO $$
DECLARE
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '오제용','조이천사 조남희 작가님','이석훈','뉴질랜드새댁','홍성호(검마사)',
    '김복희','정다은(Alice)','Wendy','꽃피랑','왕명옥(라임향기)','배재희','김형희'
  ];
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY v_names LOOP
    SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO mornings (member_id, date) VALUES (v_member_id, '2026-04-01') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 4/2 조모닝 참여자
DO $$
DECLARE
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '오제용','조이천사 조남희 작가님','뉴질랜드새댁','홍성호(검마사)','이석훈',
    '진강','김복희','왕명옥(라임향기)','KIM MI JIN','김기훈','전수현(다정다감)',
    '꽃피랑','배재희'
  ];
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY v_names LOOP
    SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO mornings (member_id, date) VALUES (v_member_id, '2026-04-02') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 4/3 조모닝 참여자
DO $$
DECLARE
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '오제용','뉴질랜드새댁','홍성호(검마사)','KIM MI JIN','조이천사 조남희 작가님',
    'J','김복희','김기훈','꽃피랑','배재희','Wendy','왕명옥(라임향기)',
    '정다은(Alice)'
  ];
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY v_names LOOP
    SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO mornings (member_id, date) VALUES (v_member_id, '2026-04-03') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 4/4 조모닝 참여자
DO $$
DECLARE
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '오제용','조이천사 조남희 작가님','이석훈','홍성호(검마사)','김복희',
    '전수현(다정다감)','뉴질랜드새댁','J','Wendy','김형희','꽃피랑','배재희'
  ];
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY v_names LOOP
    SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO mornings (member_id, date) VALUES (v_member_id, '2026-04-04') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 4/5 조모닝 참여자
DO $$
DECLARE
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '조이천사 조남희 작가님','오제용','이석훈','홍성호(검마사)','김복희',
    'J','배재희','정다은(Alice)','꾸미조아','김기훈','전수현(다정다감)',
    '뉴질랜드새댁'
  ];
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY v_names LOOP
    SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO mornings (member_id, date) VALUES (v_member_id, '2026-04-05') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- 4/6 조모닝 참여자
DO $$
DECLARE
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '조이천사 조남희 작가님','오제용','홍성호(검마사)','이석훈',
    '김복희','뉴질랜드새댁','왕명옥(라임향기)','KIM MI JIN',
    '전수현(다정다감)','J','꽃피랑','배재희'
  ];
  v_name TEXT;
BEGIN
  FOREACH v_name IN ARRAY v_names LOOP
    SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO mornings (member_id, date) VALUES (v_member_id, '2026-04-06') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
