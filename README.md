# Checklist Update Dapodik

Checklist interaktif untuk SOP update aplikasi Dapodik per semester, disusun
berdasarkan prioritas: GTK Sertifikasi → GTK Non-Sertifikasi → Peserta Didik →
Sarpras → Sinkronisasi & Validasi.

## Menjalankan secara lokal

Cukup buka `index.html` langsung di browser — tidak perlu server atau instalasi
apa pun. Semua progres disimpan otomatis di `localStorage` browser Anda.

## Indikator status tahap

Lingkaran nomor di sidebar kiri (1–11) menunjukkan status pengerjaan tiap
tahap, bukan prioritas:

- 🔴 **Merah** — belum ada item yang dicentang
- 🟠 **Oranye** — sedang berjalan (sebagian item sudah dicentang)
- 🟢 **Hijau** — seluruh item pada tahap itu sudah selesai

Info prioritas (Tinggi/Sedang-tinggi/Sedang/Rendah) tetap ditampilkan sebagai
label berwarna di bagian atas panel setiap tahap.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, mis. `checklist-dapodik`.
2. Upload 9 file ini ke root repository: `index.html`, `style.css`, `app.js`, `data.js`, `history.js`, `sync.js`, `sync-config.js`, `report.js`. (`google-apps-script.gs` **tidak** diupload ke GitHub — file itu ditempel langsung di Google Apps Script, lihat panduan di bawah.)
   - Jika Anda ingin sinkronisasi Google Sheets aktif, isi `sync-config.js` dengan URL & token Anda **sebelum** mengunggah (lihat panduan "Sinkronisasi ke Google Sheets" di bawah). Kalau dibiarkan kosong, aplikasi tetap berjalan penuh secara lokal.
3. Buka **Settings → Pages**, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit, aplikasi akan tersedia di `https://<username>.github.io/checklist-dapodik/`.

Karena GitHub Pages adalah *static hosting* (tanpa server), semua data checklist
disimpan langsung di browser (`localStorage`) — tidak terkirim ke mana pun.
Ini sudah aman untuk dipakai sendiri, tapi berarti progres **tidak otomatis
sinkron** antar perangkat/browser yang berbeda. Fitur sinkronisasi opsional ke
Google Sheets akan ditambahkan di tahap berikutnya.

## Struktur file

| File | Isi |
|---|---|
| `index.html` | Struktur halaman |
| `style.css` | Desain visual (palet warna, tipografi, layout) |
| `data.js` | Seluruh data checklist (11 tahap, hasil digitisasi dokumen SOP) |
| `app.js` | Logika aplikasi: render, simpan progres, hitung persentase |
| `history.js` | Arsip semester, perbandingan progres antar semester, kartu status sinkronisasi |
| `sync.js` | Auto-sync (kirim/tarik otomatis) ke Google Sheets lewat Web App Apps Script |
| `sync-config.js` | URL & token Google Sheets — diatur di sini saja, tidak lewat antarmuka |
| `report.js` | Laporan: unduh PDF otomatis & ekspor Excel dengan tombol filter |
| `google-apps-script.gs` | Kode yang ditempel di Google Apps Script (backend Google Sheets) |

## Riwayat Semester

Tab **"Riwayat Semester"** di bagian atas memungkinkan Anda:

- **Arsipkan semester ini & mulai baru** — menyimpan progres checklist saat ini
  sebagai catatan (dengan label semester yang Anda isi), lalu mengosongkan
  checklist untuk semester berikutnya.
- **Pulihkan ke aktif** — mengembalikan progres dari arsip ke checklist aktif
  (menimpa progres yang sedang berjalan).
- **Bandingkan Progres** — pilih dua semester (termasuk semester aktif) untuk
  melihat perbandingan persentase keseluruhan dan per tahap secara berdampingan.

Semua arsip juga tersimpan di `localStorage`, jadi tetap bersifat lokal per
browser/perangkat — sama seperti progres aktif.

## Sinkronisasi ke Google Sheets (opsional, otomatis)

Fitur ini membuat progres, label semester, dan riwayat bisa dibuka dari
perangkat lain, dengan Google Sheet Anda sendiri sebagai "database"-nya.
Sepenuhnya opsional — tanpa setup ini aplikasi tetap berfungsi penuh secara
lokal. URL dan token diatur **hanya lewat file `sync-config.js`**, sehingga
tidak ada kolom URL/token di antarmuka yang bisa diubah pengguna.

Setelah dikonfigurasi, sinkronisasi berjalan otomatis seperti "auto save":
- **Saat halaman dibuka** — aplikasi otomatis menarik (pull) data terbaru dari
  Google Sheets di belakang layar.
- **Setiap ada perubahan** (centang item, ganti label semester, arsip/hapus
  riwayat) — aplikasi otomatis mengirim (push) data terbaru ke Google Sheets
  beberapa saat setelah perubahan berhenti (±1.5 detik), tanpa perlu klik apa pun.
- Status sinkronisasi ("Tersinkron", "Menyinkronkan…", dsb.) selalu terlihat
  di tab **Riwayat Semester**. Tombol **"Sinkron sekarang"** tersedia sebagai
  cadangan bila Anda ingin memaksa sinkronisasi segera.

**Setup (±5 menit, gratis):**

1. Buka [sheets.google.com](https://sheets.google.com), buat spreadsheet baru
   (boleh nama apa saja, mis. "Data Checklist Dapodik").
2. Di menu, buka **Extensions → Apps Script** (Ekstensi → Apps Script).
3. Hapus kode default di editor, lalu tempel seluruh isi file
   `google-apps-script.gs` yang disertakan di sini.
4. Cari baris `const TOKEN = "GANTI_DENGAN_TOKEN_RAHASIA_ANDA";` di baris
   paling atas, ganti dengan kode rahasia pilihan Anda sendiri (bebas —
   contoh: kombinasi huruf & angka). Simpan (Ctrl+S).
5. Klik **Deploy → New deployment**. Pilih tipe **Web app**. Isi:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Klik **Deploy**, lalu **Authorize access** dan izinkan sesuai akun Google Anda
   (akan muncul peringatan "Google hasn't verified this app" — ini normal
   karena scriptnya milik Anda sendiri; klik **Advanced → Go to (nama
   project) (unsafe)** untuk melanjutkan).
7. Salin **Web app URL** yang muncul (diakhiri `/exec`).
8. Buka file `sync-config.js` di komputer Anda, isi:
   ```js
   window.DAPODIK_SYNC_CONFIG = {
     url: "https://script.google.com/macros/s/xxxxxxxx/exec", // URL dari langkah 7
     token: "token-rahasia-yang-sama-dengan-langkah-4",
   };
   ```
9. Simpan file, lalu upload/upload-ulang seluruh file ke GitHub Pages (atau
   cukup refresh browser jika menjalankan lokal). Buka tab **Riwayat
   Semester** — akan terlihat status "Menyinkronkan…" lalu "Tersinkron", dan
   3 sheet otomatis terbentuk di Google Sheet Anda: `Checklist`, `Meta`, `Riwayat`.

**Catatan:**
- Karena `sync-config.js` berjalan di browser pengguna, URL & token di
  dalamnya bisa dilihat siapa pun yang membuka "View Source" pada halaman
  yang sudah dideploy. Ini cukup untuk mencegah perubahan tidak sengaja lewat
  antarmuka aplikasi, tapi bukan mekanisme keamanan yang kuat — jangan
  simpan data sensitif di Sheet yang terhubung, dan pertimbangkan membuat
  repository GitHub Anda privat jika ingin lebih aman.
- Jika Anda mengedit ulang kode Apps Script, gunakan **Deploy → Manage
  deployments → Edit (ikon pensil) → Version: New version → Deploy** agar
  URL `/exec` yang sama tetap berlaku.
- Auto-pull saat memuat halaman akan **menimpa** checklist aktif dan riwayat
  di perangkat tersebut dengan data terbaru dari Sheets — sesuai perilaku
  "auto save" yang meng-utamakan data cloud paling baru.

## Laporan siap cetak & ekspor Excel

Tab **"Laporan"** menyusun ringkasan dan rincian checklist — cocok
dilampirkan sebagai bukti kerja ke kepala sekolah/pengawas.

- Isi kolom **Nama Sekolah** dan **Disiapkan oleh** (opsional, tersimpan otomatis).
- **Unduh PDF** — file PDF **langsung dibuat dan terunduh otomatis** (memakai
  html2canvas + jsPDF di balik layar), tinggal dibuka untuk dilihat atau
  dicetak. Tidak perlu lagi memilih "Save as PDF" secara manual di dialog
  cetak browser. Jika koneksi internet sedang tidak tersedia (pustaka gagal
  dimuat dari CDN), aplikasi otomatis membuka dialog cetak browser biasa
  sebagai cadangan.
- **Unduh Excel (.xlsx)** — mengunduh file Excel berisi 2–3 sheet: `Ringkasan`
  (persentase per tahap), `Checklist` (status setiap item), dan `Riwayat`
  (jika ada semester yang sudah diarsipkan). Setiap sheet sudah memakai
  **AutoFilter** — baris judul kolom otomatis punya tombol dropdown filter/urut
  bawaan Excel, tanpa perlu diaktifkan manual.
- Kedua fitur butuh koneksi internet sekali saat halaman dimuat (pustaka
  dimuat dari CDN) — setelah itu bekerja tanpa perlu server.

## Status pengembangan

- [x] Checklist interaktif 11 tahap + progres per tahap & keseluruhan
- [x] Penyimpanan otomatis di browser (localStorage)
- [x] Riwayat & perbandingan progres antar semester
- [x] Sinkronisasi opsional ke Google Sheets
- [x] Laporan siap cetak (PDF) & ekspor Excel

Keempat bagian yang direncanakan sudah selesai. Aplikasi ini siap dipakai
dan di-deploy ke GitHub Pages.

## Pembaruan terbaru

- Indikator status tahap (sidebar) kini berbasis progres (merah/oranye/hijau), bukan prioritas
- Sinkronisasi Google Sheets kini otomatis penuh (auto-pull saat buka halaman, auto-push setiap perubahan); URL & token hanya bisa diatur lewat `sync-config.js`, tidak lewat antarmuka
- Tombol "Unduh PDF" langsung membuat & mengunduh file PDF (tidak perlu dialog cetak manual)
- Ekspor Excel kini memakai AutoFilter — tiap sheet punya tombol filter di baris judul
