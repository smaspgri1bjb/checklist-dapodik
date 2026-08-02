# Checklist Update Dapodik

Checklist interaktif untuk SOP update aplikasi Dapodik per semester, disusun
berdasarkan prioritas: GTK Sertifikasi → GTK Non-Sertifikasi → Peserta Didik →
Sarpras → Sinkronisasi & Validasi.

## Menjalankan secara lokal

Cukup buka `index.html` langsung di browser — tidak perlu server atau instalasi
apa pun. Semua progres disimpan otomatis di `localStorage` browser Anda.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, mis. `checklist-dapodik`.
2. Upload 8 file ini ke root repository: `index.html`, `style.css`, `app.js`, `data.js`, `history.js`, `sync.js`, `report.js`. (`google-apps-script.gs` **tidak** diupload ke GitHub — file itu ditempel langsung di Google Apps Script, lihat panduan di bawah.)
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
| `history.js` | Arsip semester, perbandingan progres antar semester, kartu sinkronisasi |
| `sync.js` | Kirim/tarik data ke Google Sheets lewat Web App Apps Script |
| `report.js` | Laporan siap cetak (PDF via print) dan ekspor Excel (.xlsx) |
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

## Sinkronisasi ke Google Sheets (opsional)

Fitur ini membuat progres, label semester, dan riwayat bisa dibuka dari
perangkat lain — dengan Google Sheet Anda sendiri sebagai "database"-nya.
Sepenuhnya opsional; tanpa setup ini aplikasi tetap berfungsi penuh secara lokal.

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
8. Buka aplikasi checklist → tab **Riwayat Semester** → bagian
   "Sinkronisasi Google Sheets" → masukkan URL tersebut dan token yang sama
   persis dengan langkah 4.
9. Klik **Kirim ke Google Sheets** untuk mengirim data pertama kali. Ini akan
   otomatis membuat 3 sheet: `Checklist`, `Meta`, dan `Riwayat` — semuanya
   bisa Anda lihat langsung sebagai spreadsheet biasa.

**Catatan:**
- Jika Anda mengedit ulang kode Apps Script, gunakan **Deploy → Manage
  deployments → Edit (ikon pensil) → Version: New version → Deploy** agar
  URL `/exec` yang sama tetap berlaku.
- Token berfungsi seperti kata sandi sederhana — jangan bagikan URL & token
  ke orang lain jika tidak ingin mereka bisa membaca/mengubah data Anda.
- "Tarik dari Google Sheets" akan **menimpa** checklist aktif dan riwayat di
  perangkat yang sedang dipakai — akan selalu ada konfirmasi sebelum ini
  terjadi.

## Laporan siap cetak & ekspor Excel

Tab **"Laporan"** menyusun ringkasan dan rincian checklist dalam format siap
cetak — cocok dilampirkan sebagai bukti kerja ke kepala sekolah/pengawas.

- Isi kolom **Nama Sekolah** dan **Disiapkan oleh** (opsional, tersimpan otomatis).
- **Cetak / Simpan sebagai PDF** — membuka dialog cetak bawaan browser. Pilih
  printer **"Save as PDF"** (Chrome/Edge) atau **"Microsoft Print to PDF"**
  untuk menyimpannya sebagai file PDF, bukan mencetak ke kertas.
- **Unduh Excel (.xlsx)** — mengunduh file Excel berisi 2–3 sheet: `Ringkasan`
  (persentase per tahap), `Checklist` (status setiap item), dan `Riwayat`
  (jika ada semester yang sudah diarsipkan).
- Fitur Excel butuh koneksi internet sekali saat halaman dimuat (pustaka
  SheetJS dimuat dari CDN) — setelah itu bekerja tanpa perlu server.

## Status pengembangan

- [x] Checklist interaktif 11 tahap + progres per tahap & keseluruhan
- [x] Penyimpanan otomatis di browser (localStorage)
- [x] Riwayat & perbandingan progres antar semester
- [x] Sinkronisasi opsional ke Google Sheets
- [x] Laporan siap cetak (PDF) & ekspor Excel

Keempat bagian yang direncanakan sudah selesai. Aplikasi ini siap dipakai
dan di-deploy ke GitHub Pages.
