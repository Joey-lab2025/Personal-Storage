import type { ResumeData, ResumeRecord } from "@/types/resume";

export type JobSource = "boss" | "manual" | "linkedin" | "lagou" | "other";
export type JobStatus = "new" | "analyzed" | "priority" | "consider" | "resume_generated" | "applied" | "ignored" | "archived";
export type JobCategory = "priority" | "recommended" | "consider" | "skip";
export interface JobImport { source:JobSource; source_url:string; source_job_id:string; company_name:string; job_title:string; location:string; salary:string; experience_requirement:string; education_requirement:string; job_description:string; company_industry:string; company_size:string; recruiter_name:string; recruiter_title:string; captured_at:string }
export interface HardFilterWarning { [key:string]:{required:string;preferred:string;status:"mismatch"} }
export interface JobPreferences { id?:string; target_titles:string[]; preferred_cities:string[]; minimum_salary:number|null; max_experience_years:number|null; preferred_industries:string[]; excluded_industries:string[]; excluded_companies:string[]; included_keywords:string[]; excluded_keywords:string[]; auto_skip_score:number; auto_priority_score:number; created_at?:string; updated_at?:string }
export interface JobCandidateInput { source_url:string; source_job_id:string; company_name:string; job_title:string; location:string; salary:string; summary:string }
export interface JobCandidate extends JobCandidateInput { id:string; quick_score:number; is_shortlisted:boolean; captured_date:string; first_seen_at:string; last_seen_at:string }
export interface StructuredJob { job_title:string; core_requirements:string[]; preferred_requirements:string[]; responsibilities:string[]; skills:string[]; keywords:string[]; experience_requirements:string[]; education_requirements:string[] }
export interface Recommendation { id:string; title:string; score:number; reason:string }
export interface MatchAnalysis { score:number; recommendation:"highly_recommended"|"recommended"|"consider"|"low_match"; matched_requirements:string[]; missing_requirements:string[]; strengths:string[]; risks:string[]; recommended_experiences:Recommendation[]; recommended_projects:Recommendation[]; recommended_research:Recommendation[]; recommended_skills:Recommendation[]; breakdown:{core:number;experience:number;projects:number;skills:number;education:number;other:number} }
export interface Job extends JobImport { id:string; job_fingerprint:string; company_industry:string; company_size:string; recruiter_name:string; recruiter_title:string; requirements:StructuredJob|null; responsibilities:string[]; keywords:string[]; match_score:number|null; match_analysis:MatchAnalysis|null; category:JobCategory; hard_filter_warning:HardFilterWarning; status:JobStatus; last_seen_at:string; job_description_updated_at:string|null; created_at:string; updated_at:string }
export interface SelectedResumeItems { experiences:string[]; projects:string[]; research:string[]; publications:string[]; skills:string[] }
export interface ResumeRewrite { record_id:string; original:string; targeted:string; accepted:boolean; original_title?:string; targeted_title?:string }
export type ResumeDirection="auto"|"product_manager"|"landscape_designer"|"research_academic"|"content_media";
export interface ResumeStrategy { direction:Exclude<ResumeDirection,"auto">; label:string; positioning:string; writing_focus:string[]; section_order:string[] }
export interface TargetedResumeContent { summary:string; selected:SelectedResumeItems; rewrites:ResumeRewrite[]; section_order:string[]; skills_order:string[]; strategy?:ResumeStrategy }
export interface ResumeVersion { id:string; job_id:string; name:string; target_company:string; target_job:string; content:TargetedResumeContent; source_snapshot:ResumeData; created_at:string; updated_at:string }
export type MasterProfile = ResumeData;
export const recordTitle=(item:ResumeRecord)=>String(item.company??item.title_cn??item.title??item.school??item.name??"未命名");
