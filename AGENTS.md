# Aturan Keamanan Database (SANGAT KETAT)

1. **JANGAN PERNAH** membuat, mengedit, atau menjalankan skrip yang berisi perintah destruktif seperti `DROP SCHEMA`, `DROP TABLE`, `TRUNCATE`, atau `DROP DATABASE`.
2. **JANGAN PERNAH** menjalankan skrip seeding (`seed.sql`) atau setup awal yang menimpa data yang sudah ada di database produksi.
3. Aplikasi ini sedang berjalan di tahap produksi dan berisi data ujian langsung (live exam data). Modifikasi pada database hanya boleh menggunakan operasi yang tidak merusak seperti `SELECT`, `INSERT`, `UPDATE`, dan `ALTER TABLE` (untuk penambahan kolom).
4. Jika menemui error terkait database saat melakukan perbaikan, **DILARANG KERAS** mengambil inisiatif untuk me-reset ulang database. Laporkan error tersebut kepada user.
