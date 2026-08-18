import type { JobImport } from "@/types/job";

const clean = (value = "") => value.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[ \t]+/g, " ").trim();
const compactTitle = (value = "") => clean(value).replace(/\s+/g, "");
const multiline = (value = "") => value.replace(/\r\n?/g, "\n").split("\n").map(clean).filter(Boolean).join("\n");

export function normalizeJob(input: JobImport): JobImport {
  let sourceUrl = clean(input.source_url);
  try { const url = new URL(sourceUrl); url.hash = ""; ["ka", "lid", "securityId"].forEach(key => url.searchParams.delete(key)); sourceUrl = url.toString(); } catch { /* Keep non-URL input for validation. */ }
  return {
    ...input,
    source: input.source || "other",
    source_url: sourceUrl,
    source_job_id: clean(input.source_job_id),
    company_name: clean(input.company_name),
    job_title: compactTitle(input.job_title),
    location: clean(input.location),
    salary: clean(input.salary).replace(/\s+/g, ""),
    experience_requirement: clean(input.experience_requirement),
    education_requirement: clean(input.education_requirement),
    job_description: multiline(input.job_description),
    company_industry: clean(input.company_industry),
    company_size: clean(input.company_size),
    recruiter_name: clean(input.recruiter_name),
    recruiter_title: clean(input.recruiter_title),
    captured_at: input.captured_at || new Date().toISOString(),
  };
}
