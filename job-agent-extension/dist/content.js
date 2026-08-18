"use strict";
(() => {
  // src/extractor/boss.ts
  var text = (element) => element?.textContent?.replace(/\s+/g, " ").trim() || "";
  var first = (selectors) => {
    for (const selector of selectors) {
      const value = text(document.querySelector(selector));
      if (value) return { value, confidence: 0.96 };
    }
    return { value: "", confidence: 0 };
  };
  var labelled = (labels) => {
    const elements = [...document.querySelectorAll("span,li,p,div")];
    for (const element of elements) {
      const value = text(element);
      if (value.length < 80 && labels.some((label) => value.startsWith(label))) return { value: value.replace(new RegExp(`^(${labels.join("|")})[\uFF1A:]?\\s*`), ""), confidence: 0.72 };
    }
    return { value: "", confidence: 0 };
  };
  var meta = (name) => document.querySelector(`meta[property="${name}"],meta[name="${name}"]`)?.content?.trim() || "";
  var choose = (...values) => values.find((item) => item.value) || { value: "", confidence: 0 };
  function extractBossJob() {
    const title = choose(first(["h1.name", ".job-title", ".job-detail-box h1", "h1"]), { value: meta("og:title").split("-")[0]?.trim(), confidence: 0.55 });
    const company = choose(first([".company-info .name", ".company-name", ".sider-company .name", "a.company-name"]), labelled(["\u516C\u53F8\u540D\u79F0"]));
    const salary = choose(first([".salary", ".job-banner .salary", ".job-status .salary"]), labelled(["\u85AA\u8D44"]));
    const locationValue = choose(first([".job-primary .text-city", ".job-location", ".location-address"]), labelled(["\u5DE5\u4F5C\u57CE\u5E02", "\u5DE5\u4F5C\u5730\u70B9"]));
    const description = choose(first([".job-sec-text", ".job-detail-section .text", ".job-description", "[class*='job-detail'] [class*='text']"]), { value: meta("description"), confidence: 0.48 });
    const experience = choose(first([".job-primary .job-limit .experience", ".job-experience"]), labelled(["\u7ECF\u9A8C\u8981\u6C42", "\u5DE5\u4F5C\u7ECF\u9A8C"]));
    const education = choose(first([".job-primary .job-limit .degree", ".job-degree"]), labelled(["\u5B66\u5386\u8981\u6C42", "\u5B66\u5386"]));
    const industry = choose(labelled(["\u6240\u5C5E\u884C\u4E1A", "\u884C\u4E1A"]), first([".company-info .industry"]));
    const size = choose(labelled(["\u516C\u53F8\u89C4\u6A21", "\u89C4\u6A21"]), first([".company-info .company-scale"]));
    const recruiter = first([".boss-info .name", ".job-boss-info .name"]);
    const recruiterTitle = first([".boss-info .boss-info-attr", ".job-boss-info .position"]);
    const sourceJobId = locationFromUrl();
    const job = { source: "boss", source_url: location.href, source_job_id: sourceJobId, company_name: company.value, job_title: title.value, location: locationValue.value, salary: salary.value, experience_requirement: experience.value, education_requirement: education.value, job_description: description.value, company_industry: industry.value, company_size: size.value, recruiter_name: recruiter.value, recruiter_title: recruiterTitle.value, captured_at: (/* @__PURE__ */ new Date()).toISOString() };
    const confidence = { company_name: company.confidence, job_title: title.confidence, job_description: description.confidence, salary: salary.confidence, location: locationValue.confidence };
    return { job, confidence, needs_confirmation: [confidence.company_name, confidence.job_title, confidence.job_description].some((value) => value < 0.7) };
  }
  function locationFromUrl() {
    const match = location.pathname.match(/job_detail\/([^./?]+)/);
    return match?.[1] || new URL(location.href).searchParams.get("jobId") || "";
  }

  // src/extractor/bossSearch.ts
  var clean = (value) => value?.replace(/\s+/g, " ").trim() || "";
  var read = (root, selectors) => {
    for (const selector of selectors) {
      const value = clean(root.querySelector(selector)?.textContent);
      if (value) return value;
    }
    return "";
  };
  function extractVisibleBossCandidates() {
    const cards = [...document.querySelectorAll(".job-card-wrapper,.job-list-box li,.search-job-result li,[class*='job-card']")];
    const seen = /* @__PURE__ */ new Set();
    const results = [];
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) continue;
      const anchor = card.querySelector("a[href*='/job_detail/']");
      if (!anchor) continue;
      const sourceUrl = new URL(anchor.href, location.href).toString();
      if (seen.has(sourceUrl)) continue;
      seen.add(sourceUrl);
      results.push({ source_url: sourceUrl, source_job_id: sourceUrl.match(/job_detail\/([^./?]+)/)?.[1] || "", company_name: read(card, [".company-name", "[class*='company-name']", ".company-info h3"]), job_title: read(card, [".job-name", "[class*='job-name']", ".job-title", "h3"]), location: read(card, [".job-area", "[class*='job-area']", ".job-location"]), salary: read(card, [".salary", "[class*='salary']"]), summary: read(card, [".tag-list", ".job-card-footer", ".job-info", "[class*='tag']"]) });
    }
    return results.filter((item) => item.job_title);
  }

  // src/content.ts
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "EXTRACT_JOB") {
      try {
        sendResponse({ ok: true, extraction: extractBossJob() });
      } catch (error) {
        sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unable to read this job." });
      }
      return true;
    }
    if (message?.type === "EXTRACT_CANDIDATES") {
      sendResponse({ ok: true, candidates: extractVisibleBossCandidates() });
      return true;
    }
  });
  var syncTimer;
  var lastSignature = "";
  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => void syncCandidates(), 1200);
  }
  async function syncCandidates() {
    if (!location.pathname.startsWith("/web/geek/job")) return;
    const candidates = extractVisibleBossCandidates();
    const signature = candidates.map((item) => item.source_url).sort().join("|");
    if (!candidates.length || signature === lastSignature) return;
    lastSignature = signature;
    const settings = await chrome.storage.local.get(["base_url", "token"]);
    if (typeof settings.base_url !== "string" || typeof settings.token !== "string" || !settings.token) return;
    try {
      await fetch(`${settings.base_url.replace(/\/$/, "")}/api/jobs/candidates`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${settings.token}` }, body: JSON.stringify({ candidates }) });
      await chrome.storage.local.set({ last_candidate_sync: (/* @__PURE__ */ new Date()).toISOString() });
    } catch {
    }
  }
  if (location.pathname.startsWith("/web/geek/job")) {
    scheduleSync();
    addEventListener("scroll", scheduleSync, { passive: true });
    new MutationObserver(scheduleSync).observe(document.body, { childList: true, subtree: true });
  }
})();
