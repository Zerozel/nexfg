// supabase/functions/scores-bulk/index.ts

// @ts-nocheck - Deno runtime with different module resolution
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { validatePayload } from "./validation.ts";
import { createSupabaseClient, validateRecords, executeBatchUpsert } from "./database.ts";
import type { SuccessResponse, ErrorResponse, ValidatedRecord } from "./types.ts";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Method not allowed. Use POST.",
      } as ErrorResponse),
      { status: 405, headers: corsHeaders }
    );
  }

  console.log("scores.bulk.started - Request received");

  try {
    // 1. Check Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized - Valid JWT required",
        } as ErrorResponse),
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Create Supabase client with auth context
    let supabase;
    try {
      supabase = createSupabaseClient(authHeader);
    } catch (error) {
      console.error("Client creation error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Internal server error",
        } as ErrorResponse),
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Verify JWT and extract user metadata
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized - Invalid token",
        } as ErrorResponse),
        { status: 401, headers: corsHeaders }
      );
    }

    const user = data.user;

    // 4. Extract school_id from JWT
    const schoolId = user.app_metadata?.school_id;
    if (!schoolId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Forbidden - Insufficient permissions",
        } as ErrorResponse),
        { status: 403, headers: corsHeaders }
      );
    }

    // 5. Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid JSON in request body",
        } as ErrorResponse),
        { status: 400, headers: corsHeaders }
      );
    }

    const payloadValidation = validatePayload(body);
    if (!payloadValidation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request payload",
          errors: payloadValidation.errors,
        } as ErrorResponse),
        { status: 400, headers: corsHeaders }
      );
    }

    const { scores } = payloadValidation.data;

    // 6. Prepare validated records with indices
    const validatedRecords: ValidatedRecord[] = scores.map((entry, index) => ({
      index,
      student_id: entry.student_id,
      assessment_id: entry.assessment_id,
      score: entry.score,
    }));

    console.log(`scores.bulk.validated - Validating ${validatedRecords.length} records`);

    // 7. Validate records against database
    const { valid, failed } = await validateRecords(supabase, validatedRecords, schoolId);

    // 8. Execute batch UPSERT for valid records
    let inserted = 0;
    let updated = 0;

    if (valid.length > 0) {
      const result = await executeBatchUpsert(supabase, valid, schoolId);
      inserted = result.inserted;
      updated = result.updated;
      console.log(`scores.bulk.upserted - Inserted: ${inserted}, Updated: ${updated}`);
    }

    const total = scores.length;

    console.log(`scores.bulk.completed - Total: ${total}, Inserted: ${inserted}, Updated: ${updated}, Failed: ${failed.length}`);

    // 9. Return response
    const statusCode = failed.length > 0 ? 207 : 200;
    const response: SuccessResponse = {
      success: true,
      inserted,
      updated,
      failed: failed.length,
      total,
      errors: failed,
    };

    const processingTime = Date.now() - startTime;
    console.log(`Request processed in ${processingTime}ms`);

    return new Response(
      JSON.stringify(response),
      { status: statusCode, headers: corsHeaders }
    );

  } catch (error) {
    console.error("scores.bulk.error - Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
      } as ErrorResponse),
      { status: 500, headers: corsHeaders }
    );
  }
});
