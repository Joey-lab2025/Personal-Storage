"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLinks } from "@/lib/resume-config";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function AdminShell({children}:{children:React.ReactNode}) {
  const path = usePathname();
  const [allowed,setAllowed]=useState(false);
  useEffect(()=>{void supabase.auth.getSession().then(({data})=>{if(!data.session)window.location.href="/login";else setAllowed(true)})},[]);
  if(!allowed) return <main className="p-12">正在验证登录状态…</main>;
  return <div className="min-h-screen bg-[#f5f5f2] text-neutral-950 md:grid md:grid-cols-[230px_1fr]">
    <aside className="border-b border-neutral-300 p-7 md:min-h-screen md:border-b-0 md:border-r">
      <Link href="/admin" className="mb-10 block text-xl tracking-tight">JOEY / DATABASE</Link>
      <nav className="flex gap-4 overflow-auto md:flex-col">
        {adminLinks.map(item => <Link key={item} href={item === "resume" ? "/resume" : `/admin/${item}`} className={`whitespace-nowrap text-sm capitalize ${path.includes(`/${item}`) ? "font-medium" : "text-neutral-500"}`}>{item.replace("projects-resume","projects")}</Link>)}
      </nav>
    </aside>
    <main className="p-6 md:p-12">{children}</main>
  </div>;
}
