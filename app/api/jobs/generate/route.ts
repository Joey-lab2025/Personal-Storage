import { generateResume } from "@/lib/ai/generateResume";
import { getMasterProfile } from "@/lib/profile/getMasterProfile";
import type { MatchAnalysis, ResumeDirection, SelectedResumeItems, StructuredJob } from "@/types/job";
import { supabase } from "@/lib/supabase";
export const runtime="nodejs";
export async function POST(request:Request){try{const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!token||!(await supabase.auth.getUser(token)).data.user)return Response.json({error:"未登录"},{status:401});const body=await request.json() as {structured:StructuredJob;match:MatchAnalysis;selected:SelectedResumeItems;direction?:ResumeDirection};const profile=await getMasterProfile();const content=await generateResume(profile,body.structured,body.match,body.selected,body.direction??"auto");return Response.json({content,source_snapshot:profile})}catch(error){return Response.json({error:error instanceof Error?error.message:"生成失败"},{status:500})}}
