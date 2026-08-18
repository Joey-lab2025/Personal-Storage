import { authenticatedJobClient } from "@/lib/jobs/authenticateImport";
import { getMasterProfile } from "@/lib/profile/getMasterProfile";
import { generateGreeting } from "@/lib/ai/generateGreeting";
import { applicationReadiness,recruiterFingerprint } from "@/lib/applications/prepareApplication";
import type { GreetingVersion } from "@/types/application";
import type { Job,ResumeVersion } from "@/types/job";
export const runtime="nodejs";
export async function POST(request:Request){try{
 const client=await authenticatedJobClient(request);const body=await request.json() as {job_id:string;resume_version_id?:string;variant?:GreetingVersion};
 const {data:existing}=await client.from("applications").select("*").eq("job_id",body.job_id).not("application_status","in",'(rejected,closed)').maybeSingle();
 if(existing)return Response.json({application:existing,already_applied:["sent","replied","interview"].includes(existing.application_status),readiness:applicationReadiness({job:true,matchScore:existing.match_score_snapshot,resume:Boolean(existing.resume_version_id),greeting:existing.greeting_text,sourceUrl:existing.source_url})});
 const {data:job,error:jobError}=await client.from("jobs").select("*").eq("id",body.job_id).single();if(jobError)throw jobError;
 let resumeQuery=client.from("resume_versions").select("*").eq("job_id",body.job_id).order("created_at",{ascending:false}).limit(1);
 if(body.resume_version_id)resumeQuery=client.from("resume_versions").select("*").eq("id",body.resume_version_id).limit(1);
 const {data:resumes,error:resumeError}=await resumeQuery;if(resumeError)throw resumeError;const resume=resumes?.[0] as ResumeVersion|undefined;
 let greeting="",reasoning={job_focus:[] as string[],candidate_strengths:[] as string[]};const variant=body.variant??"concise";
 if(resume){const generated=await generateGreeting({profile:await getMasterProfile(client),job:job as Job,resume,variant});greeting=generated.greeting;reasoning=generated.reasoning_summary;}
 const readiness=applicationReadiness({job:true,matchScore:job.match_score,resume:Boolean(resume),greeting,sourceUrl:job.source_url??""});
 const row={job_id:job.id,resume_version_id:resume?.id??null,company_name:job.company_name,job_title:job.job_title,recruiter_name:job.recruiter_name??"",recruiter_title:job.recruiter_title??"",recruiter_fingerprint:recruiterFingerprint(job.company_name,job.recruiter_name??""),greeting_text:greeting,greeting_version:variant,greeting_reasoning:reasoning,application_status:readiness.ready?"ready":"draft",source:job.source,source_url:job.source_url??"",match_score_snapshot:job.match_score};
 const {data,error}=await client.from("applications").insert(row).select().single();if(error)throw error;return Response.json({application:data,readiness});
}catch(error){const message=error instanceof Error?error.message:"准备失败";return Response.json({error:message},{status:message==="UNAUTHORIZED"?401:500});}}

