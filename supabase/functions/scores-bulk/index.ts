// supabase/functions/scores-bulk/index.ts

// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // 1. Get the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized - No token" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Extract the token
    const token = authHeader.replace("Bearer ", "");
    console.log("Token received (first 20 chars):", token.substring(0, 20) + "...");

    // 3. Create a Supabase client with the service role key to validate the token
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: { persistSession: false },
      }
    );

    // 4. Validate the token using the admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Unauthorized - Invalid token",
          error: userError?.message 
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const schoolId = user.app_metadata?.school_id;
    console.log("User:", user.email, "School:", schoolId);

    if (!schoolId) {
      return new Response(
        JSON.stringify({ success: false, message: "Forbidden - Missing school_id" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // 5. Create a regular client for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    // 6. Parse request body
    const body = await req.json();
    const { scores } = body;

    if (!scores || !Array.isArray(scores) || scores.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Invalid request payload",
          errors: ["scores must be a non-empty array"]
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 7. Process scores
    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (const [index, score] of scores.entries()) {
      if (!score.student_id || !score.assessment_id) {
        errors.push({
          index,
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          reason: "Missing student_id or assessment_id"
        });
        continue;
      }

      const { error: upsertError } = await supabaseClient
        .from("scores")
        .upsert({
          school_id: schoolId,
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          score: score.score,
        }, {
          onConflict: "school_id, student_id, assessment_id",
        });

      if (upsertError) {
        errors.push({
          index,
          student_id: score.student_id,
          assessment_id: score.assessment_id,
          reason: upsertError.message
        });
      } else {
        inserted++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        updated,
        failed: errors.length,
        total: scores.length,
        errors,
      }),
      { status: errors.length > 0 ? 207 : 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Internal server error",
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});