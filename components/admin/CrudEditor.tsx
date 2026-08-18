"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JsonValue, ResumeRecord } from "@/types/resume";
import type { ModuleConfig } from "@/lib/resume-config";

const emptyRecord = (config:ModuleConfig):ResumeRecord => Object.fromEntries([
  ["id", crypto.randomUUID()], ["sort_order", 0], ["is_resume_default", true], ...config.fields.map(f => [f.key, f.kind === "list" ? [] : ""])
]) as ResumeRecord;

export default function CrudEditor({config}:{config:ModuleConfig}) {
  const [items,setItems]=useState<ResumeRecord[]>([]); const [editing,setEditing]=useState<ResumeRecord|null>(null); const [busy,setBusy]=useState(true); const [message,setMessage]=useState("");
  async function load(){setBusy(true); const {data,error}=await supabase.from(config.table).select("*").order("sort_order"); if(error)setMessage(error.message); else setItems((data??[]) as ResumeRecord[]); setBusy(false)}
  useEffect(()=>{void supabase.from(config.table).select("*").order("sort_order").then(({data,error})=>{if(error)setMessage(error.message);else setItems((data??[]) as ResumeRecord[]);setBusy(false)})},[config.table]);
  async function save(){if(!editing)return; setBusy(true); const payload={...editing,sort_order:editing.sort_order ?? items.length}; const {error}=await supabase.from(config.table).upsert(payload); setMessage(error?error.message:"已保存"); if(!error){setEditing(null);await load()}else setBusy(false)}
  async function remove(id:string){if(!confirm("确定删除这条资料？"))return; const {error}=await supabase.from(config.table).delete().eq("id",id); setMessage(error?.message??"已删除"); await load()}
  async function move(index:number,delta:number){const target=index+delta;if(target<0||target>=items.length)return; const a=items[index],b=items[target]; await Promise.all([supabase.from(config.table).update({sort_order:target}).eq("id",a.id),supabase.from(config.table).update({sort_order:index}).eq("id",b.id)]); await load()}
  function update(key:string,value:JsonValue){setEditing(current=>current?{...current,[key]:value}:current)}
  return <section className="mx-auto max-w-5xl">
    <div className="mb-10 flex items-end justify-between border-b border-neutral-300 pb-5"><div><p className="text-xs uppercase tracking-[.2em] text-neutral-500">Master profile</p><h1 className="mt-2 text-4xl font-light">{config.title}</h1></div><button onClick={()=>setEditing(emptyRecord(config))} className="bg-black px-5 py-3 text-sm text-white">新增</button></div>
    {message&&<p className="mb-5 text-sm">{message}</p>}{busy&&!editing&&<p>读取中…</p>}
    <div className="space-y-3">{items.map((item,index)=><article key={item.id} className="grid grid-cols-[1fr_auto] gap-4 border-t border-neutral-300 py-5"><div><h2 className="font-medium">{String(item.title_cn??item.title??item.company??item.school??item.name??"未命名")}</h2><p className="mt-1 text-sm text-neutral-500">{String(item.role??item.position??item.category??item.journal??"")}</p></div><div className="flex items-center gap-3 text-sm"><button onClick={()=>move(index,-1)}>↑</button><button onClick={()=>move(index,1)}>↓</button><button onClick={()=>setEditing(item)}>编辑</button><button onClick={()=>remove(item.id)} className="text-red-700">删除</button></div></article>)}</div>
    {editing&&<div className="fixed inset-0 z-50 overflow-auto bg-black/40 p-4"><div className="mx-auto my-6 max-w-2xl bg-[#fafaf7] p-7"><div className="mb-7 flex justify-between"><h2 className="text-2xl">编辑{config.title}</h2><button onClick={()=>setEditing(null)}>关闭</button></div><div className="grid gap-5 md:grid-cols-2">{config.fields.map(field=><label key={field.key} className={field.kind==="textarea"||field.kind==="list"?"md:col-span-2":""}><span className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">{field.label}</span>{field.kind==="textarea"||field.kind==="list"?<textarea className="min-h-28 w-full border border-neutral-300 bg-white p-3" value={field.kind==="list"&&Array.isArray(editing[field.key])?(editing[field.key] as JsonValue[]).join("\n"):String(editing[field.key]??"")} onChange={e=>update(field.key,field.kind==="list"?e.target.value.split("\n").filter(Boolean):e.target.value)}/>:<input required={field.required} type={field.kind==="date"?"date":field.kind==="number"?"number":"text"} className="w-full border border-neutral-300 bg-white p-3" value={String(editing[field.key]??"")} onChange={e=>update(field.key,e.target.value)}/>}</label>)}<label className="flex items-center gap-3 md:col-span-2"><input type="checkbox" checked={editing.is_resume_default!==false} onChange={e=>update("is_resume_default",e.target.checked)}/>默认包含在简历中</label></div><button disabled={busy} onClick={save} className="mt-8 w-full bg-black p-4 text-white">{busy?"保存中…":"保存"}</button></div></div>}
  </section>
}
