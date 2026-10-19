-- 유통기한 임박 알림 (D-3, D-1, 당일) + 웹 푸시 구독

-- 알림: 사용자 × 식품 × 단계 당 1개. read_at 이 있으면 확인한 알림
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  stage VARCHAR(2) NOT NULL CHECK (stage IN ('d3', 'd1', 'd0')),
  read_at TIMESTAMP WITH TIME ZONE,
  pushed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, food_item_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 푸시 구독: 기기(브라우저)마다 1개
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 임박 식품에 대한 알림 생성 (이미 있는 단계는 건너뜀)
-- p_user_id 가 NULL 이면 모든 사용자 대상 (서버 cron 용)
CREATE OR REPLACE FUNCTION public.generate_expiry_notifications(p_user_id UUID DEFAULT NULL)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  INSERT INTO notifications (user_id, food_item_id, stage)
  SELECT p.id, fi.id,
    CASE
      WHEN fi.expiry - (now() AT TIME ZONE 'Asia/Seoul')::date <= 0 THEN 'd0'
      WHEN fi.expiry - (now() AT TIME ZONE 'Asia/Seoul')::date = 1 THEN 'd1'
      ELSE 'd3'
    END
  FROM food_items fi
  JOIN profiles p ON COALESCE(p.fridge_id, p.id)::text = fi.fridge_id::text
  WHERE fi.consumed = FALSE
    AND fi.expiry - (now() AT TIME ZONE 'Asia/Seoul')::date <= 3
    AND (p_user_id IS NULL OR p.id = p_user_id)
  ON CONFLICT (user_id, food_item_id, stage) DO NOTHING;
$$;

-- 클라이언트용: 로그인한 본인 알림만 생성
CREATE OR REPLACE FUNCTION public.generate_my_notifications()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT generate_expiry_notifications(auth.uid()) WHERE auth.uid() IS NOT NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.generate_expiry_notifications(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_my_notifications() TO authenticated;
