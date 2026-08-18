import { authenticatedJobClient } from "@/lib/jobs/authenticateImport";
import { scoreCandidate } from "@/lib/jobs/scoreCandidate";
import type { JobCandidateInput, JobPreferences } from "@/types/job";
export const runtime = "nodejs";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
export function OPTIONS() { return new Response(null, { status: 204, headers: cors }); }
export async function POST(request: Request) {
  try {
    const client = await authenticatedJobClient(request);
    const body = await request.json() as { candidates?: JobCandidateInput[] };
    const candidates = (body.candidates ?? []).filter(item => item.source_url && item.job_title).slice(0, 60);
    if (!candidates.length) return Response.json({ success: true, received: 0, shortlisted: 0, candidates: [] }, { headers: cors });
    const preferenceResult = await client.from("job_preferences").select("*").limit(1).maybeSingle();
    const preferences = preferenceResult.data as JobPreferences | null;
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
    const now = new Date().toISOString();
    const rows = candidates.map(item => ({ ...item, source: "boss", quick_score: scoreCandidate(item, preferences), captured_date: today, last_seen_at: now, updated_at: now }));
    const { error } = await client.from("job_candidates").upsert(rows, { onConflict: "source_url", ignoreDuplicates: false });
    if (error) throw error;
    const { data, error: selectError } = await client.from("job_candidates").select("id,source_url,job_title,company_name,location,salary,quick_score").eq("captured_date", today).order("quick_score", { ascending: false });
    if (selectError) throw selectError;
    const top = (data ?? []).slice(0, 20);
    await client.from("job_candidates").update({ is_shortlisted: false }).eq("captured_date", today);
    if (top.length) await client.from("job_candidates").update({ is_shortlisted: true }).in("id", top.map(item => item.id));
    return Response.json({ success: true, received: rows.length, shortlisted: top.length, candidates: top }, { headers: cors });
  } catch (error) { return Response.json({ success: false, error: error instanceof Error ? error.message : "候选岗位同步失败" }, { status: 500, headers: cors }); }
}
