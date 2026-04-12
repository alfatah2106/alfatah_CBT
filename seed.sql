-- seed.sql
INSERT INTO users (username, password, role) VALUES
('admin', 'admin123', 'admin'),
('pengawas1', 'pengawas123', 'proctor'),
('korektor1', 'korektor123', 'grader');

INSERT INTO subjects (name) VALUES
('Matematika'),
('Bahasa Indonesia'),
('Fisika');

INSERT INTO students (id, name, class) VALUES
('S001', 'Budi Santoso', '12 IPA 1'),
('S002', 'Siti Aminah', '12 IPA 1'),
('S003', 'Andi Wijaya', '12 IPA 2');

INSERT INTO exams (code, subject_id, title, pdf_url, duration_minutes, is_active) VALUES
('MTK-01', 1, 'Ujian Akhir Semester Matematika', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 120, true),
('BIN-01', 2, 'Ujian Akhir Semester Bahasa Indonesia', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 90, false);

INSERT INTO questions (exam_id, number, type, answer_key) VALUES
(1, 1, 'PG', 'A'),
(1, 2, 'PG', 'C'),
(1, 3, 'PG', 'B'),
(1, 4, 'PG', 'D'),
(1, 5, 'PG', 'E'),
(1, 6, 'ESSAY', 'Jawaban essay referensi matematika...'),
(1, 7, 'ESSAY', 'Jawaban essay referensi matematika 2...');
