/**
 * Dapodik Checklist — history.js
 * Menyimpan snapshot progres per semester (localStorage) dan menyediakan
 * tampilan perbandingan antar semester. Bergantung pada window.DapodikApp
 * (didefinisikan di app.js) dan DAPODIK_DATA (data.js).
 */
(function () {
  "use strict";

  const STORAGE_HISTORY = "dapodik:history:v1";

  // ---------- Storage ----------
  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn("Gagal membaca riwayat semester.", e);
      return [];
    }
  }

  function saveHistory(list) {
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(list));
  }

  // ---------- Stats ----------
  function computeStats(progressObj) {
    let total = 0;
    let done = 0;
    const perStage = DAPODIK_DATA.stages.map((stage) => {
      let sTotal = 0;
      let sDone = 0;
      stage.sections.forEach((section) =>
        section.items.forEach((item) => {
          sTotal++;
          total++;
          if (progressObj[item.id]) {
            sDone++;
            done++;
          }
        })
      );
      return {
        stageId: stage.id,
        number: stage.number,
        title: stage.title,
        priority: stage.priority,
        done: sDone,
        total: sTotal,
        pct: sTotal ? Math.round((sDone / sTotal) * 100) : 0,
      };
    });
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0, perStage };
  }

  // ---------- Archive / restore / delete ----------
  function archiveCurrentSemester() {
    const app = window.DapodikApp;
    const progress = app.getActiveProgress();
    const rawLabel = app.getSemesterLabel().trim();
    const label = rawLabel || `Semester diarsipkan ${new Date().toLocaleDateString("id-ID")}`;

    const record = {
      id: "sem-" + Date.now(),
      label,
      archivedAt: new Date().toISOString(),
      progress,
      stats: computeStats(progress),
    };

    const history = loadHistory();
    history.unshift(record);
    saveHistory(history);
    return record;
  }

  function deleteRecord(id) {
    const history = loadHistory().filter((r) => r.id !== id);
    saveHistory(history);
  }

  function getRecord(id) {
    return loadHistory().find((r) => r.id === id);
  }

  // ---------- Rendering ----------
  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return iso;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const container = document.getElementById("historyView");
    const history = loadHistory();

    container.innerHTML = `
      <div class="history-toolbar">
        <div>
          <h2 class="history-title">Riwayat Semester</h2>
          <p class="history-sub">Arsipkan progres semester berjalan sebagai catatan, lalu mulai checklist kosong untuk semester berikutnya.</p>
        </div>
        <button id="archiveBtn" class="btn btn-primary">Arsipkan semester ini &amp; mulai baru</button>
      </div>

      <div class="history-list" id="historyList">
        ${
          history.length
            ? history.map(cardHtml).join("")
            : `<p class="history-empty">Belum ada semester yang diarsipkan. Progres semester berjalan akan tetap tersimpan sampai Anda menekan "Arsipkan &amp; mulai baru".</p>`
        }
      </div>

      <div class="compare-card">
        <h3 class="compare-title">Bandingkan Progres</h3>
        <div class="compare-selects">
          <label>Semester A <select id="compareA">${optionsHtml(history)}</select></label>
          <label>Semester B <select id="compareB">${optionsHtml(history)}</select></label>
        </div>
        <div id="compareResult"></div>
      </div>
    `;

    document.getElementById("archiveBtn").addEventListener("click", onArchiveClick);

    container.querySelectorAll("[data-action='restore']").forEach((btn) =>
      btn.addEventListener("click", () => onRestore(btn.getAttribute("data-id")))
    );
    container.querySelectorAll("[data-action='delete']").forEach((btn) =>
      btn.addEventListener("click", () => onDelete(btn.getAttribute("data-id")))
    );

    const selA = document.getElementById("compareA");
    const selB = document.getElementById("compareB");
    // Default: A = arsip terbaru (jika ada), B = semester aktif
    selA.value = history.length ? history[0].id : "current";
    selB.value = "current";
    selA.addEventListener("change", renderComparison);
    selB.addEventListener("change", renderComparison);
    renderComparison();
  }

  function optionsHtml(history) {
    const currentLabel = window.DapodikApp.getSemesterLabel().trim() || "Tanpa label";
    let html = `<option value="current">Semester aktif — ${escapeHtml(currentLabel)}</option>`;
    html += history
      .map((r) => `<option value="${r.id}">${escapeHtml(r.label)} (${formatDate(r.archivedAt)})</option>`)
      .join("");
    return html;
  }

  function cardHtml(record) {
    return `
      <div class="history-card">
        <div class="history-card-head">
          <strong>${escapeHtml(record.label)}</strong>
          <span class="history-date">${formatDate(record.archivedAt)}</span>
        </div>
        <div class="history-card-progress">
          <div class="stage-progress-track"><div class="stage-progress-fill" style="width:${record.stats.pct}%"></div></div>
          <span class="stage-progress-text">${record.stats.done}/${record.stats.total} · ${record.stats.pct}%</span>
        </div>
        <div class="history-card-actions">
          <button class="btn btn-ghost" data-action="restore" data-id="${record.id}">Pulihkan ke aktif</button>
          <button class="btn btn-ghost btn-danger" data-action="delete" data-id="${record.id}">Hapus</button>
        </div>
      </div>
    `;
  }

  function resolveStatsAndLabel(id) {
    if (id === "current") {
      return {
        label: window.DapodikApp.getSemesterLabel().trim() || "Semester aktif",
        stats: computeStats(window.DapodikApp.getActiveProgress()),
      };
    }
    const record = getRecord(id);
    if (!record) return null;
    return { label: record.label, stats: record.stats };
  }

  function renderComparison() {
    const selA = document.getElementById("compareA");
    const selB = document.getElementById("compareB");
    const result = document.getElementById("compareResult");
    if (!selA || !selB || !result) return;

    const a = resolveStatsAndLabel(selA.value);
    const b = resolveStatsAndLabel(selB.value);
    if (!a || !b) {
      result.innerHTML = `<p class="history-empty">Pilih dua semester untuk dibandingkan.</p>`;
      return;
    }

    const delta = b.stats.pct - a.stats.pct;
    const deltaClass = delta > 0 ? "delta-up" : delta < 0 ? "delta-down" : "delta-flat";
    const deltaSign = delta > 0 ? "+" : "";

    const overall = `
      <div class="compare-overall">
        <div class="compare-overall-col">
          <span class="compare-overall-label">${escapeHtml(a.label)}</span>
          <strong class="compare-overall-pct">${a.stats.pct}%</strong>
          <span class="compare-overall-sub">${a.stats.done}/${a.stats.total} item</span>
        </div>
        <div class="compare-overall-delta ${deltaClass}">${deltaSign}${delta}%</div>
        <div class="compare-overall-col">
          <span class="compare-overall-label">${escapeHtml(b.label)}</span>
          <strong class="compare-overall-pct">${b.stats.pct}%</strong>
          <span class="compare-overall-sub">${b.stats.done}/${b.stats.total} item</span>
        </div>
      </div>
    `;

    const rows = a.stats.perStage
      .map((stageA, i) => {
        const stageB = b.stats.perStage[i];
        return `
          <div class="stage-compare-row">
            <span class="stage-compare-label">
              <i class="dot dot-${stageA.priority}"></i>${stageA.number}. ${escapeHtml(stageA.title)}
            </span>
            <div class="stage-compare-bars">
              <div class="compare-bar-track">
                <div class="compare-bar-fill compare-bar-a" style="width:${stageA.pct}%"></div>
              </div>
              <span class="compare-bar-pct">${stageA.pct}%</span>
              <div class="compare-bar-track">
                <div class="compare-bar-fill compare-bar-b" style="width:${stageB.pct}%"></div>
              </div>
              <span class="compare-bar-pct">${stageB.pct}%</span>
            </div>
          </div>
        `;
      })
      .join("");

    result.innerHTML = `
      ${overall}
      <div class="compare-legend">
        <span><i class="swatch swatch-a"></i>${escapeHtml(a.label)}</span>
        <span><i class="swatch swatch-b"></i>${escapeHtml(b.label)}</span>
      </div>
      <div class="stage-compare-list">${rows}</div>
    `;
  }

  function onArchiveClick() {
    const app = window.DapodikApp;
    const currentPct = computeStats(app.getActiveProgress()).pct;
    const ok = confirm(
      `Arsipkan semester "${app.getSemesterLabel().trim() || "(tanpa label)"}" ` +
        `dengan progres ${currentPct}%, lalu mulai checklist kosong untuk semester baru?`
    );
    if (!ok) return;

    archiveCurrentSemester();
    app.loadProgress({});
    const nextLabel = prompt("Nama semester baru (mis. Genap 2026/2027):", "");
    if (nextLabel !== null) app.setSemesterLabel(nextLabel);
    render();
  }

  function onRestore(id) {
    const record = getRecord(id);
    if (!record) return;
    const ok = confirm(
      `Pulihkan progres "${record.label}" ke checklist aktif? Progres aktif saat ini akan ditimpa.`
    );
    if (!ok) return;
    window.DapodikApp.loadProgress(record.progress);
    window.DapodikApp.setSemesterLabel(record.label);
    render();
  }

  function onDelete(id) {
    const record = getRecord(id);
    if (!record) return;
    const ok = confirm(`Hapus arsip "${record.label}"? Tindakan ini tidak bisa dibatalkan.`);
    if (!ok) return;
    deleteRecord(id);
    render();
  }

  window.DapodikHistory = { render, archiveCurrentSemester, computeStats };
})();
