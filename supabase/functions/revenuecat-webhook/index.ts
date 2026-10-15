// RevenueCat webhook: keeps subscriber_status.is_premium in sync.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ACTIVE = new Set(["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE", "SUBSCRIPTION_EXTENDED", "TEMPORARY_ENTITLEMENT_GRANT"]);
const INACTIVE = new Set(["EXPIRATION", "SUBSCRIPTION_PAUSED"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const res = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return res({ error: "Method not allowed" }, 405);
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  const auth = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!secret || auth !== secret) return res({ error: "Unauthorized" }, 401);

  let event: any;
  try { event = (await req.json())?.event; } catch { return res({ error: "Bad JSON" }, 400); }
  if (!event?.type) return res({ error: "Missing event" }, 400);

  let isPremium: boolean | null = null;
  if (ACTIVE.has(event.type)) isPremium = true;
  else if (INACTIVE.has(event.type)) isPremium = false;
  else if (event.type === "CANCELLATION") {
    // Cancellation keeps access until expiry; refunds (no future expiry) end it now.
    isPremium = typeof event.expiration_at_ms === "number" && event.expiration_at_ms > Date.now();
  }
  if (isPremium === null) return res({ ignored: event.type });

  const ids = [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])]
    .filter((v: unknown): v is string => typeof v === "string" && UUID.test(v));
  const userIds = [...new Set(ids)];
  if (!userIds.length) return res({ ignored: "no app user id" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { error } = await admin.from("subscriber_status").upsert(
    userIds.map((user_id) => ({ user_id, is_premium: isPremium, updated_at: new Date().toISOString() })),
  );
  if (error) return res({ error: error.message }, 500);
  return res({ ok: true, is_premium: isPremium, users: userIds.length });
});
