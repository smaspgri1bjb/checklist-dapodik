/**
 * Dapodik Checklist — sync.js
 * Sinkronisasi opsional ke Google Sheets lewat Web App Google Apps Script
 * (lihat google-apps-script.gs). Sepenuhnya opsional — aplikasi tetap
 * berfungsi penuh secara lokal tanpa fitur ini.
 */
(function () {
  "use strict";

  const STORAGE_URL = "dapodik:sync:url";
  const STORAGE_TOKEN = "dapodik:sync:token";
  const STORAGE_LAST = "dapodik:sync:lastSyncedAt";

  function buildItemsMeta() {
    const items = [];
    DAPODIK_DATA.stages.forEach((stage) => {
      stage.sections.forEach((section) => {
        section.items.forEach((item) => {
          items.push({ id: item.id, tahap: stage.title, bagian: section.title, label: item.label });
        });
      });
    });
    return items;
  }

  function getSettings() {
    return {
      url: localStorage.getItem(STORAGE_URL) || "",
      token: localStorage.getItem(STORAGE_TOKEN) || "",
    };
  }

  function saveSettings(url, token) {
    localStorage.setItem(STORAGE_URL, (url || "").trim());
    localStorage.setItem(STORAGE_TOKEN, (token || "").trim());
  }

  function getLastSyncedAt() {
    return localStorage.getItem(STORAGE_LAST) || "";
  }

  async function push() {
    const { url, token } = getSettings();
    if (!url || !token) throw new Error("Isi URL Web App dan token terlebih dahulu.");

    const payload = {
      semesterLabel: window.DapodikApp.getSemesterLabel(),
      items: buildItemsMeta(),
      progress: window.DapodikApp.getActiveProgress(),
      history: window.DapodikHistory.getHistory(),
    };

    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        // text/plain menghindari CORS preflight yang tidak didukung Apps Script
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ token, action: "push", payload }),
      });
    } catch (err) {
      throw new Error("Gagal terhubung ke Google Sheets. Periksa URL dan koneksi internet.");
    }

    const data = await safeJson(res);
    if (!data || !data.ok) throw new Error((data && data.error) || "Gagal mengirim data.");
    localStorage.setItem(STORAGE_LAST, data.syncedAt || new Date().toISOString());
    return data;
  }

  async function pull() {
    const { url, token } = getSettings();
    if (!url || !token) throw new Error("Isi URL Web App dan token terlebih dahulu.");

    let fetchUrl;
    try {
      const u = new URL(url);
      u.searchParams.set("action", "pull");
      u.searchParams.set("token", token);
      fetchUrl = u.toString();
    } catch (err) {
      throw new Error("URL Web App tidak valid.");
    }

    let res;
    try {
      res = await fetch(fetchUrl);
    } catch (err) {
      throw new Error("Gagal terhubung ke Google Sheets. Periksa URL dan koneksi internet.");
    }

    const data = await safeJson(res);
    if (!data || !data.ok) throw new Error((data && data.error) || "Gagal mengambil data.");

    window.DapodikApp.loadProgress(data.progress || {});
    window.DapodikApp.setSemesterLabel(data.semesterLabel || "");
    const normalizedHistory = (data.history || []).map((r) => ({
      id: r.id,
      label: r.label,
      archivedAt: r.archivedAt,
      progress: r.progress || {},
      // Sheet hanya menyimpan ringkasan (done/total/pct); hitung ulang rincian
      // per-tahap di sisi aplikasi berdasarkan snapshot progres yang ditarik.
      stats: window.DapodikHistory.computeStats(r.progress || {}),
    }));
    window.DapodikHistory.setHistory(normalizedHistory);
    localStorage.setItem(STORAGE_LAST, new Date().toISOString());
    return data;
  }

  async function safeJson(res) {
    try {
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  window.DapodikSync = { getSettings, saveSettings, getLastSyncedAt, push, pull };
})();
