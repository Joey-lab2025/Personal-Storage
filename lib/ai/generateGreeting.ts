import { structuredResponse } from "@/lib/ai/deepseek";
import type { GreetingReasoning,GreetingVersion } from "@/types/application";
import type { Job,MasterProfile,ResumeVersion } from "@/types/job";
export async function generateGreeting(input:{profile:MasterProfile;job:Job;resume:ResumeVersion;variant:GreetingVersion}){
 const schema={type:"object",properties:{greeting:{type:"string"},reasoning_summary:{type:"object",properties:{job_focus:{type:"array",items:{type:"string"}},candidate_strengths:{type:"array",items:{type:"string"}}},required:["job_focus","candidate_strengths"]}},required:["greeting","reasoning_summary"]};
 const result=await structuredResponse<{greeting:string;reasoning_summary:GreetingReasoning}>("job_greeting",schema,"你是求职招呼语编辑。只使用输入中的事实。生成60到130个中文字符，结构为身份、岗位兴趣、1到2个强匹配点、沟通意愿。禁止夸张、感叹号、复制整段简历或Markdown。concise最精炼，professional正式，friendly自然但克制。",JSON.stringify(input));
 if(result?.greeting)return result;
 const name=String(input.profile.profile?.name_cn??"候选人");
 return {greeting:`您好，我是${name}，关注到贵司${input.job.job_title}岗位。我的研究与项目经历覆盖AI辅助内容处理、数据分析及数字平台实践，已针对岗位整理定制简历，希望有机会进一步沟通。`,reasoning_summary:{job_focus:input.job.keywords?.slice(0,3)??[],candidate_strengths:["AI辅助工作流","数据分析与内容平台实践"]}};
}
