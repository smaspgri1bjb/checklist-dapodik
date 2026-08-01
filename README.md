# Checklist Update Dapodik

Checklist interaktif untuk SOP update aplikasi Dapodik per semester, disusun
berdasarkan prioritas: GTK Sertifikasi → GTK Non-Sertifikasi → Peserta Didik →
Sarpras → Sinkronisasi & Validasi.

## Menjalankan secara lokal

Cukup buka `index.html` langsung di browser — tidak perlu server atau instalasi
apa pun. Semua progres disimpan otomatis di `localStorage` browser Anda.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, mis. `checklist-dapodik`.
2. Upload 5 file ini ke root repository: `index.html`, `style.css`, `app.js`, `data.js`, `history.js`.
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
| `history.js` | Arsip semester, perbandingan progres antar semester |

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

## Status pengembangan

- [x] Checklist interaktif 11 tahap + progres per tahap & keseluruhan
- [x] Penyimpanan otomatis di browser (localStorage)
- [x] Riwayat & perbandingan progres antar semester
- [ ] Sinkronisasi opsional ke Google Sheets
- [ ] Export laporan siap cetak (PDF/Excel)
