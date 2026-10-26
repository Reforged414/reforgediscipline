// Edge function: delete the calling user's account and all related data.
// Uses the user's JWT to identify them, then service role to delete.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the user from their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const admin = createClient(supabaseUrl, serviceKey);

    // Delete every row tied to this user, in dependency order.
    // Comments/reactions on the user's own posts cascade via FK when posts go.
    const deletions: [string, string][] = [
      ["comments", "user_id"],
      ["reactions", "user_id"],
      ["reports", "reporter_user_id"],
      ["posts", "user_id"],
      ["community_profiles", "user_id"],
      ["moderation_flags", "user_id"],
      ["subscriber_status", "user_id"],
      ["admin_users", "user_id"],
      ["discipline_goals", "user_id"],
      ["user_data", "user_id"],
      ["profiles", "user_id"],
    ];

    for (const [table, column] of deletions) {
      const { error } = await admin.from(table).delete().eq(column, userId);
      // Ignore "table/column not found" style errors so one missing table
      // never blocks the rest of the cleanup.
      if (error) {
        console.warn(`delete-account: skipping ${table}: ${error.message}`);
      }
    }

    // Delete the auth user itself
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("delete-account error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
