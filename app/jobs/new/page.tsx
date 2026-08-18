"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JobImport } from "@/types/job";

const initial: JobImport = { source: "manual", source_url: "", source_job_id: "", company_name: "", job_title: "", location: "", salary: "", experience_requirement: "", education_requirement: "", job_description: "", company_industry: "", company_size: "", recruiter_name: "", recruiter_title: "", captured_at: "" };
export default function NewJobPage() {
  const router = useRouter(); const [form, setForm] = useState(initial); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit() { setBusy(true); setError(""); const { data: { session } } = await supabase.auth.getSession(); if (!session) { setError("请先登录"); setBusy(false); return; } const payload = { ...form, source_url: form.source_url || `manual://${crypto.randomUUID()}` }; const response = await fetch("/api/jobs/import", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok) setError(result.error); else router.push(`/jobs/${result.job_id}`); setBusy(false); }
  const fields: Array<[keyof JobImport, string]> = [["company_name", "公司名称"], ["job_title", "岗位名称"], ["location", "地点"], ["salary", "薪资"], ["experience_requirement", "经验要求"], ["education_requirement", "学历要求"], ["company_industry", "行业"], ["company_size", "公司规模"], ["source_url", "来源链接"]];
  return <main className="mx-auto max-w-3xl px-6 py-14"><Link href="/jobs" className="text-sm text-neutral-500">← 返回岗位</Link><h1 className="my-9 text-5xl font-light">手动导入岗位</h1>{error && <p className="mb-5 text-red-700">{error}</p>}<div className="grid gap-5 md:grid-cols-2">{fields.map(([key, label]) => <label key={key}><span className="mb-2 block text-xs text-neutral-500">{label}</span><input className="w-full border bg-white p-3" value={String(form[key])} onChange={event => setForm({ ...form, [key]: event.target.value })} /></label>)}<label className="md:col-span-2"><span className="mb-2 block text-xs text-neutral-500">完整 JD</span><textarea className="min-h-96 w-full border bg-white p-4" value={form.job_description} onChange={event => setForm({ ...form, job_description: event.target.value })} /></label></div><button disabled={busy} onClick={submit} className="mt-7 w-full bg-black p-4 text-white">{busy ? "正在保存并分析…" : "保存并自动分析"}</button></main>;
}
