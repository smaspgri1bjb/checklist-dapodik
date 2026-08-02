/**
 * Dapodik Checklist — sync.js
 * Sinkronisasi otomatis (autosave) ke Google Sheets lewat Web App Google
 * Apps Script. URL & token diambil dari sync-config.js (diatur admin, tidak
 * bisa diubah lewat antarmuka). Jika tidak dikonfigurasi, aplikasi tetap
 * berfungsi penuh secara lokal — fitur ini sepenuhnya opsional.
 */
(function () {
  "use strict";

  const STORAGE_LAST = "dapodik:sync:lastSyncedAt";
  const AUTO_PUSH_DELAY_MS = 1500;

  const config = Object.assign({ url: "", token: "" }, window.DAPODIK_SYNC_CONFIG || {});

  let status = "idle"; // idle | pending | saving | saved | error
  let lastErrorMessage = "";
  let pushTimer = null;
  let pushInFlight = false;
  let pushQueuedAgain = false;

  function isConfigured() {
    return !!(config.url && config.token);
  }

  // ---------- Payload ----------
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

  function buildPayload() {
    return {
      semesterLabel: window.DapodikApp.getSemesterLabel(),
      items: buildItemsMeta(),
      progress: window.DapodikApp.getActiveProgress(),
      history: window.DapodikHistory.getHistory(),
    };
  }

  // ---------- Status ----------
  function setStatus(next, message) {
    status = next;
    lastErrorMessage = message || "";
    updateStatusDom();
  }

  function updateStatusDom() {
    const el = document.getElementById("syncStatusText");
    if (!el) return; // tab Riwayat sedang tidak aktif — aman diabaikan
    el.className = "sync-status sync-status-" + status;
    el.textContent = statusLabel();
  }

  function statusLabel() {
    if (!isConfigured()) return "Sinkronisasi belum diaktifkan";
    switch (status) {
      case "pending":
        return "Perubahan menunggu disinkronkan…";
      case "saving":
        return "Menyinkronkan ke Google Sheets…";
      case "saved":
        return "Tersinkron • " + formatTime(getLastSyncedAt());
      case "error":
        return "Gagal sinkron: " + lastErrorMessage;
      default:
        return getLastSyncedAt() ? "Tersinkron • " + formatTime(getLastSyncedAt()) : "Belum pernah disinkronkan";
    }
  }

  function formatTime(iso) {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("id-ID");
    } catch (e) {
      return iso;
    }
  }

  function getLastSyncedAt() {
    return localStorage.getItem(STORAGE_LAST) || "";
  }

  function getState() {
    return { configured: isConfigured(), status, message: lastErrorMessage, lastSyncedAt: getLastSyncedAt() };
  }

  // ---------- Network ----------
  async function safeJson(res) {
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function doPush() {
    const payload = buildPayload();
    let res;
    try {
      res = await fetch(config.url, {
        method: "POST",
        // text/plain menghindari CORS preflight yang tidak didukung Apps Script
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ token: config.token, action: "push", payload }),
      });
    } catch (err) {
      throw new Error("Gagal terhubung ke Google Sheets.");
    }
    const data = await safeJson(res);
    if (!data || !data.ok) throw new Error((data && data.error) || "Gagal mengirim data.");
    localStorage.setItem(STORAGE_LAST, data.syncedAt || new Date().toISOString());
    return data;
  }

  async function doPull() {
    let fetchUrl;
    try {
      const u = new URL(config.url);
      u.searchParams.set("action", "pull");
      u.searchParams.set("token", config.token);
      fetchUrl = u.toString();
    } catch (err) {
      throw new Error("URL sinkronisasi tidak valid.");
    }
    let res;
    try {
      res = await fetch(fetchUrl);
    } catch (err) {
      throw new Error("Gagal terhubung ke Google Sheets.");
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

  // ---------- Auto-push (debounced, coalesced) ----------
  function scheduleAutoPush() {
    if (!isConfigured()) return;
    setStatus("pending");
    clearTimeout(pushTimer);
    pushTimer = setTimeout(runPush, AUTO_PUSH_DELAY_MS);
  }

  async function runPush() {
    if (!isConfigured()) return;
    if (pushInFlight) {
      pushQueuedAgain = true;
      return;
    }
    pushInFlight = true;
    setStatus("saving");
    try {
      await doPush();
      setStatus("saved");
    } catch (err) {
      setStatus("error", err.message);
    } finally {
      pushInFlight = false;
      if (pushQueuedAgain) {
        pushQueuedAgain = false;
        runPush();
      }
    }
  }

  /** Dipakai oleh tombol "Sinkron sekarang" — kirim segera, lewati jeda debounce. */
  function forceSync() {
    if (!isConfigured()) return Promise.resolve();
    clearTimeout(pushTimer);
    return runPush();
  }

  // ---------- Auto-pull sekali saat halaman dimuat ----------
  async function autoPullOnLoad() {
    if (!isConfigured()) {
      updateStatusDom();
      return;
    }
    setStatus("saving");
    try {
      await doPull();
      setStatus("saved");
    } catch (err) {
      setStatus("error", err.message);
    }
  }

  // ---------- Percobaan terakhir menyimpan saat tab ditutup ----------
  window.addEventListener("beforeunload", () => {
    if (!isConfigured()) return;
    if (status !== "pending" && status !== "saving") return;
    try {
      const payload = buildPayload();
      const body = JSON.stringify({ token: config.token, action: "push", payload });
      const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
      navigator.sendBeacon(config.url, blob);
    } catch (e) {
      /* best-effort saja */
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    // Beri waktu app.js merender data lokal terlebih dahulu (instan),
    // baru tarik versi terbaru dari Google Sheets di belakang layar.
    setTimeout(autoPullOnLoad, 50);
  });

  window.DapodikSync = {
    isConfigured,
    getState,
    scheduleAutoPush,
    forceSync,
    refreshStatusDom: updateStatusDom,
  };
})();
