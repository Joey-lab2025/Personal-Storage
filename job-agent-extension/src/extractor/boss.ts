import type { ConfidentValue, Extraction, JobObject } from "../types/job.js";

const text = (element: Element | null) => element?.textContent?.replace(/\s+/g, " ").trim() || "";
const first = (selectors: string[]): ConfidentValue => { for (const selector of selectors) { const value = text(document.querySelector(selector)); if (value) return { value, confidence: .96 }; } return { value: "", confidence: 0 }; };
const labelled = (labels: string[]): ConfidentValue => { const elements = [...document.querySelectorAll("span,li,p,div")]; for (const element of elements) { const value = text(element); if (value.length < 80 && labels.some(label => value.startsWith(label))) return { value: value.replace(new RegExp(`^(${labels.join("|")})[：:]?\\s*`), ""), confidence: .72 }; } return { value: "", confidence: 0 }; };
const meta = (name: string) => (document.querySelector(`meta[property="${name}"],meta[name="${name}"]`) as HTMLMetaElement | null)?.content?.trim() || "";
const choose = (...values: ConfidentValue[]) => values.find(item => item.value) || { value: "", confidence: 0 };

export function extractBossJob(): Extraction {
  const title = choose(first(["h1.name", ".job-title", ".job-detail-box h1", "h1"]), { value: meta("og:title").split("-")[0]?.trim(), confidence: .55 });
  const company = choose(first([".company-info .name", ".company-name", ".sider-company .name", "a.company-name"]), labelled(["公司名称"]));
  const salary = choose(first([".salary", ".job-banner .salary", ".job-status .salary"]), labelled(["薪资"]));
  const locationValue = choose(first([".job-primary .text-city", ".job-location", ".location-address"]), labelled(["工作城市", "工作地点"]));
  const description = choose(first([".job-sec-text", ".job-detail-section .text", ".job-description", "[class*='job-detail'] [class*='text']"]), { value: meta("description"), confidence: .48 });
  const experience = choose(first([".job-primary .job-limit .experience", ".job-experience"]), labelled(["经验要求", "工作经验"]));
  const education = choose(first([".job-primary .job-limit .degree", ".job-degree"]), labelled(["学历要求", "学历"]));
  const industry = choose(labelled(["所属行业", "行业"]), first([".company-info .industry"]));
  const size = choose(labelled(["公司规模", "规模"]), first([".company-info .company-scale"]));
  const recruiter = first([".boss-info .name", ".job-boss-info .name"]); const recruiterTitle = first([".boss-info .boss-info-attr", ".job-boss-info .position"]);
  const sourceJobId = locationFromUrl();
  const job: JobObject = { source: "boss", source_url: location.href, source_job_id: sourceJobId, company_name: company.value, job_title: title.value, location: locationValue.value, salary: salary.value, experience_requirement: experience.value, education_requirement: education.value, job_description: description.value, company_industry: industry.value, company_size: size.value, recruiter_name: recruiter.value, recruiter_title: recruiterTitle.value, captured_at: new Date().toISOString() };
  const confidence = { company_name: company.confidence, job_title: title.confidence, job_description: description.confidence, salary: salary.confidence, location: locationValue.confidence };
  return { job, confidence, needs_confirmation: [confidence.company_name, confidence.job_title, confidence.job_description].some(value => value < .7) };
}
function locationFromUrl() { const match = location.pathname.match(/job_detail\/([^./?]+)/); return match?.[1] || new URL(location.href).searchParams.get("jobId") || ""; }
