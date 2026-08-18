"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ResumeVersion } from "@/types/job";
import type { ResumeRecord, ResumeTable } from "@/types/resume";

const recordTables: ResumeTable[] = ["experiences", "projects", "research", "publications"];
const labels: Partial<Record<ResumeTable, string>> = { experiences: "工作与实习 / EXPERIENCE", projects: "项目经历 / SELECTED PROJECTS", research: "科研经历 / RESEARCH", publications: "论文成果 / PUBLICATIONS" };
const title = (item: ResumeRecord) => String(item.company ?? item.title_cn ?? item.title ?? item.name ?? "");
const subtitle = (item: ResumeRecord) => String(item.position ?? item.role ?? item.journal ?? "");
const dates = (item: ResumeRecord) => [item.start_date ?? item.publication_date, item.end_date].filter(Boolean).join(" — ");
const skillGroups = [
  { label: "数据与 AI / DATA & AI", categories: ["Data", "AI", "AI Tools", "Programming", "Computer Vision"] },
  { label: "设计与建模 / DESIGN & MODELING", categories: ["Design", "Modeling"] },
  { label: "内容与新媒体 / CONTENT & NEW MEDIA", categories: ["Media", "New Media"] },
  { label: "语言 / LANGUAGE", categories: ["Language"] },
];
function groupedSkills(items: ResumeRecord[]) {
  const known = new Set(skillGroups.flatMap(group => group.categories));
  const groups = skillGroups.map(group => ({ label: group.label, values: items.filter(item => group.categories.includes(String(item.category ?? ""))).flatMap(item => String(item.name ?? "").split("·").map(value => value.trim())).filter(Boolean) }));
  const other = items.filter(item => !known.has(String(item.category ?? ""))).flatMap(item => String(item.name ?? "").split("·").map(value => value.trim())).filter(Boolean);
  if (other.length) groups.push({ label: "其他 / OTHER", values: other });
  return groups.map(group => ({ ...group, values: [...new Set(group.values)] })).filter(group => group.values.length > 0);
}

export default function ResumeVersionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [version, setVersion] = useState<ResumeVersion | null>(null);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(false);
  useEffect(() => { void supabase.from("resume_versions").select("*").eq("id", id).single().then(({ data }) => setVersion(data as ResumeVersion)); }, [id]);

  async function save(next = version) {
    if (!next) return;
    const { error } = await supabase.from("resume_versions").update({ content: next.content, updated_at: new Date().toISOString() }).eq("id", id);
    setMessage(error?.message ?? "已保存");
  }
  function updateRewrite(index: number, patch: Record<string, unknown>) {
    if (!version) return;
    const rewrites = version.content.rewrites.map((item, i) => i === index ? { ...item, ...patch } : item);
    setVersion({ ...version, content: { ...version.content, rewrites } });
  }
  function finalText(record: ResumeRecord) {
    const recordId = record.id;
    const rewrite = version?.content.rewrites.find(item => item.record_id === recordId);
    if (rewrite) return rewrite.accepted ? rewrite.targeted : rewrite.original;
    const raw = record.description ?? record.highlights ?? record.results ?? "";
    return Array.isArray(raw) ? raw.map(String).join("；") : String(raw);
  }
  function finalTitle(record:ResumeRecord){const rewrite=version?.content.rewrites.find(item=>item.record_id===record.id);return rewrite?.accepted&&rewrite.targeted_title?rewrite.targeted_title:title(record)}

  if (!version) return <main className="p-16">读取简历版本…</main>;
  const profile = version.source_snapshot.profile;
  const sectionRank=(key:string)=>{const normalized=key==="experiences"?"experience":key;const index=version.content.section_order?.indexOf(normalized)??-1;return index<0?50:index};
  const selectedRecordCount=version.content.selected.experiences.length+version.content.selected.projects.length+version.content.selected.research.length+version.content.selected.publications.length;
  const resumeTextLength=version.content.summary.length+version.content.rewrites.filter(item=>item.accepted).reduce((sum,item)=>sum+item.targeted.length,0);
  const densityClass=resumeTextLength>2200||selectedRecordCount>7?"resume-density-ultra":resumeTextLength>1500||selectedRecordCount>5?"resume-density-tight":"resume-density-normal";
  return <>
    <main className={`${preview ? "hidden " : ""}screen-only mx-auto max-w-6xl px-6 py-14`}>
      <Link href="/resumes" className="text-sm text-neutral-500">← 简历版本</Link>
      <header className="my-8 border-b-2 border-black pb-7"><p>基于个人资料库生成</p><h1 className="mt-2 text-5xl font-light">{version.target_company}</h1><p className="mt-3 text-xl">{version.target_job}</p><p className="mt-3 text-sm text-neutral-500">生成日期：{new Date(version.created_at).toLocaleDateString("zh-CN")}</p></header>
      {version.content.strategy&&<section className="mb-8 border border-neutral-400 p-5"><p className="text-xs tracking-[.2em]">RESUME STRATEGY · {version.content.strategy.label}</p><p className="mt-2">{version.content.strategy.positioning}</p><p className="mt-2 text-sm text-neutral-600">重点：{version.content.strategy.writing_focus.join(" · ")}</p><p className="mt-2 text-sm text-neutral-600">板块顺序：{version.content.section_order.join(" → ")}</p></section>}
      <section><h2 className="text-sm tracking-[.2em]">定向摘要</h2><textarea value={version.content.summary} onChange={e => setVersion({ ...version, content: { ...version.content, summary: e.target.value } })} className="mt-4 min-h-28 w-full border border-neutral-300 bg-white p-4" /></section>
      <section className="mt-12"><h2 className="text-3xl font-light">原文 / 两点式 STAR 改写</h2>{version.content.rewrites.map((rewrite, index) => <article key={`${rewrite.record_id}-${index}`} className="mt-7 border-t border-neutral-300 pt-6"><div className="grid gap-6 md:grid-cols-2"><div><p className="mb-2 text-xs tracking-[.18em] text-neutral-500">ORIGINAL</p><h3 className="mb-2 font-medium">{rewrite.original_title}</h3><p className="whitespace-pre-line leading-7">{rewrite.original}</p></div><div><p className="mb-2 text-xs tracking-[.18em] text-neutral-500">TARGETED · TITLE + 2 STAR POINTS</p><input value={rewrite.targeted_title??rewrite.original_title??""} onChange={e=>updateRewrite(index,{targeted_title:e.target.value})} className="mb-3 w-full border border-neutral-300 bg-white p-3 font-medium"/><textarea value={rewrite.targeted} onChange={e => updateRewrite(index, { targeted: e.target.value })} className="min-h-40 w-full border border-neutral-300 bg-white p-3" /></div></div><div className="mt-4 flex gap-3"><button onClick={() => updateRewrite(index, { accepted: true })} className={rewrite.accepted ? "bg-black px-4 py-2 text-white" : "border px-4 py-2"}>接受标题与STAR改写</button><button onClick={() => updateRewrite(index, { accepted: false, targeted: rewrite.original, targeted_title:rewrite.original_title })} className="border px-4 py-2">使用原文</button></div></article>)}</section>
      <div className="sticky bottom-4 mt-10 flex gap-4 bg-[#f5f5f2] p-4"><button onClick={() => save()} className="bg-black px-7 py-3 text-white">保存修改</button><button onClick={() => setPreview(true)} className="border border-black px-7 py-3">预览简历</button>{message && <span className="self-center">{message}</span>}</div>
    </main>
    <div className={preview ? "targeted-preview-shell" : "print-only"}>
      <div className="no-print targeted-preview-toolbar"><button onClick={() => setPreview(false)}>返回修改</button><button onClick={() => window.print()}>打印 / PDF</button></div>
    <main className={`targeted-print ${densityClass}`} style={{display:"flex",flexDirection:"column"}}>
      <header className="targeted-print-header" style={{order:-100}}><div><h1>{profile?.name_cn}</h1><p>{profile?.name_en}</p></div>{profile?.avatar_url && <img src={profile.avatar_url} alt="头像" width={98} height={98} style={{ width: "26mm", height: "26mm", borderRadius: "50%", objectFit: "cover" }} />}</header>
      <p className="targeted-print-contact" style={{order:-99}}>{[profile?.city, profile?.email, profile?.phone, profile?.website].filter(Boolean).join(" · ")}</p>
      <p className="targeted-print-role" style={{order:-98}}>目标岗位：{version.target_job} · {version.target_company}</p>
      {version.content.summary && <section style={{order:sectionRank("profile")}}><h2>个人简介 / PROFILE</h2><p>{version.content.summary}</p></section>}
      {version.source_snapshot.education.length > 0 && <section className="targeted-education" style={{order:sectionRank("education")}}><h2>教育背景 / EDUCATION</h2>{version.source_snapshot.education.map(item => <article key={item.id}><div className="targeted-print-date">{dates(item)}</div><div className="targeted-education-line"><h3>{String(item.school ?? item.name ?? "")}</h3><p>{[item.degree, item.major, item.location].filter(Boolean).map(String).join(" · ")}</p></div></article>)}</section>}
      {recordTables.map(table => {
        const selectedIds = table === "experiences" ? version.content.selected.experiences : table === "projects" ? version.content.selected.projects : table === "research" ? version.content.selected.research : version.content.selected.publications;
        const records = version.source_snapshot[table].filter(item => selectedIds.includes(item.id));
        return records.length > 0 && <section key={table} style={{order:sectionRank(table)}}><h2>{labels[table]}</h2>{records.map(item => <article key={item.id}><div className="targeted-print-date">{dates(item)}</div><div><h3>{finalTitle(item)}</h3><p className="targeted-print-subtitle">{subtitle(item)}</p><p className="targeted-print-copy">{finalText(item)}</p></div></article>)}</section>;
      })}
      {version.source_snapshot.skills.length > 0 && <section style={{order:sectionRank("skills")}}><h2>专业技能 / SKILLS</h2><div className="targeted-skill-groups" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)" }}>{groupedSkills(version.content.selected.skills.length ? version.source_snapshot.skills.filter(item => version.content.selected.skills.includes(item.id)) : version.source_snapshot.skills).map(group => <p key={group.label} style={{ display: "grid", gridTemplateColumns: "46mm minmax(0, 1fr)", width: "100%" }}><b>{group.label}</b><span>{group.values.join(" · ")}</span></p>)}</div></section>}
      {version.source_snapshot.awards.length > 0 && <section style={{order:sectionRank("awards")}}><h2>奖项荣誉 / AWARDS</h2><div className="targeted-awards" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)" }}>{version.source_snapshot.awards.map(item => <p key={item.id} style={{ display: "grid", gridTemplateColumns: "34mm minmax(0, 1fr)", width: "100%" }}><span>{String(item.award_date ?? item.start_date ?? "")}</span><b>{String(item.title ?? item.name ?? "")}</b></p>)}</div></section>}
    </main></div>
  </>;
}
