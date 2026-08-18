export type ApplicationStatus="draft"|"ready"|"opened"|"sent"|"replied"|"interview"|"rejected"|"closed";
export type GreetingVersion="professional"|"concise"|"friendly";
export interface GreetingReasoning{job_focus:string[];candidate_strengths:string[]}
export interface Application{ id:string;job_id:string;resume_version_id:string|null;company_name:string;job_title:string;recruiter_name:string;recruiter_title:string;recruiter_fingerprint:string;greeting_text:string;greeting_version:GreetingVersion;greeting_reasoning:GreetingReasoning;application_status:ApplicationStatus;source:string;source_url:string;match_score_snapshot:number|null;application_snapshot:Record<string,unknown>;applied_at:string|null;notes:string;created_at:string;updated_at:string }
export interface ReadyCheck{key:"job"|"match"|"resume"|"pdf"|"greeting"|"source";label:string;ready:boolean}

