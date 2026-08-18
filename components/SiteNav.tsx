import Link from "next/link";
const links=[
 {href:"/",label:"工作台"},{href:"/jobs",label:"岗位"},{href:"/jobs/candidates",label:"候选岗位"},
 {href:"/resumes",label:"定制简历"},{href:"/applications",label:"投递管理"},{href:"/admin",label:"个人资料库"},{href:"/settings/jobs",label:"筛选设置"},
];
export default function SiteNav(){return <header className="site-nav no-print"><Link href="/" className="site-nav-brand">JOB AGENT</Link><nav aria-label="主要导航">{links.map(item=><Link key={item.href} href={item.href}>{item.label}</Link>)}</nav></header>}

