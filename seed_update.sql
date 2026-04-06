-- ═══ 기존 일정 전부 삭제 ═══
DELETE FROM event_rsvps;
DELETE FROM events;

-- ═══ 6/27 조이조아 모임 추가 ═══
INSERT INTO events (title, description, place, event_date, capacity, emoji, color) VALUES
(
  '6월 조이조아 모임',
  '이번에는 지원씨가 밥을 사주신다고 해요💕 너무너무 감사드립니다!!',
  '로카우스 호텔 아페티',
  '2026-06-27 12:00:00+09',
  15, '🍽️', '#7B5EA7'
);

-- ═══ 꼬리달기 10명 ═══
DO $$
DECLARE
  v_event_id UUID;
  v_member_id UUID;
  v_names TEXT[] := ARRAY[
    '조이천사 조남희 작가님',
    '신지원',
    '배재희',
    '이석훈',
    '박유하',
    '김한욱(리치아빠)',
    '홍성호(검마사)'
  ];
  v_name TEXT;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE title = '6월 조이조아 모임' LIMIT 1;
  IF v_event_id IS NOT NULL THEN
    FOREACH v_name IN ARRAY v_names LOOP
      SELECT id INTO v_member_id FROM members WHERE name = v_name LIMIT 1;
      IF v_member_id IS NOT NULL THEN
        INSERT INTO event_rsvps (event_id, member_id) VALUES (v_event_id, v_member_id) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END $$;

-- ═══ 멤버 닉네임(카톡 표시명) 매핑 ═══
-- 카톡에서 쓰는 이름과 DB 이름이 다른 경우 nickname에 저장
UPDATE members SET nickname = 'Joy1004' WHERE name = '조이천사 조남희 작가님';
UPDATE members SET nickname = '열번째봄' WHERE name = '배재희';
UPDATE members SET nickname = '꿈식맨' WHERE name = '이석훈';
UPDATE members SET nickname = '검마사' WHERE name = '홍성호(검마사)';
UPDATE members SET nickname = '리치아빠' WHERE name = '김한욱(리치아빠)';
UPDATE members SET nickname = '라떼우유' WHERE name = 'latte';
UPDATE members SET nickname = '에뜨왈' WHERE name = '오제용';
UPDATE members SET nickname = '나르샤킴' WHERE name = '김복희';
UPDATE members SET nickname = '한여사' WHERE name = '뉴질랜드새댁';
UPDATE members SET nickname = '솔솔은정' WHERE name = '솔솔~~여행은 덤!';
UPDATE members SET nickname = '리더그릿' WHERE name = 'KIM MI JIN';
UPDATE members SET nickname = '위드웬디' WHERE name = 'Wendy';
UPDATE members SET nickname = '앨리스샘' WHERE name = '정다은(Alice)';
UPDATE members SET nickname = '무공' WHERE name = '무공 김낙범';
UPDATE members SET nickname = '라임향기' WHERE name = '왕명옥(라임향기)';
UPDATE members SET nickname = '다정다감' WHERE name = '전수현(다정다감)';
UPDATE members SET nickname = '방패' WHERE name = '한끼방패 최명국님';
UPDATE members SET nickname = '금작가' WHERE name = '김형희';
UPDATE members SET nickname = '데미안' WHERE name = '진강';
UPDATE members SET nickname = '생각쟁2' WHERE name = 'J';
UPDATE members SET nickname = '사유하' WHERE name = '사유숲';
UPDATE members SET nickname = '꾸미루미' WHERE name = '꾸미조아';
