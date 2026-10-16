import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

const RETENTION_DAYS = 3;
const BATCH_SIZE = 100;

/**
 * GET /api/cron/cleanup-score-sheets
 *
 * Runs daily via Vercel Cron. Deletes source images for score sheet batches
 * older than RETENTION_DAYS and clears source_image_url on those rows.
 *
 * Batches themselves are NOT deleted — they remain visible in the History
 * view and the detail page still loads (without the image).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const { data: oldBatches, error: fetchError } = await (supabase as any)
      .from("score_sheet_batches")
      .select("id, source_image_url")
      .not("source_image_url", "is", null)
      .lt("created_at", cutoff.toISOString());

    if (fetchError) throw fetchError;

    if (!oldBatches || oldBatches.length === 0) {
      return NextResponse.json({
        success: true,
        deleted_images: 0,
        cleared_batches: 0,
        message: "No expired score sheet images found",
      });
    }

    const paths = oldBatches.map((b: any) => b.source_image_url);
    let deletedImages = 0;

    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
      const batch = paths.slice(i, i + BATCH_SIZE);
      const { error: removeError } = await supabase.storage
        .from("score-sheets")
        .remove(batch);

      if (removeError) {
        console.error("Failed to remove storage batch:", removeError);
        continue;
      }

      deletedImages += batch.length;
    }

    const batchIds = oldBatches.map((b: any) => b.id);
    const { error: updateError } = await (supabase as any)
      .from("score_sheet_batches")
      .update({
        source_image_url: null,
        updated_at: new Date().toISOString(),
      })
      .in("id", batchIds);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      deleted_images: deletedImages,
      cleared_batches: batchIds.length,
    });
  } catch (error: any) {
    console.error("Score sheet cleanup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
