"use strict";
(() => {
  // src/api/jobAgent.ts
  async function importJob(baseUrl, token, job) {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/jobs/import`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(job) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Import failed");
    return result;
  }

  // src/popup.ts
  var $ = (id) => document.getElementById(id);
  var fields = ["company_name", "job_title", "location", "salary", "job_description"];
  var current = null;
  var visibleCandidates = [];
  var currentApplication = null;
  var assistantBase = "";
  var assistantToken = "";
  async function send(tabId, type) {
    try {
      return await chrome.tabs.sendMessage(tabId, { type });
    } catch {
      await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
      return chrome.tabs.sendMessage(tabId, { type });
    }
  }
  async function settings() {
    const saved = await chrome.storage.local.get(["base_url", "token"]);
    const base = typeof saved.base_url === "string" ? saved.base_url : "http://localhost:3000";
    const token = typeof saved.token === "string" ? saved.token : "";
    $("base_url").value = base;
    $("token").value = token;
    return { base, token };
  }
  async function loadAssistant() {
    const { base, token } = await settings();
    assistantBase = base.replace(/\/$/, "");
    assistantToken = token;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url || !token || !tab.url.includes("zhipin.com/job_detail")) return;
    try {
      const response = await fetch(`${assistantBase}/api/applications/lookup?source_url=${encodeURIComponent(tab.url)}`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok || !result.found) return;
      currentApplication = result.application;
      if (!currentApplication) return;
      $("assistant").hidden = false;
      $("application_info").textContent = `Match ${result.match_score ?? "\u2014"}% \xB7 Resume ${currentApplication.resume_version_id ? "Ready" : "Missing"} \xB7 Greeting ${currentApplication.greeting_text ? "Ready" : "Missing"} \xB7 ${currentApplication.application_status}`;
    } catch {
    }
  }
  $("copy_greeting").addEventListener("click", async () => {
    if (!currentApplication?.greeting_text) return fail("\u5C1A\u672A\u51C6\u5907\u62DB\u547C\u8BED");
    await navigator.clipboard.writeText(currentApplication.greeting_text);
    $("status").textContent = "\u62DB\u547C\u8BED\u5DF2\u590D\u5236\uFF0C\u8BF7\u5728 BOSS \u4E2D\u786E\u8BA4\u540E\u53D1\u9001\u3002";
  });
  $("open_resume").addEventListener("click", () => {
    if (!currentApplication?.resume_version_id) return fail("\u5C1A\u672A\u51C6\u5907\u7B80\u5386");
    void chrome.tabs.create({ url: `${assistantBase}/resumes/${currentApplication.resume_version_id}` });
  });
  $("mark_sent").addEventListener("click", async () => {
    if (!currentApplication) return;
    const response = await fetch(`${assistantBase}/api/applications/${currentApplication.id}/sent`, { method: "POST", headers: { Authorization: `Bearer ${assistantToken}` } });
    const result = await response.json();
    if (!response.ok) return fail(result.error || "\u8BB0\u5F55\u5931\u8D25");
    currentApplication = result.application;
    $("application_info").textContent = `Match ${currentApplication.match_score_snapshot ?? "\u2014"}% \xB7 Sent`;
    $("status").textContent = result.duplicate ? "\u8BE5\u5C97\u4F4D\u5DF2\u8BB0\u5F55\u4E3A\u5DF2\u6295\u9012" : "\u5DF2\u8BB0\u5F55\u6295\u9012\u65F6\u95F4\u4E0E\u5FEB\u7167";
  });
  async function init() {
    const { base } = await settings();
    $("open").href = `${base.replace(/\/$/, "")}/jobs`;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return fail("\u65E0\u6CD5\u8BFB\u53D6\u5F53\u524D\u6807\u7B7E\u9875");
    if (tab.url?.includes("/web/geek/job")) {
      const response = await send(tab.id, "EXTRACT_CANDIDATES");
      visibleCandidates = response.candidates ?? [];
      $("title").textContent = "\u641C\u7D22\u7ED3\u679C\u6279\u91CF\u91C7\u96C6";
      $("company").textContent = `\u5F53\u524D\u5C4F\u5E55\u8BC6\u522B ${visibleCandidates.length} \u6761\u5C97\u4F4D`;
      $("detail_fields").hidden = true;
      $("save").hidden = true;
      $("batch").hidden = false;
      const stored = await chrome.storage.local.get("batch_status");
      if (stored.batch_status) showProgress(stored.batch_status);
      return;
    }
    try {
      const response = await send(tab.id, "EXTRACT_JOB");
      if (!response.ok || !response.extraction) return fail(response.error || "\u65E0\u6CD5\u8BFB\u53D6\u5F53\u524D\u5C97\u4F4D");
      current = response.extraction.job;
      fields.forEach((key) => $(key).value = current[key]);
      $("title").textContent = current.job_title || "\u8BF7\u786E\u8BA4\u5C97\u4F4D";
      $("company").textContent = `${current.company_name} \xB7 ${current.salary}`;
      $("warning").hidden = !response.extraction.needs_confirmation;
    } catch (error) {
      fail(error instanceof Error ? error.message : "\u65E0\u6CD5\u8BFB\u53D6\u5F53\u524D\u5C97\u4F4D");
    }
  }
  function fail(message) {
    $("status").textContent = message;
    $("title").textContent = "\u8BFB\u53D6\u5931\u8D25";
  }
  function showProgress(value) {
    if (value.running) $("status").textContent = `\u6B63\u5728\u5904\u7406 ${value.index}/${value.total}\uFF1A${value.title}\uFF0C\u5DF2\u4FDD\u5B58 ${value.saved}`;
    else if (value.complete) $("status").textContent = `\u5B8C\u6210\uFF1A\u5DF2\u4FDD\u5B58\u5E76\u5206\u6790 ${value.saved} \u6761\u5C97\u4F4D`;
    else if (value.stopped) $("status").textContent = `\u5DF2\u505C\u6B62\uFF1A${value.error}\uFF08\u5DF2\u4FDD\u5B58 ${value.saved} \u6761\uFF09`;
  }
  $("save").addEventListener("click", async () => {
    if (!current) return fail("\u6CA1\u6709\u5C97\u4F4D\u6570\u636E");
    fields.forEach((key) => current[key] = $(key).value.trim());
    const base = $("base_url").value.trim(), token = $("token").value.trim();
    if (!base || !token) return fail("\u8BF7\u586B\u5199 URL \u548C Import Token");
    await chrome.storage.local.set({ base_url: base, token });
    $("status").textContent = "\u6B63\u5728\u4FDD\u5B58\u5E76\u5206\u6790\u2026";
    try {
      const result = await importJob(base, token, current);
      $("status").textContent = `${result.duplicate ? "Already saved" : "\u2713 Saved"} \xB7 Match ${result.match_score}% \xB7 ${result.recommendation}`;
      $("open").href = `${base.replace(/\/$/, "")}/jobs/${result.job_id}`;
    } catch (error) {
      fail(error instanceof Error ? error.message : "\u5BFC\u5165\u5931\u8D25");
    }
  });
  $("batch").addEventListener("click", async () => {
    const base = $("base_url").value.trim(), token = $("token").value.trim();
    if (!base || !token) return fail("\u8BF7\u586B\u5199 URL \u548C Import Token");
    if (!visibleCandidates.length) return fail("\u5F53\u524D\u5C4F\u5E55\u6CA1\u6709\u53EF\u91C7\u96C6\u7684\u5C97\u4F4D\u5361\u7247");
    await chrome.storage.local.set({ base_url: base, token });
    $("status").textContent = "\u6B63\u5728\u6309\u504F\u597D\u9884\u7B5B\u2026";
    const response = await fetch(`${base.replace(/\/$/, "")}/api/jobs/candidates`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ candidates: visibleCandidates }) });
    const result = await response.json();
    if (!response.ok) return fail(result.error || "\u9884\u7B5B\u5931\u8D25");
    const started = await chrome.runtime.sendMessage({ type: "START_BATCH", candidates: result.candidates, base, token });
    if (!started?.ok) return fail(started?.error || "\u65E0\u6CD5\u542F\u52A8\u6279\u91CF\u4EFB\u52A1");
    $("status").textContent = `\u5DF2\u542F\u52A8\uFF0C\u4F9D\u6B21\u5904\u7406 ${result.candidates.length} \u6761\u5C97\u4F4D`;
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "BATCH_PROGRESS") showProgress(message);
  });
  void init();
  void loadAssistant();
})();
