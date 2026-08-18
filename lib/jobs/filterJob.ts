import { categoryForScore, type JobCategory } from "@/config/jobMatching";
import type { HardFilterWarning, JobImport, JobPreferences } from "@/types/job";

const listHas = (list: string[], value: string) => list.some(item => value.toLowerCase().includes(item.toLowerCase()));
const yearsRequired = (text: string) => Math.max(0, ...[...text.matchAll(/(\d+)\s*(?:-|–|—|至)?\s*(\d+)?\s*年/g)].map(match => Number(match[2] || match[1])));
const salaryMinimum = (text: string) => Number(text.match(/(\d+(?:\.\d+)?)\s*[kK]/)?.[1] || 0);

export function filterJob(job: JobImport, preferences: JobPreferences | null, score: number) {
  const warnings: HardFilterWarning = {};
  let penalty = 0;
  if (!preferences) return { adjustedScore: score, category: categoryForScore(score), warnings };
  const haystack = `${job.job_title}\n${job.job_description}`;
  const requiredYears = yearsRequired(`${job.experience_requirement} ${job.job_description}`);
  if (preferences.max_experience_years && requiredYears > preferences.max_experience_years) { warnings.experience = { required: `${requiredYears} years`, preferred: `<=${preferences.max_experience_years} years`, status: "mismatch" }; penalty += 10; }
  if (preferences.preferred_cities.length && job.location && !listHas(preferences.preferred_cities, job.location)) { warnings.location = { required: job.location, preferred: preferences.preferred_cities.join(" / "), status: "mismatch" }; penalty += 8; }
  if (preferences.minimum_salary && salaryMinimum(job.salary) && salaryMinimum(job.salary) < preferences.minimum_salary) { warnings.salary = { required: job.salary, preferred: `>=${preferences.minimum_salary}K`, status: "mismatch" }; penalty += 6; }
  if (listHas(preferences.excluded_companies, job.company_name)) { warnings.company = { required: job.company_name, preferred: "excluded", status: "mismatch" }; penalty += 30; }
  if (listHas(preferences.excluded_industries, job.company_industry)) { warnings.industry = { required: job.company_industry, preferred: "excluded", status: "mismatch" }; penalty += 20; }
  const excludedKeyword = preferences.excluded_keywords.find(keyword => haystack.toLowerCase().includes(keyword.toLowerCase()));
  if (excludedKeyword) { warnings.keyword = { required: excludedKeyword, preferred: "excluded", status: "mismatch" }; penalty += 15; }
  const adjustedScore = Math.max(0, score - penalty);
  const category: JobCategory = adjustedScore >= preferences.auto_priority_score ? "priority" : adjustedScore < preferences.auto_skip_score ? "skip" : categoryForScore(adjustedScore);
  return { adjustedScore, category, warnings };
}
