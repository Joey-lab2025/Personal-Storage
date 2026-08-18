"use strict";
(() => {
  // src/background.ts
  var running = false;
  var pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  var waitForLoad = (tabId) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("\u9875\u9762\u52A0\u8F7D\u8D85\u65F6"));
    }, 3e4);
    function listener(id, info) {
      if (id === tabId && info.status === "complete") {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
  });
  async function extraction(tabId) {
    try {
      return await chrome.tabs.sendMessage(tabId, { type: "EXTRACT_JOB" });
    } catch {
      await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
      return chrome.tabs.sendMessage(tabId, { type: "EXTRACT_JOB" });
    }
  }
  async function progress(payload) {
    await chrome.storage.local.set({ batch_status: payload });
    void chrome.runtime.sendMessage({ type: "BATCH_PROGRESS", ...payload }).catch(() => {
    });
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "START_BATCH") return;
    if (running) {
      sendResponse({ ok: false, error: "\u5DF2\u6709\u6279\u91CF\u4EFB\u52A1\u6B63\u5728\u8FD0\u884C" });
      return;
    }
    running = true;
    sendResponse({ ok: true });
    void run((message.candidates ?? []).slice(0, 20), message.base, message.token).finally(() => {
      running = false;
    });
    return true;
  });
  async function run(candidates, base, token) {
    let saved = 0;
    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index];
      await progress({ running: true, index: index + 1, total: candidates.length, saved, title: candidate.job_title });
      let tab;
      try {
        tab = await chrome.tabs.create({ url: candidate.source_url, active: false });
        if (!tab.id) throw new Error("\u65E0\u6CD5\u6253\u5F00\u5C97\u4F4D\u9875");
        await waitForLoad(tab.id);
        const loaded = await chrome.tabs.get(tab.id);
        if (!loaded.url?.includes("/job_detail/") || /login|security|verify|captcha/i.test(loaded.url)) throw new Error("\u9047\u5230\u767B\u5F55\u6216\u9A8C\u8BC1\u9875\u9762\uFF0C\u6279\u91CF\u91C7\u96C6\u5DF2\u505C\u6B62");
        const response = await extraction(tab.id);
        if (!response.ok || !response.extraction) throw new Error(response.error || "\u65E0\u6CD5\u8BFB\u53D6\u5C97\u4F4D\u8BE6\u60C5");
        if (response.extraction.needs_confirmation) throw new Error("\u5C97\u4F4D\u6838\u5FC3\u5B57\u6BB5\u7F6E\u4FE1\u5EA6\u8FC7\u4F4E\uFF0C\u5DF2\u505C\u6B62\u5E76\u7B49\u5F85\u4EBA\u5DE5\u786E\u8BA4");
        const imported = await fetch(`${base.replace(/\/$/, "")}/api/jobs/import`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(response.extraction.job) });
        const result = await imported.json();
        if (!imported.ok) throw new Error(result.error || "\u5BFC\u5165\u5931\u8D25");
        saved++;
      } catch (error) {
        await progress({ running: false, stopped: true, index: index + 1, total: candidates.length, saved, error: error instanceof Error ? error.message : "\u6279\u91CF\u91C7\u96C6\u5931\u8D25" });
        return;
      } finally {
        if (tab?.id) await chrome.tabs.remove(tab.id).catch(() => {
        });
      }
      if (index < candidates.length - 1) await pause(8e3 + Math.floor(Math.random() * 4e3));
    }
    await progress({ running: false, complete: true, total: candidates.length, saved });
  }
})();
