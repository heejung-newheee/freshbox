// 매일 cron 으로 호출: 임박 알림 생성 → 아직 푸시 안 한 미확인 알림을 사용자별로 묶어 푸시
import { createClient } from "npm:@supabase/supabase-js@2.98.0";
import webpush from "npm:web-push@3.6.7";

const STAGE_LABEL: Record<string, string> = { d3: "D-3", d1: "D-1", d0: "오늘" };

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!,
);

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async () => {
  const { error: genError } = await supabase.rpc("generate_expiry_notifications");
  if (genError) return new Response(genError.message, { status: 500 });

  const { data: pending, error } = await supabase
    .from("notifications")
    .select("id, user_id, stage, food_items!inner(name, consumed)")
    .is("read_at", null)
    .is("pushed_at", null)
    .eq("food_items.consumed", false);
  if (error) return new Response(error.message, { status: 500 });

  const byUser = new Map<string, typeof pending>();
  for (const n of pending ?? []) {
    byUser.set(n.user_id, [...(byUser.get(n.user_id) ?? []), n]);
  }

  let sent = 0;
  for (const [userId, list] of byUser) {
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);
    if (!subs?.length) continue;

    const names = list.map((n) => `${n.food_items.name}(${STAGE_LABEL[n.stage]})`);
    const payload = JSON.stringify({
      title: "곧 만료되는 식품이 있어요",
      body: names.length > 3 ? `${names.slice(0, 3).join(", ")} 외 ${names.length - 3}개` : names.join(", "),
    });

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        );
        sent++;
      } catch (e) {
        // 만료/해지된 구독은 삭제
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await supabase.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        }
      }
    }

    await supabase
      .from("notifications")
      .update({ pushed_at: new Date().toISOString() })
      .in("id", list.map((n) => n.id));
  }

  return Response.json({ sent });
});
