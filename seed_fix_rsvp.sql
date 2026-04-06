-- ═══ 꼬리달기 누락 3명 수정 ═══

-- 비티오님 → 닉네임 비티오 매핑
UPDATE members SET nickname = '비티오' WHERE name = '비티오님';

-- 사유숲 → 닉네임 사유하 매핑
UPDATE members SET nickname = '사유하' WHERE name = '사유숲';

-- 윤지연은 현재 멤버 목록에 없음 → 추가 필요한지 확인
-- (카톡 멤버 목록에 없는 분일 수 있음)

-- 비티오님, 사유숲 꼬리달기 추가
DO $$
DECLARE
  v_event_id UUID;
  v_member_id UUID;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE title = '6월 조이조아 모임' LIMIT 1;
  IF v_event_id IS NOT NULL THEN
    -- 비티오님
    SELECT id INTO v_member_id FROM members WHERE name = '비티오님' LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO event_rsvps (event_id, member_id) VALUES (v_event_id, v_member_id) ON CONFLICT DO NOTHING;
    END IF;
    -- 사유숲
    SELECT id INTO v_member_id FROM members WHERE name = '사유숲' LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO event_rsvps (event_id, member_id) VALUES (v_event_id, v_member_id) ON CONFLICT DO NOTHING;
    END IF;
    -- latte (라떼우유)
    SELECT id INTO v_member_id FROM members WHERE name = 'latte' LIMIT 1;
    IF v_member_id IS NOT NULL THEN
      INSERT INTO event_rsvps (event_id, member_id) VALUES (v_event_id, v_member_id) ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;
