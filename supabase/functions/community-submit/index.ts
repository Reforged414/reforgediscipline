// Community submit: moderates text (+ optional image) before storing posts/comments.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function classify(content: unknown[], key: string, schema: Record<string, unknown>, system: string) {
  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }, { role: "user", content }],
      tools: [{ type: "function", function: { name: "result", parameters: { type: "object", properties: schema, required: Object.keys(schema) } } }],
      tool_choice: { type: "function", function: { name: "result" } },
    }),
  });
  if (!res.ok) throw new Error(`moderation ${res.status}`);
  const data = await res.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return JSON.parse(args ?? "{}");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await admin.auth.getUser(auth.replace("Bearer ", ""));
    const user = u?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { kind, forum_id, post_id, body, image_base64 } = await req.json();
    const text = String(body ?? "").trim();
    if (kind !== "post" && kind !== "comment") return json({ error: "Invalid kind" }, 400);
    if (!text || text.length > (kind === "post" ? 2000 : 1000)) return json({ error: "Text is empty or too long." }, 400);

    const { data: prof } = await admin.from("community_profiles").select("handle").eq("user_id", user.id).maybeSingle();
    if (!prof) return json({ error: "Choose a handle first." }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY")!;

    // 1+2: text checks (abuse and self-harm are separate fields)
    const t = await classify(
      [{ type: "text", text }],
      key,
      {
        abusive: { type: "boolean", description: "hate speech, harassment, sexual content, or explicit violence" },
        self_harm: { type: "boolean", description: "suicide, self-harm, severe hopelessness, or dangerous crisis language" },
      },
      "You moderate a supportive addiction-recovery community. Classify the user's text. Talking about urges, relapses, or struggle in a non-graphic way is NOT abusive.",
    );

    // 3: image check before storing
    let imagePath: string | null = null;
    if (kind === "post" && image_base64) {
      const m = String(image_base64).match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
      if (!m) return json({ image_rejected: true, error: "This image couldn't be uploaded." }, 200);
      const img = await classify(
        [{ type: "text", text: "Is this image explicit, sexual, gory, hateful or otherwise inappropriate?" }, { type: "image_url", image_url: { url: image_base64 } }],
        key,
        { inappropriate: { type: "boolean" } },
        "You moderate images for a supportive community app.",
      );
      if (img.inappropriate) return json({ image_rejected: true, error: "This image couldn't be uploaded." }, 200);
      const bytes = Uint8Array.from(atob(m[3]), (c) => c.charCodeAt(0));
      const ext = m[2] === "jpg" ? "jpeg" : m[2];
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await admin.storage.from("community-images").upload(path, bytes, { contentType: m[1] });
      if (up.error) return json({ image_rejected: true, error: "This image couldn't be uploaded." }, 200);
      imagePath = path;
    }

    const status = t.abusive ? "blocked" : "visible";
    const flagged = !t.abusive && !!t.self_harm;

    let id: string;
    if (kind === "post") {
      const { data, error } = await admin.from("posts").insert({
        user_id: user.id, forum_id, body: text, image_url: imagePath, status, flagged_for_review: flagged,
      }).select("id").single();
      if (error) throw error;
      id = data.id;
    } else {
      const { data, error } = await admin.from("comments").insert({
        user_id: user.id, post_id, body: text, status, flagged_for_review: flagged,
      }).select("id").single();
      if (error) throw error;
      id = data.id;
    }
    if (flagged) await admin.from("moderation_flags").insert({ target_type: kind, target_id: id, flag_reason: "self_harm_language" });

    if (status === "blocked") return json({ blocked: true, error: "This couldn't be posted — please keep this space respectful and supportive." });
    return json({ id, crisis: flagged });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong. Try again." }, 500);
  }
});
