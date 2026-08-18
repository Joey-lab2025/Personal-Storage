import { authenticatedJobClient } from "@/lib/jobs/authenticateImport";
import { processJob } from "@/lib/jobs/processJob";
import type { Job } from "@/types/job";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const client = await authenticatedJobClient(request);
    const { data, error } = await client.from("jobs").select("*").is("match_score", null).neq("status", "archived").limit(20);
    if (error) throw error;
    const results = [];
    for (const job of (data ?? []) as Job[]) {
      try { const analyzed = await processJob(client, job); results.push({ id: job.id, success: true, score: analyzed.match_score }); }
      catch (error) { results.push({ id: job.id, success: false, error: error instanceof Error ? error.message : "分析失败" }); }
    }
    return Response.json({ success: true, processed: results.length, results });
  } catch (error) { return Response.json({ success: false, error: error instanceof Error ? error.message : "批量分析失败" }, { status: 500 }); }
}
