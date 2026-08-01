/**
 * DAPODIK_DATA — struktur checklist SOP Update Aplikasi Dapodik (Per Semester)
 * Disusun berdasarkan urutan prioritas: GTK Sertifikasi > GTK Non-Sertifikasi >
 * Peserta Didik > Sarpras > Sinkronisasi & Validasi.
 *
 * priority tier: 'tinggi' | 'sedang-tinggi' | 'sedang' | 'rendah'
 * (dipetakan dari tabel "Prioritas Pengerjaan" pada dokumen sumber)
 */
const DAPODIK_DATA = {
  meta: {
    title: "Checklist SOP Update Aplikasi Dapodik",
    subtitle: "Per Semester — urutan prioritas operator sekolah",
  },
  stages: [
    {
      id: "s1",
      number: 1,
      title: "Persiapan",
      priority: "tinggi",
      sections: [
        {
          title: "Backup",
          items: [
            "Backup database Dapodik",
            "Backup folder Prefill",
            "Backup folder sinkronisasi (jika diperlukan)",
            "Export seluruh data penting ke Excel",
            "Catat versi aplikasi lama",
          ],
        },
        {
          title: "Update",
          items: [
            "Download installer Dapodik terbaru",
            "Download patch terbaru (jika ada)",
            "Tutup seluruh aplikasi Dapodik",
            "Install aplikasi",
            "Install Patch",
            "Restart komputer",
          ],
        },
        {
          title: "Login",
          items: [
            "Login Operator",
            "Cek semester aktif",
            "Cek versi aplikasi",
            "Generate prefill ulang bila diperlukan",
          ],
        },
      ],
    },
    {
      id: "s2",
      number: 2,
      title: "Validasi GTK — Guru Sertifikasi",
      priority: "tinggi",
      note: "WAJIB selesai sebelum mengerjakan peserta didik",
      sections: [
        {
          title: "Identitas",
          items: [
            "Nama", "NIK", "NUPTK", "Tempat lahir", "Tanggal lahir",
            "Jenis kelamin", "Agama", "Status Kepegawaian", "Jenis GTK", "Status Aktif",
          ],
        },
        {
          title: "Penugasan",
          items: [
            "Sekolah Induk", "TMT", "Jenis PTK", "Keaktifan Semester",
            "Tugas Tambahan", "Nomor SK", "Tanggal SK",
          ],
        },
        {
          title: "Sertifikasi",
          items: [
            "Nomor Sertifikat Pendidik", "Bidang Studi Sertifikasi",
            "Linieritas", "TMT Sertifikasi",
          ],
        },
        {
          title: "Pendidikan",
          items: [
            "Riwayat Pendidikan", "Ijazah terakhir", "Program Studi",
            "Perguruan Tinggi", "Tahun Lulus",
          ],
        },
        {
          title: "Pangkat",
          items: ["Pangkat/Golongan", "TMT Pangkat"],
        },
        {
          title: "Beban Mengajar",
          items: [
            "Semua mapel benar", "Rombel benar", "Jumlah JP sesuai",
            "Total JP memenuhi syarat", "Tidak ada bentrok jadwal",
          ],
        },
        {
          title: "Akun",
          items: ["Email aktif", "Nomor HP", "Password akun"],
        },
        {
          title: "Dokumen",
          items: [
            "SK Pengangkatan", "SK Pembagian Tugas", "SK Mengajar", "SK Tugas Tambahan",
          ],
        },
        {
          title: "Validasi",
          items: ["Tidak ada warning", "Tidak ada invalid", "Tidak ada residu GTK"],
        },
      ],
    },
    {
      id: "s3",
      number: 3,
      title: "Guru Non Sertifikasi",
      priority: "tinggi",
      note: "Lakukan pemeriksaan yang sama seperti Guru Sertifikasi",
      sections: [
        {
          title: "Pemeriksaan",
          items: [
            "Identitas", "Penugasan", "Pendidikan", "Pangkat", "Beban Mengajar",
            "Jadwal", "Email", "HP", "Dokumen", "Validasi",
          ],
        },
      ],
    },
    {
      id: "s4",
      number: 4,
      title: "Rombongan Belajar",
      priority: "sedang-tinggi",
      sections: [
        {
          title: "Rombel",
          items: [
            "Semua rombel aktif", "Nama rombel benar", "Tingkat benar",
            "Kurikulum benar", "Wali kelas benar",
          ],
        },
        {
          title: "Anggota Rombel",
          items: [
            "Seluruh siswa masuk rombel", "Tidak ada siswa ganda", "Tidak ada siswa tanpa rombel",
          ],
        },
        {
          title: "Pembelajaran",
          items: ["Semua mapel dibuat", "Guru pengampu benar", "JP benar", "Kurikulum benar"],
        },
        {
          title: "Jadwal",
          items: ["Tidak ada bentrok", "Semua mapel memiliki jadwal"],
        },
      ],
    },
    {
      id: "s5",
      number: 5,
      title: "Peserta Didik",
      priority: "sedang-tinggi",
      sections: [
        {
          title: "Biodata",
          items: [
            "Nama", "NISN", "NIK", "KK", "Tempat lahir", "Tanggal lahir",
            "Jenis kelamin", "Agama",
          ],
        },
        {
          title: "Orang Tua",
          items: [
            "Nama Ayah", "Nama Ibu", "NIK Orang Tua", "Pendidikan", "Pekerjaan", "Penghasilan",
          ],
        },
        {
          title: "Alamat",
          items: [
            "Jalan", "RT", "RW", "Kelurahan", "Kecamatan", "Kabupaten", "Provinsi", "Kode Pos",
          ],
        },
        {
          title: "Registrasi",
          items: ["Status Aktif", "Jenis Pendaftaran", "Jalur Masuk", "Tanggal Masuk"],
        },
        {
          title: "Riwayat",
          items: ["Riwayat Sekolah", "Mutasi", "Kelulusan"],
        },
        {
          title: "Dokumen",
          items: ["Akta", "KK", "KIP", "PKH", "PIP"],
        },
        {
          title: "Validasi",
          items: ["Tidak ada residu NISN", "Tidak ada residu NIK", "Tidak ada warning"],
        },
      ],
    },
    {
      id: "s6",
      number: 6,
      title: "Sarana Prasarana",
      priority: "sedang",
      sections: [
        {
          title: "Sarpras",
          items: [
            "Bangunan", "Ruang", "Laboratorium", "Perpustakaan", "Sanitasi",
            "Lahan", "Kondisi Ruang", "Inventaris",
          ],
        },
      ],
    },
    {
      id: "s7",
      number: 7,
      title: "Sekolah",
      priority: "sedang",
      sections: [
        {
          title: "Profil Sekolah",
          items: [
            "Identitas Sekolah", "Kepala Sekolah", "Operator", "Akreditasi",
            "Kurikulum", "Kalender Pendidikan",
          ],
        },
      ],
    },
    {
      id: "s8",
      number: 8,
      title: "Validasi",
      priority: "sedang",
      sections: [
        {
          title: "Lokal",
          items: [
            "Jalankan Validasi Lokal", "Perbaiki seluruh invalid",
            "Perbaiki warning penting", "Refresh Validasi",
          ],
        },
        {
          title: "Web",
          items: [
            "Login Manajemen Dapodik", "Cek validasi pusat", "Cek GTK",
            "Cek Peserta Didik", "Cek Rombel",
          ],
        },
      ],
    },
    {
      id: "s9",
      number: 9,
      title: "Sinkronisasi",
      priority: "rendah",
      sections: [
        {
          title: "Sinkronisasi",
          items: [
            "Generate Prefill (bila diperlukan)", "Sinkronisasi pertama",
            "Cek status berhasil", "Cek log sinkronisasi", "Sinkronisasi ulang bila ada perubahan",
          ],
        },
      ],
    },
    {
      id: "s10",
      number: 10,
      title: "Pasca Sinkronisasi",
      priority: "rendah",
      sections: [
        {
          title: "Cek Data Pusat",
          items: [
            "Cek Info GTK", "Cek Info Guru", "Cek Tarik Data Pusat", "Cek E-Ijazah",
            "Cek Verval PTK", "Cek Verval PD", "Cek Referensi",
          ],
        },
      ],
    },
    {
      id: "s11",
      number: 11,
      title: "Arsip",
      priority: "rendah",
      sections: [
        {
          title: "Arsip",
          items: [
            "Simpan backup database", "Simpan backup prefill", "Simpan hasil sinkronisasi",
            "Export GTK", "Export Peserta Didik", "Export Rombel", "Export Pembelajaran",
            "Simpan log perubahan semester",
          ],
        },
      ],
    },
  ],
};

// Beri id unik & deterministik ke setiap item: s{stage}-{sectionIndex}-{itemIndex}
(function assignIds() {
  DAPODIK_DATA.stages.forEach((stage) => {
    stage.sections.forEach((section, si) => {
      section.items = section.items.map((label, ii) => ({
        id: `${stage.id}-${si}-${ii}`,
        label,
      }));
    });
  });
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = DAPODIK_DATA;
}
