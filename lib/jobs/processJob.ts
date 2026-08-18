import type { SupabaseClient } from "@supabase/supabase-js";
import { analyzeJob } from "@/lib/ai/analyzeJob";
import { matchJob } from "@/lib/ai/matchJob";
import { getMasterProfile } from "@/lib/profile/getMasterProfile";
import { filterJob } from "@/lib/jobs/filterJob";
import type { Job, JobPreferences } from "@/types/job";

export async function processJob(client: SupabaseClient, job: Job) {
  const [structured, profile, preferenceResult] = await Promise.all([
    analyzeJob(job.job_description, job.job_title),
    getMasterProfile(client),
    client.from("job_preferences").select("*").limit(1).maybeSingle(),
  ]);
  const match = matchJob(profile, structured);
  const filtered = filterJob(job, preferenceResult.data as JobPreferences | null, match.score);
  const patch = {
    requirements: structured,
    responsibilities: structured.responsibilities,
    keywords: structured.keywords,
    match_score: filtered.adjustedScore,
    match_analysis: { ...match, score: filtered.adjustedScore },
    category: filtered.category,
    hard_filter_warning: filtered.warnings,
    status: "analyzed",
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client.from("jobs").update(patch).eq("id", job.id).select().single();
  if (error) throw error;
  return data as Job;
}
