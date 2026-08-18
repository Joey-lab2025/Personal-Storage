"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ResumeData, ResumeRecord, ResumeTable } from "@/types/resume";

const tables:ResumeTable[]=["education","experiences","projects","research","publications","skills","awards"];
const empty:ResumeData={profile:null,education:[],experiences:[],projects:[],research:[],publications:[],skills:[],awards:[]};
const labels:Record<ResumeTable,string>={education:"教育经历 / EDUCATION",experiences:"工作与实习 / EXPERIENCE",projects:"项目经历 / SELECTED PROJECTS",research:"科研经历 / RESEARCH",publications:"论文成果 / PUBLICATIONS",skills:"专业技能 / SKILLS",awards:"获奖经历 / AWARDS"};
const title=(x:ResumeRecord)=>String(x.school??x.company??x.title_cn??x.title??x.name??"");
const subtitle=(x:ResumeRecord)=>String(x.degree??x.position??x.role??x.journal??x.category??"");
const date=(x:ResumeRecord)=>[x.start_date??x.publication_date??x.award_date,x.end_date].filter(Boolean).map(String).join(" — ");
const bullets=(x:ResumeRecord)=>{const raw=Array.isArray(x.description)?x.description:x.highlights??x.results;return Array.isArray(raw)?raw.map(String):raw?[String(raw)]:[]};
const skillGroupRules=[
 {label:"数据与 AI / DATA & AI",categories:["Data","AI","AI Tools","Programming","Computer Vision"]},
 {label:"设计与建模 / DESIGN & MODELING",categories:["Design","Modeling"]},
 {label:"内容与新媒体 / CONTENT & NEW MEDIA",categories:["Media","New Media"]},
 {label:"语言 / LANGUAGE",categories:["Language"]},
];
const groupedSkills=(items:ResumeRecord[])=>skillGroupRules.map(group=>{
 const values=items.filter(item=>group.categories.includes(String(item.category))).flatMap(item=>String(item.name??"").split("·").map(value=>value.trim())).filter(Boolean);
 return {label:group.label,values:[...new Set(values)]};
}).filter(group=>group.values.length>0);
export default function ResumeView(){const [data,setData]=useState(empty);const [visible,setVisible]=useState<Record<ResumeTable,boolean>>(Object.fromEntries(tables.map(t=>[t,true])) as Record<ResumeTable,boolean>);const [loading,setLoading]=useState(true);
 useEffect(()=>{void Promise.all([supabase.from("profile").select("*").limit(1).maybeSingle(),...tables.map(t=>supabase.from(t).select("*").eq("is_resume_default",true).order("sort_order"))]).then(([p,...rows])=>{const next={...empty,profile:p.data};tables.forEach((t,i)=>next[t]=(rows[i].data??[]) as ResumeRecord[]);setData(next as ResumeData);setLoading(false)})},[]);
 if(loading)return <main className="p-20">读取个人资料库…</main>;
 return <div className="resume-shell"><aside className="no-print resume-settings"><p className="text-xs tracking-[.2em] text-neutral-500">RESUME SETTINGS</p><h2 className="my-4 text-2xl">模块显示</h2>{tables.map(t=><label key={t} className="flex gap-3 border-t border-neutral-300 py-3"><input type="checkbox" checked={visible[t]} onChange={e=>setVisible({...visible,[t]:e.target.checked})}/>{labels[t]}</label>)}<a href="/api/resume/pdf" className="mt-6 block w-full bg-black p-4 text-center text-white">服务端导出 PDF</a><button onClick={()=>window.print()} className="mt-3 w-full border border-black p-3">浏览器打印备用</button><a href="/admin" className="mt-4 block text-center text-sm">返回后台</a></aside>
 <main className="resume-page"><header className="border-b-2 border-black pb-6"><div className="flex items-start justify-between gap-8"><div><h1 className="text-4xl font-medium tracking-[.12em]">{data.profile?.name_cn||"刘康"}</h1><p className="mt-1 text-lg tracking-[.2em]">{data.profile?.name_en||"JOEY LIU"}</p></div>{data.profile?.avatar_url&&<img src={data.profile.avatar_url} alt={`${data.profile.name_cn}头像`} className="resume-avatar"/>}</div><p className="mt-5 text-xs leading-6">{[data.profile?.city,data.profile?.email,data.profile?.phone,data.profile?.website].filter(Boolean).join(" · ")}</p>{data.profile?.job_title&&<p className="mt-2 text-xs uppercase tracking-[.14em] text-neutral-600">{data.profile.job_title}</p>}</header>
 {data.profile?.summary&&<section className="resume-section"><h2>个人简介 / PROFILE</h2><p>{data.profile.summary}</p></section>}
 {tables.map(t=>visible[t]&&data[t].length>0&&<section key={t} className="resume-section"><h2>{labels[t]}</h2>{t==="skills"?<div className="grid grid-cols-2 gap-x-8 gap-y-2">{groupedSkills(data[t]).map(group=><p key={group.label}><b>{group.label}</b> — {group.values.join(" · ")}</p>)}</div>:data[t].map(x=><article key={x.id} className="resume-item"><div className="resume-date">{date(x)}</div><div><div className="flex justify-between gap-4"><h3>{title(x)}</h3><span>{String(x.location??"")}</span></div><p className="resume-subtitle">{subtitle(x)}</p>{x.description&&!Array.isArray(x.description)&&<p>{String(x.description)}</p>}{bullets(x).length>0&&<ul>{bullets(x).map((b,i)=><li key={i}>{b}</li>)}</ul>}</div></article>)}</section>)}</main></div>}
