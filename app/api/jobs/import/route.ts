import { authenticatedJobClient } from "@/lib/jobs/authenticateImport";
import { descriptionChanged, jobFingerprint } from "@/lib/jobs/deduplicateJob";
import { normalizeJob } from "@/lib/jobs/normalizeJob";
import { processJob } from "@/lib/jobs/processJob";
import type { Job, JobImport } from "@/types/job";

export const runtime = "nodejs";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: cors });
export function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }

export async function POST(request: Request) {
  try {
    const client = await authenticatedJobClient(request);
    const normalized = normalizeJob(await request.json() as JobImport);
    if (!normalized.company_name || !normalized.job_title || !normalized.job_description || !normalized.source_url) return json({ success: false, error: "公司、岗位、JD 和来源链接为必填项" }, 400);
    const fingerprint = await jobFingerprint(normalized);
    const { data: existing, error: lookupError } = await client.from("jobs").select("*").eq("job_fingerprint", fingerprint).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      const changed = descriptionChanged(existing.job_description, normalized.job_description);
      const now = new Date().toISOString();
      const patch = { last_seen_at: now, ...(changed ? { job_description: normalized.job_description, job_description_updated_at: now, status: "new" } : {}) };
      const { data, error } = await client.from("jobs").update(patch).eq("id", existing.id).select().single();
      if (error) throw error;
      const finalJob = changed ? await processJob(client, data as Job) : data as Job;
      return json({ success: true, job_id: finalJob.id, duplicate: true, updated: changed, match_score: finalJob.match_score, recommendation: finalJob.category });
    }
    const now = new Date().toISOString();
    const { data, error } = await client.from("jobs").insert({ ...normalized, job_fingerprint: fingerprint, captured_at: normalized.captured_at || now, last_seen_at: now, status: "new" }).select().single();
    if (error) throw error;
    const analyzed = await processJob(client, data as Job);
    return json({ success: true, job_id: analyzed.id, duplicate: false, match_score: analyzed.match_score, recommendation: analyzed.category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "岗位导入失败";
    const status = message === "UNAUTHORIZED" ? 401 : message === "SERVER_IMPORT_NOT_CONFIGURED" ? 503 : 500;
    return json({ success: false, error: message }, status);
  }
}
