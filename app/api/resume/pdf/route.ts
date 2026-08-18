import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import type { NextRequest } from "next/server";
import { existsSync } from "node:fs";

export const runtime = "nodejs";
export const maxDuration = 60;

async function browserOptions() {
  if (process.env.CHROME_PATH) {
    return { executablePath: process.env.CHROME_PATH, args: chromium.args };
  }
  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    const executablePath = candidates.find(existsSync);
    if (!executablePath) throw new Error("未找到本机 Edge 或 Chrome，请设置 CHROME_PATH。");
    return { executablePath, args: ["--no-sandbox"] };
  }
  return { executablePath: await chromium.executablePath(), args: chromium.args };
}

export async function GET(request: NextRequest) {
  let browser;
  try {
    const { executablePath, args } = await browserOptions();
    browser = await playwright.launch({ executablePath, args, headless: true });
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 } });
    await page.goto(new URL("/resume", request.url).toString(), { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, displayHeaderFooter: false, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": "attachment; filename*=UTF-8''%E5%88%98%E5%BA%B7_%E7%AE%80%E5%8E%86.pdf", "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "PDF generation failed", fallback: "Open /resume, print, and choose Save as PDF." }, { status: 500 });
  } finally { await browser?.close(); }
}
