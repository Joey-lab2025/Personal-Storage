export type JobSource = "boss" | "manual" | "linkedin" | "lagou" | "other";
export interface JobObject { source:JobSource; source_url:string; source_job_id:string; company_name:string; job_title:string; location:string; salary:string; experience_requirement:string; education_requirement:string; job_description:string; company_industry:string; company_size:string; recruiter_name:string; recruiter_title:string; captured_at:string }
export interface ConfidentValue { value:string; confidence:number }
export type Extraction = { job:JobObject; confidence:Record<string,number>; needs_confirmation:boolean };
export interface JobCandidate { source_url:string; source_job_id:string; company_name:string; job_title:string; location:string; salary:string; summary:string }
