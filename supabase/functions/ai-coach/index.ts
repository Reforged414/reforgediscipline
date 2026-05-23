// AI Coach edge function — generates Tactical, Predictive, and Strategic insights
// using Lovable AI Gateway. No auth required for now (verify_jwt=false default).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CoachInput {
  streak: number;
  successRate: number | null;
  urgesThisWeek: number;
  topTriggers: { label: string; pct: number }[];
  peakLabel: string;
  totalRelapses: number;
  totalResisted: number;
  daysOfData: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const data: CoachInput = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");

    const system = `You are the Reforged AI Coach, an elite recovery strategist for men battling addiction (porn, substance, doom-scrolling). You speak in a calm, direct, masculine tone — like a trusted mentor. Never moralize. Never use cliches. Be tactical and specific. Reference the user's actual data.

Return STRICT JSON only, no prose, no code fences, matching:
{
  "tactical": "2-3 sentence weekly tactical breakdown referencing their top triggers and peak time",
  "predictive": "2-3 sentence predictive shield warning about upcoming high-risk windows based on their pattern",
  "strategic": "2-3 sentence action plan that NAMES specific in-app tools: 'Ride the Urge' timer, 'Reforged Shield' blocker, 'Daily Check-In', or 'Journal'"
}`;

    const userPrompt = `User data:
- Current streak: ${data.streak} days
- Days of logged data: ${data.daysOfData}
- Urges this week: ${data.urgesThisWeek}
- Total resisted: ${data.totalResisted}
- Total relapses: ${data.totalRelapses}
- Success rate: ${data.successRate ?? "insufficient data"}%
- Peak vulnerability time: ${data.peakLabel}
- Top triggers: ${data.topTriggers.map((t) => `${t.label} (${t.pct}%)`).join(", ") || "none logged"}

Generate the three insights now.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: text, status: res.status }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
