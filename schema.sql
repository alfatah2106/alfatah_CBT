-- schema.sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'proctor', 'grader'))
);

CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE students (
  id VARCHAR(50) PRIMARY KEY, -- ID Murid
  name VARCHAR(100) NOT NULL,
  class VARCHAR(50)
);

CREATE TABLE exams (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  subject_id INTEGER REFERENCES subjects(id),
  title VARCHAR(200) NOT NULL,
  pdf_url TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('PG', 'ESSAY')),
  answer_key TEXT, -- A, B, C, D, E for PG, or reference text for ESSAY
  UNIQUE(exam_id, number)
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) REFERENCES students(id),
  exam_id INTEGER REFERENCES exams(id),
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'finished', 'forced_close')),
  violations INTEGER DEFAULT 0,
  last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, exam_id)
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  score NUMERIC(5, 2), -- Nullable, filled by auto-grader (PG) or manual grader (ESSAY)
  UNIQUE(session_id, question_id)
);
