/**
 * Dapodik Checklist — report.js
 * Menyusun laporan siap cetak (lewat dialog print bawaan browser -> "Simpan
 * sebagai PDF") dan ekspor .xlsx (lewat SheetJS, dimuat dari CDN di index.html).
 */
(function () {
  "use strict";

  const STORAGE_SCHOOL = "dapodik:report:school";
  const STORAGE_OPERATOR = "dapodik:report:operator";

  const PRIORITY_LABEL = {
    tinggi: "Tinggi",
    "sedang-tinggi": "Sedang-tinggi",
    sedang: "Sedang",
    rendah: "Rendah",
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function todayId() {
    return new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  }

  function currentStats() {
    return window.DapodikHistory.computeStats(window.DapodikApp.getActiveProgress());
  }

  // ---------- Rendering ----------
  function render() {
    const container = document.getElementById("reportView");
    const school = localStorage.getItem(STORAGE_SCHOOL) || "";
    const operator = localStorage.getItem(STORAGE_OPERATOR) || "";
    const semester = window.DapodikApp.getSemesterLabel();
    const stats = currentStats();

    container.innerHTML = `
      <div class="report-toolbar no-print">
        <div class="report-fields">
          <label>Nama Sekolah
            <input type="text" id="reportSchool" placeholder="mis. SDN Contoh 01" value="${escapeHtml(school)}" />
          </label>
          <label>Disiapkan oleh
            <input type="text" id="reportOperator" placeholder="Nama operator" value="${escapeHtml(operator)}" />
          </label>
        </div>
        <div class="report-actions">
          <button id="printBtn" class="btn btn-primary">Cetak / Simpan sebagai PDF</button>
          <button id="excelBtn" class="btn">Unduh Excel (.xlsx)</button>
        </div>
      </div>

      <div class="report-sheet" id="reportSheet">
        <header class="report-head">
          <p class="report-eyebrow">Laporan Checklist Update Dapodik</p>
          <h2>${escapeHtml(school || "(Nama sekolah belum diisi)")}</h2>
          <div class="report-meta">
            <span>Semester: <strong>${escapeHtml(semester || "-")}</strong></span>
            <span>Tanggal cetak: <strong>${todayId()}</strong></span>
            ${operator ? `<span>Disiapkan oleh: <strong>${escapeHtml(operator)}</strong></span>` : ""}
          </div>
        </header>

        <section class="report-summary">
          <div class="report-summary-total">
            <strong>${stats.pct}%</strong>
            <span>${stats.done} dari ${stats.total} item selesai</span>
          </div>
          <table class="report-table">
            <thead>
              <tr><th>#</th><th>Tahap</th><th>Prioritas</th><th>Selesai</th><th>Persen</th></tr>
            </thead>
            <tbody>
              ${stats.perStage
                .map(
                  (s) => `
                <tr>
                  <td>${s.number}</td>
                  <td>${escapeHtml(s.title)}</td>
                  <td>${PRIORITY_LABEL[s.priority]}</td>
                  <td>${s.done}/${s.total}</td>
                  <td>${s.pct}%</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </section>

        <section class="report-detail">
          ${DAPODIK_DATA.stages.map(stageDetailHtml).join("")}
        </section>
      </div>
    `;

    document.getElementById("printBtn").addEventListener("click", () => window.print());
    document.getElementById("excelBtn").addEventListener("click", downloadExcel);
    document.getElementById("reportSchool").addEventListener("change", (e) => {
      localStorage.setItem(STORAGE_SCHOOL, e.target.value);
      render();
    });
    document.getElementById("reportOperator").addEventListener("change", (e) => {
      localStorage.setItem(STORAGE_OPERATOR, e.target.value);
      render();
    });
  }

  function stageDetailHtml(stage) {
    const progress = window.DapodikApp.getActiveProgress();
    return `
      <div class="report-stage">
        <h3>${stage.number}. ${escapeHtml(stage.title)}</h3>
        ${stage.sections
          .map(
            (section) => `
          <table class="report-items">
            <tbody>
              <tr class="report-section-row"><td colspan="2">${escapeHtml(section.title)}</td></tr>
              ${section.items
                .map(
                  (item) => `
                <tr>
                  <td class="report-check">${progress[item.id] ? "\u2611" : "\u2610"}</td>
                  <td>${escapeHtml(item.label)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>`
          )
          .join("")}
      </div>
    `;
  }

  // ---------- Excel export ----------
  function downloadExcel() {
    if (typeof XLSX === "undefined") {
      alert(
        "Pustaka Excel belum termuat (butuh koneksi internet karena dimuat dari CDN). Periksa koneksi Anda lalu coba lagi."
      );
      return;
    }

    const progress = window.DapodikApp.getActiveProgress();
    const stats = currentStats();

    const summaryRows = [["No", "Tahap", "Prioritas", "Selesai", "Total", "Persen"]];
    stats.perStage.forEach((s) =>
      summaryRows.push([s.number, s.title, PRIORITY_LABEL[s.priority], s.done, s.total, s.pct + "%"])
    );
    summaryRows.push([]);
    summaryRows.push(["Total keseluruhan", "", "", stats.done, stats.total, stats.pct + "%"]);

    const detailRows = [["Tahap", "Bagian", "Item", "Status"]];
    DAPODIK_DATA.stages.forEach((stage) => {
      stage.sections.forEach((section) => {
        section.items.forEach((item) => {
          detailRows.push([stage.title, section.title, item.label, progress[item.id] ? "Selesai" : "Belum"]);
        });
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summaryRows), "Ringkasan");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(detailRows), "Checklist");

    const history = window.DapodikHistory ? window.DapodikHistory.getHistory() : [];
    if (history.length) {
      const historyRows = [["Semester", "Tanggal Arsip", "Selesai", "Total", "Persen"]];
      history.forEach((r) =>
        historyRows.push([r.label, r.archivedAt, r.stats.done, r.stats.total, r.stats.pct + "%"])
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(historyRows), "Riwayat");
    }

    const schoolSlug = (localStorage.getItem(STORAGE_SCHOOL) || "sekolah").trim().replace(/[^a-z0-9]+/gi, "-");
    XLSX.writeFile(wb, `checklist-dapodik-${schoolSlug}.xlsx`);
  }

  window.DapodikReport = { render };
})();
