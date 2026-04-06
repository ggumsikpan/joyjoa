-- 윤지연 = "지금, 여기♡♡" 닉네임 매핑 + 꼬리달기 추가
UPDATE members SET nickname = '윤지연' WHERE name = '지금, 여기♡♡';

DO $$
DECLARE
  v_event_id UUID;
  v_member_id UUID;
BEGIN
  SELECT id INTO v_event_id FROM events WHERE title = '6월 조이조아 모임' LIMIT 1;
  SELECT id INTO v_member_id FROM members WHERE name = '지금, 여기♡♡' LIMIT 1;
  IF v_event_id IS NOT NULL AND v_member_id IS NOT NULL THEN
    INSERT INTO event_rsvps (event_id, member_id) VALUES (v_event_id, v_member_id) ON CONFLICT DO NOTHING;
  END IF;
END $$;
