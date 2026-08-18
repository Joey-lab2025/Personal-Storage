import type { ReadyCheck } from "@/types/application";
export function applicationReadiness(input:{job:boolean;matchScore:number|null|undefined;resume:boolean;greeting:string;sourceUrl:string}){
 const checks:ReadyCheck[]=[
  {key:"job",label:"岗位",ready:input.job},{key:"match",label:"匹配分析",ready:typeof input.matchScore==="number"},
  {key:"resume",label:"定制简历",ready:input.resume},{key:"pdf",label:"PDF 可导出",ready:input.resume},
  {key:"greeting",label:"招呼语",ready:Boolean(input.greeting.trim())},{key:"source",label:"岗位来源",ready:Boolean(input.sourceUrl.trim())},
 ];
 return {ready:checks.every(x=>x.ready),checks,missing:checks.filter(x=>!x.ready).map(x=>x.label)};
}
export function recruiterFingerprint(company:string,name:string){return `${company.trim().toLowerCase()}::${name.trim().toLowerCase()}`;}

