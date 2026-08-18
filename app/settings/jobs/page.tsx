"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { JobPreferences } from "@/types/job";

const empty: JobPreferences = { target_titles: [], preferred_cities: [], minimum_salary: null, max_experience_years: 3, preferred_industries: [], excluded_industries: [], excluded_companies: [], included_keywords: [], excluded_keywords: [], auto_skip_score: 65, auto_priority_score: 85 };
const parse = (value: string) => value.split(/[，,\n]/).map(item => item.trim()).filter(Boolean);
const join = (value: string[]) => value.join("，");

export default function JobSettingsPage() {
  const [form, setForm] = useState<JobPreferences>(empty);
  const [message, setMessage] = useState("");
  useEffect(() => { void supabase.from("job_preferences").select("*").limit(1).maybeSingle().then(({ data }) => data && setForm(data as JobPreferences)); }, []);
  async function save() {
    const payload = { ...form, updated_at: new Date().toISOString() };
    const query = form.id ? supabase.from("job_preferences").update(payload).eq("id", form.id) : supabase.from("job_preferences").insert(payload);
    const { data, error } = await query.select().single();
    if (error) setMessage(error.message); else { setForm(data as JobPreferences); setMessage("偏好设置已保存"); }
  }
  const listFields: Array<[keyof JobPreferences, string, string]> = [
    ["target_titles", "目标岗位", "AI 产品、内容产品、品牌运营"], ["preferred_cities", "求职城市", "广州、深圳"],
    ["preferred_industries", "偏好行业", "人工智能、互联网"], ["excluded_industries", "行业黑名单", ""],
    ["excluded_companies", "公司黑名单", ""], ["included_keywords", "关注关键词", "AI、内容、景观"], ["excluded_keywords", "关键词黑名单", "销售、保险"],
  ];
  return <main className="mx-auto max-w-4xl px-6 py-14"><Link href="/jobs" className="text-sm text-neutral-500">← 返回岗位</Link><p className="mt-10 text-xs tracking-[.25em]">JOB PREFERENCES</p><h1 className="mt-2 text-5xl font-light">岗位筛选偏好</h1><div className="mt-10 grid gap-6 md:grid-cols-2">{listFields.map(([key, label, placeholder]) => <label key={key}><span className="mb-2 block text-sm">{label}</span><textarea className="min-h-24 w-full border bg-white p-3" placeholder={placeholder} value={join(form[key] as string[])} onChange={event => setForm({ ...form, [key]: parse(event.target.value) })} /></label>)}<label><span className="mb-2 block text-sm">最低薪资（K/月）</span><input type="number" className="w-full border bg-white p-3" value={form.minimum_salary ?? ""} onChange={event => setForm({ ...form, minimum_salary: event.target.value ? Number(event.target.value) : null })} /></label><label><span className="mb-2 block text-sm">最高经验要求（年）</span><input type="number" className="w-full border bg-white p-3" value={form.max_experience_years ?? ""} onChange={event => setForm({ ...form, max_experience_years: event.target.value ? Number(event.target.value) : null })} /></label><label><span className="mb-2 block text-sm">自动优先分数</span><input type="number" className="w-full border bg-white p-3" value={form.auto_priority_score} onChange={event => setForm({ ...form, auto_priority_score: Number(event.target.value) })} /></label><label><span className="mb-2 block text-sm">自动跳过分数</span><input type="number" className="w-full border bg-white p-3" value={form.auto_skip_score} onChange={event => setForm({ ...form, auto_skip_score: Number(event.target.value) })} /></label></div><button onClick={save} className="mt-8 bg-black px-7 py-3 text-white">保存偏好</button>{message && <span className="ml-5">{message}</span>}</main>;
}
