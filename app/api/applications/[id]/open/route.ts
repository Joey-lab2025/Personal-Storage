import { authenticatedJobClient } from "@/lib/jobs/authenticateImport";
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{const{id}=await params;const client=await authenticatedJobClient(request);const{data,error}=await client.from("applications").update({application_status:"opened",updated_at:new Date().toISOString()}).eq("id",id).select("source_url").single();if(error)throw error;return Response.json(data);}catch(error){return Response.json({error:error instanceof Error?error.message:"打开失败"},{status:500});}}

