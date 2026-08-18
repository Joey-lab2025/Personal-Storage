import type { JobImport } from "@/types/job";

export async function jobFingerprint(job: JobImport) {
  const identity = job.source_job_id
    ? `${job.source}:${job.source_job_id}`
    : job.source_url
      ? `${job.source}:${job.source_url}`
      : [job.company_name, job.job_title, job.location].map(value => value.toLowerCase().trim()).join("|");
  const bytes = new TextEncoder().encode(identity);
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))).map(value => value.toString(16).padStart(2, "0")).join("");
}

export function descriptionChanged(previous: string, next: string) {
  return previous.trim().replace(/\s+/g, " ") !== next.trim().replace(/\s+/g, " ");
}
