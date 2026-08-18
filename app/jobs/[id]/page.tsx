"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Job, MatchAnalysis, Recommendation, ResumeDirection, SelectedResumeItems } from "@/types/job";

const groups: [keyof SelectedResumeItems, keyof MatchAnalysis, string][] = [
  ["experiences", "recommended_experiences", "工作经历"],
  ["projects", "recommended_projects", "项目经历"],
  ["research", "recommended_research", "科研经历"],
  ["skills", "recommended_skills", "技能"],
];

async function authHeaders() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.access_token) throw new Error("登录会话已失效，请重新登录");
  return { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` };
}

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [resumeDirection, setResumeDirection] = useState<ResumeDirection>("auto");
  const [selected, setSelected] = useState<SelectedResumeItems>({ experiences: [], projects: [], research: [], publications: [], skills: [] });

  useEffect(() => { void supabase.from("jobs").select("*").eq("id", id).single().then(({ data }) => setJob(data as Job)); void supabase.from("applications").select("id").eq("job_id",id).not("application_status","in",'(rejected,closed)').limit(1).maybeSingle().then(({data})=>setApplicationId(data?.id??null)); }, [id]);
  useEffect(() => { if (job && search.get("analyze") === "1" && job.status === "new") void analyze(); }, [job]);
  const match = job?.match_analysis;

  async function analyze() {
    if (!job || busy) return;
    setBusy(true);
    setMessage("正在分析 JD 与个人资料库…");
    try {
      const response = await fetch("/api/jobs/analyze", { method: "POST", headers: await authHeaders(), body: JSON.stringify(job) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const patch = { requirements: result.structured, responsibilities: result.structured.responsibilities, keywords: result.structured.keywords, match_score: result.match.score, match_analysis: result.match, status: "analyzed", updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from("jobs").update(patch).eq("id", id).select().single();
      if (error) throw error;
      setJob(data as Job);
      const m = result.match as MatchAnalysis;
      setSelected({
        experiences: m.recommended_experiences.filter(x => x.score > 0).map(x => x.id),
        projects: m.recommended_projects.filter(x => x.score > 0).map(x => x.id),
        research: m.recommended_research.filter(x => x.score > 0).map(x => x.id),
        publications: [],
        skills: m.recommended_skills.filter(x => x.score > 0).map(x => x.id),
      });
      setMessage("分析完成");
    } catch (error) { setMessage(error instanceof Error ? error.message : "分析失败"); }
    finally { setBusy(false); }
  }

  async function generate() {
    if (!job?.requirements || !match) return;
    setBusy(true);
    setMessage("正在生成事实受保护的定制简历…");
    try {
      const response = await fetch("/api/jobs/generate", { method: "POST", headers: await authHeaders(), body: JSON.stringify({ structured: job.requirements, match, selected, direction: resumeDirection }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const name = `${job.company_name}_${job.job_title}`;
      const { data, error } = await supabase.from("resume_versions").insert({ job_id: id, name, target_company: job.company_name, target_job: job.job_title, content: result.content, source_snapshot: result.source_snapshot }).select().single();
      if (error) throw error;
      await supabase.from("jobs").update({ status: "resume_generated", updated_at: new Date().toISOString() }).eq("id", id);
      window.location.href = `/resumes/${data.id}`;
    } catch (error) { setMessage(error instanceof Error ? error.message : "生成失败"); }
    finally { setBusy(false); }
  }

  async function archive() {
    const { error } = await supabase.from("jobs").update({ status: "archived", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) setMessage(error.message); else setJob({ ...job!, status: "archived" });
  }

  async function prepareApplication(){
    setBusy(true);setMessage("正在生成招呼语并检查投递材料…");
    try{const response=await fetch("/api/applications/prepare",{method:"POST",headers:await authHeaders(),body:JSON.stringify({job_id:id,variant:"concise"})});const result=await response.json();if(!response.ok)throw new Error(result.error);setApplicationId(result.application.id);window.location.href=`/applications/${result.application.id}/confirm`;}
    catch(error){setMessage(error instanceof Error?error.message:"准备投递失败")}finally{setBusy(false)}
  }

  function toggle(group: keyof SelectedResumeItems, itemId: string) {
    setSelected(current => ({ ...current, [group]: current[group].includes(itemId) ? current[group].filter(x => x !== itemId) : [...current[group], itemId] }));
  }

  if (!job) return <main className="p-16">读取岗位…</main>;
  return <main className="mx-auto max-w-6xl px-6 py-14">
    <Link href="/jobs" className="text-sm text-neutral-500">← 岗位列表</Link>
    <header className="mt-8 grid gap-8 border-b-2 border-black pb-8 md:grid-cols-[1fr_auto]">
      <div><p className="text-xl">{job.company_name}</p><h1 className="mt-2 text-5xl font-light">{job.job_title}</h1><p className="mt-4 text-neutral-500">{job.location} · {job.salary}</p></div>
      <div className="min-w-44 border-l border-neutral-300 pl-7"><p className="text-xs tracking-[.2em]">MATCH SCORE</p><p className="mt-3 text-5xl">{job.match_score ?? "—"}<span className="text-lg"> / 100</span></p></div>
    </header>
    <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-neutral-300 pb-5 text-sm"><span><b>SOURCE</b> · {job.source.toUpperCase()}</span>{job.source_url && <a href={job.source_url} target="_blank" rel="noreferrer" className="underline">Open Original Job ↗</a>}<span className="text-neutral-500">Captured {new Date(job.captured_at || job.created_at).toLocaleDateString("zh-CN")}</span></div>
    <div className="my-8 flex flex-wrap items-center gap-4"><button onClick={analyze} disabled={busy} className="bg-black px-6 py-3 text-white">{job.status === "new" ? "分析岗位" : "重新分析"}</button>{match && <><label className="flex items-center gap-2 border border-neutral-400 px-3 py-2">简历方向<select value={resumeDirection} onChange={e=>setResumeDirection(e.target.value as ResumeDirection)} className="bg-transparent"><option value="auto">自动识别</option><option value="product_manager">产品经理</option><option value="landscape_designer">景观设计师</option><option value="research_academic">科研 / 教职</option><option value="content_media">内容 / 新媒体</option></select></label><button onClick={generate} disabled={busy} className="border border-black px-6 py-3">生成定制简历</button></>}<button onClick={archive} className="border border-neutral-400 px-6 py-3">归档</button></div>
    {match&&<section className="mb-10 border border-black p-6"><p className="text-xs tracking-[.2em]">APPLICATION</p><div className="mt-4 flex flex-wrap items-center justify-between gap-4"><div><p>Resume：使用该岗位最新定制版本</p><p>Status：{applicationId?"Prepared":"Not prepared"}</p><p>Greeting：根据岗位与个人资料库生成，可在确认页编辑</p></div>{applicationId?<Link className="bg-black px-6 py-3 text-white" href={`/applications/${applicationId}/confirm`}>打开投递确认</Link>:<button disabled={busy} onClick={()=>void prepareApplication()} className="bg-black px-6 py-3 text-white">Prepare Application</button>}</div></section>}
    {message && <p className="mb-8">{message}</p>}
    {match && <><section className="grid gap-8 md:grid-cols-2"><div><h2 className="mb-4 text-sm tracking-[.2em]">已匹配</h2>{match.matched_requirements.map(x => <p key={x} className="border-t border-neutral-300 py-2">✓ {x}</p>)}</div><div><h2 className="mb-4 text-sm tracking-[.2em]">能力差距</h2>{match.missing_requirements.map(x => <p key={x} className="border-t border-neutral-300 py-2">△ {x}</p>)}</div></section><section className="mt-12"><h2 className="text-3xl font-light">推荐资料</h2>{groups.map(([selectedKey, matchKey, label]) => <div key={label} className="mt-8"><h3 className="border-b border-black pb-2 text-sm tracking-[.18em]">{label}</h3>{(match[matchKey] as Recommendation[]).map(item => <label key={item.id} className="grid cursor-pointer grid-cols-[auto_1fr_auto] gap-4 border-b border-neutral-200 py-4"><input type="checkbox" checked={selected[selectedKey].includes(item.id)} onChange={() => toggle(selectedKey, item.id)} /><span><b>{item.title}</b><small className="mt-1 block text-neutral-500">{item.reason}</small></span><span>{item.score}%</span></label>)}</div>)}</section></>}
    <details className="mt-12"><summary>查看原始 JD</summary><pre className="mt-4 whitespace-pre-wrap bg-white p-5 text-sm">{job.job_description}</pre></details>
  </main>;
}
