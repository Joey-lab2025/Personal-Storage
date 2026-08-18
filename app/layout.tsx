import type { Metadata } from "next";
import { IBM_Plex_Sans, Noto_Sans_SC } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const ibm = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ibm", weight: ["300", "400", "500"], display: "swap" });
const noto = Noto_Sans_SC({ subsets: ["latin"], variable: "--font-noto", weight: ["300", "400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "Job Agent · 个人求职资料库",
  description: "个人求职资料管理、岗位分析、定制简历与投递辅助系统",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth">
    <body suppressHydrationWarning className={`${ibm.variable} ${noto.variable}`}>
      <SiteNav />
      {children}
    </body>
  </html>;
}
