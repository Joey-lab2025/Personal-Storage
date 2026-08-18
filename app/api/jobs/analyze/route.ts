import { analyzeJob } from "@/lib/ai/analyzeJob";
import { matchJob } from "@/lib/ai/matchJob";
import { getMasterProfile } from "@/lib/profile/getMasterProfile";
import { supabase } from "@/lib/supabase";
export const runtime="nodejs";
export async function POST(request:Request){try{const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");if(!token||!(await supabase.auth.getUser(token)).data.user)return Response.json({error:"未登录"},{status:401});const body=await request.json() as {job_description?:string;job_title?:string};if(!body.job_description?.trim())return Response.json({error:"JD 不能为空"},{status:400});const [structured,profile]=await Promise.all([analyzeJob(body.job_description,body.job_title),getMasterProfile()]);return Response.json({structured,match:matchJob(profile,structured)})}catch(error){return Response.json({error:error instanceof Error?error.message:"分析失败"},{status:500})}}
