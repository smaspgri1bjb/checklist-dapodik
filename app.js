/**
 * Dapodik Checklist — app.js
 * Semua progres tersimpan otomatis di localStorage (per perangkat/browser).
 * Struktur storage disiapkan agar mudah diperluas ke riwayat per-semester
 * dan sinkronisasi Google Sheets pada tahap berikutnya.
 */
(function () {
  "use strict";

  const STORAGE_PROGRESS = "dapodik:progress:v1";
  const STORAGE_SEMESTER = "dapodik:semesterLabel:v1";
  const STORAGE_ACTIVE_STAGE = "dapodik:activeStage:v1";

  const PRIORITY_LABEL = {
    tinggi: "Prioritas tinggi",
    "sedang-tinggi": "Prioritas sedang-tinggi",
    sedang: "Prioritas sedang",
    rendah: "Prioritas rendah",
  };

  /** @type {Record<string, boolean>} itemId -> checked */
  let progress = loadProgress();
  let activeStageId = localStorage.getItem(STORAGE_ACTIVE_STAGE) || DAPODIK_DATA.stages[0].id;

  // ---------- Storage helpers ----------
  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_PROGRESS);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn("Gagal membaca progres tersimpan, mulai dari kosong.", e);
      return {};
    }
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_PROGRESS, JSON.stringify(progress));
  }

  // ---------- Derived data ----------
  function allItems() {
    const items = [];
    DAPODIK_DATA.stages.forEach((stage) => {
      stage.sections.forEach((section) => {
        section.items.forEach((item) => items.push(item));
      });
    });
    return items;
  }

  function stageItems(stage) {
    const items = [];
    stage.sections.forEach((section) => section.items.forEach((i) => items.push(i)));
    return items;
  }

  function countDone(items) {
    return items.filter((i) => progress[i.id]).length;
  }

  function getStage(id) {
    return DAPODIK_DATA.stages.find((s) => s.id === id);
  }

  // ---------- Rendering: sidebar spine ----------
  function renderSpine() {
    const list = document.getElementById("spineList");
    list.innerHTML = "";

    DAPODIK_DATA.stages.forEach((stage) => {
      const items = stageItems(stage);
      const done = countDone(items);
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      const isActive = stage.id === activeStageId;
      const isComplete = done === items.length && items.length > 0;

      const li = document.createElement("li");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spine-item" + (isActive ? " active" : "");
      btn.setAttribute("aria-current", isActive ? "true" : "false");
      btn.addEventListener("click", () => {
        activeStageId = stage.id;
        localStorage.setItem(STORAGE_ACTIVE_STAGE, activeStageId);
        renderSpine();
        renderStage();
      });

      btn.innerHTML = `
        <span class="spine-badge badge-${stage.priority}${isComplete ? " done" : ""}">${isComplete ? "" : stage.number}</span>
        <span class="spine-meta">
          <span class="spine-title">${stage.number}. ${escapeHtml(stage.title)}</span>
          <span class="spine-progress-track"><span class="spine-progress-fill" style="width:${pct}%"></span></span>
        </span>
        <span class="spine-count">${done}/${items.length}</span>
      `;

      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  // ---------- Rendering: main stage panel ----------
  function renderStage() {
    const stage = getStage(activeStageId);
    const panel = document.getElementById("stagePanel");
    const items = stageItems(stage);
    const done = countDone(items);
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;

    const header = `
      <div class="stage-header">
        <div class="stage-eyebrow">
          Tahap ${stage.number} dari ${DAPODIK_DATA.stages.length}
          <span class="pill pill-${stage.priority}">${PRIORITY_LABEL[stage.priority]}</span>
        </div>
        <h2 class="stage-title">${escapeHtml(stage.title)}</h2>
        ${stage.note ? `<p class="stage-note">${escapeHtml(stage.note)}</p>` : ""}
        <div class="stage-progress-row">
          <div class="stage-progress-track"><div class="stage-progress-fill" style="width:${pct}%"></div></div>
          <span class="stage-progress-text">${done}/${items.length} · ${pct}%</span>
        </div>
      </div>
    `;

    const sections = stage.sections
      .map((section) => {
        const sDone = countDone(section.items);
        const rows = section.items
          .map((item) => {
            const checked = !!progress[item.id];
            return `
              <li class="item-row${checked ? " checked" : ""}">
                <input type="checkbox" id="chk-${item.id}" data-item-id="${item.id}" ${checked ? "checked" : ""} />
                <label for="chk-${item.id}">${escapeHtml(item.label)}</label>
              </li>
            `;
          })
          .join("");
        return `
          <div class="section-card">
            <div class="section-head">
              <span class="section-title">${escapeHtml(section.title)}</span>
              <span class="section-count">${sDone}/${section.items.length}</span>
            </div>
            <ul class="item-list">${rows}</ul>
          </div>
        `;
      })
      .join("");

    const idx = DAPODIK_DATA.stages.findIndex((s) => s.id === stage.id);
    const prevStage = DAPODIK_DATA.stages[idx - 1];
    const nextStage = DAPODIK_DATA.stages[idx + 1];
    const nav = `
      <div class="stage-nav-buttons">
        <button class="btn" id="prevStageBtn" ${prevStage ? "" : "disabled"}>← ${prevStage ? escapeHtml(prevStage.title) : ""}</button>
        <button class="btn btn-primary" id="nextStageBtn" ${nextStage ? "" : "disabled"}>${nextStage ? escapeHtml(nextStage.title) : ""} →</button>
      </div>
    `;

    panel.innerHTML = header + sections + nav;

    panel.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-item-id");
        progress[id] = e.target.checked;
        saveProgress();
        // Update the affected row's visual state without a full re-render
        e.target.closest(".item-row").classList.toggle("checked", e.target.checked);
        renderSpine();
        renderStageProgressOnly();
        renderFooter();
        renderRing();
      });
    });

    const prevBtn = document.getElementById("prevStageBtn");
    const nextBtn = document.getElementById("nextStageBtn");
    if (prevBtn && prevStage) prevBtn.addEventListener("click", () => goToStage(prevStage.id));
    if (nextBtn && nextStage) nextBtn.addEventListener("click", () => goToStage(nextStage.id));
  }

  function goToStage(id) {
    activeStageId = id;
    localStorage.setItem(STORAGE_ACTIVE_STAGE, id);
    renderSpine();
    renderStage();
    document.getElementById("stagePanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Lightweight update for stage header progress bar + section counts (avoids full re-render on every click)
  function renderStageProgressOnly() {
    const stage = getStage(activeStageId);
    const items = stageItems(stage);
    const done = countDone(items);
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    const fill = document.querySelector(".stage-progress-fill");
    const text = document.querySelector(".stage-progress-text");
    if (fill) fill.style.width = pct + "%";
    if (text) text.textContent = `${done}/${items.length} · ${pct}%`;

    document.querySelectorAll(".section-card").forEach((card, i) => {
      const section = stage.sections[i];
      if (!section) return;
      const sDone = countDone(section.items);
      const countEl = card.querySelector(".section-count");
      if (countEl) countEl.textContent = `${sDone}/${section.items.length}`;
    });
  }

  // ---------- Rendering: ring + footer ----------
  function renderRing() {
    const items = allItems();
    const done = countDone(items);
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    const circumference = 2 * Math.PI * 27; // r=27
    const offset = circumference - (pct / 100) * circumference;
    document.getElementById("ringProgress").style.strokeDasharray = circumference.toFixed(1);
    document.getElementById("ringProgress").style.strokeDashoffset = offset.toFixed(1);
    document.getElementById("ringPercent").textContent = pct + "%";
  }

  function renderFooter() {
    const items = allItems();
    const done = countDone(items);
    document.getElementById("footerStats").textContent =
      `${done} dari ${items.length} item selesai (${DAPODIK_DATA.stages.length} tahap) — tersimpan otomatis di perangkat ini`;
  }

  // ---------- Semester label ----------
  function initSemesterField() {
    const input = document.getElementById("semesterLabel");
    input.value = localStorage.getItem(STORAGE_SEMESTER) || "";
    input.addEventListener("input", () => {
      localStorage.setItem(STORAGE_SEMESTER, input.value);
    });
  }

  // ---------- Reset actions ----------
  function initResetButtons() {
    document.getElementById("resetStageBtn").addEventListener("click", () => {
      const stage = getStage(activeStageId);
      if (!confirm(`Reset semua item pada tahap "${stage.title}"?`)) return;
      stageItems(stage).forEach((item) => delete progress[item.id]);
      saveProgress();
      renderSpine();
      renderStage();
      renderFooter();
      renderRing();
    });

    document.getElementById("resetAllBtn").addEventListener("click", () => {
      if (!confirm("Reset SELURUH checklist ke kondisi kosong? Tindakan ini tidak bisa dibatalkan.")) return;
      progress = {};
      saveProgress();
      renderSpine();
      renderStage();
      renderFooter();
      renderRing();
    });
  }

  // ---------- Utils ----------
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------- View toggle (Checklist / Riwayat Semester) ----------
  function initViewToggle() {
    const checklistBtn = document.getElementById("viewChecklistBtn");
    const historyBtn = document.getElementById("viewHistoryBtn");
    const checklistView = document.getElementById("checklistView");
    const historyView = document.getElementById("historyView");

    checklistBtn.addEventListener("click", () => {
      checklistBtn.classList.add("active");
      checklistBtn.setAttribute("aria-selected", "true");
      historyBtn.classList.remove("active");
      historyBtn.setAttribute("aria-selected", "false");
      checklistView.hidden = false;
      historyView.hidden = true;
    });

    historyBtn.addEventListener("click", () => {
      historyBtn.classList.add("active");
      historyBtn.setAttribute("aria-selected", "true");
      checklistBtn.classList.remove("active");
      checklistBtn.setAttribute("aria-selected", "false");
      checklistView.hidden = true;
      historyView.hidden = false;
      if (window.DapodikHistory) window.DapodikHistory.render();
    });
  }

  // ---------- Public API (dipakai oleh history.js) ----------
  function refreshAll() {
    renderSpine();
    renderStage();
    renderFooter();
    renderRing();
  }

  window.DapodikApp = {
    getActiveProgress: () => Object.assign({}, progress),
    getSemesterLabel: () => document.getElementById("semesterLabel").value,
    setSemesterLabel: (label) => {
      document.getElementById("semesterLabel").value = label;
      localStorage.setItem(STORAGE_SEMESTER, label);
    },
    /** Ganti seluruh progres aktif (dipakai saat "mulai semester baru" atau "pulihkan") */
    loadProgress: (newProgress) => {
      progress = Object.assign({}, newProgress);
      saveProgress();
      refreshAll();
    },
    refreshAll,
  };

  // ---------- Init ----------
  function init() {
    initSemesterField();
    initResetButtons();
    initViewToggle();
    renderSpine();
    renderStage();
    renderFooter();
    renderRing();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
