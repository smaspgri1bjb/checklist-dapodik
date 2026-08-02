/**
 * Konfigurasi Sinkronisasi Google Sheets — HANYA diatur di sini oleh
 * admin/pengembang. Kolom ini TIDAK bisa diubah dari antarmuka aplikasi.
 *
 * Cara isi:
 * 1. Ikuti panduan "Sinkronisasi ke Google Sheets" di README.md untuk
 *    membuat Google Sheet + deploy google-apps-script.gs sebagai Web App.
 * 2. Tempel URL Web App (diakhiri "/exec") ke `url` di bawah.
 * 3. Isi `token` dengan nilai TOKEN yang sama persis dengan yang Anda
 *    tulis di google-apps-script.gs.
 * 4. Simpan file ini, lalu upload ulang ke GitHub Pages (atau jalankan lokal).
 *
 * PENTING — catatan keamanan:
 * File ini berjalan di browser pengguna, sehingga URL & token di sini bisa
 * dilihat siapa pun yang membuka "View Source" pada halaman yang sudah
 * dideploy. Ini cukup untuk mencegah perubahan tidak sengaja lewat
 * antarmuka aplikasi, TAPI BUKAN mekanisme keamanan yang kuat. Jangan
 * simpan data sensitif/rahasia di Google Sheet yang terhubung, dan
 * pertimbangkan membuat repository GitHub Anda privat jika ingin lebih aman.
 */
window.DAPODIK_SYNC_CONFIG = {
  url: "https://script.google.com/macros/s/AKfycbxJ9yM22mgN7gX2UZEcaqlJYY2gRNiWdMXYjB3GaCE6wueEpxEuLC4p_2NPEcYS2MvO/exec", // contoh: "https://script.google.com/macros/s/xxxxxxxx/exec"
  token: "$JW!LTUrjDEqg54", // contoh: "token-rahasia-anda"
};
