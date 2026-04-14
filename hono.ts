import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Pool } from '@neondatabase/serverless';

type Bindings = {
  DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors());

// Helper to get DB pool
const getDb = (env: Bindings) => {
  // Using hardcoded database URL as requested by user
  const connectionString = env.DATABASE_URL || 'postgresql://neondb_owner:npg_zlv93YCDLaei@ep-lingering-waterfall-a1qif4lp-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const pool = new Pool({ connectionString });
  return pool;
};

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.get('/api/admin/stats', async (c) => {
  const pool = getDb(c.env);
  const studentsRes = await pool.query('SELECT COUNT(*) FROM students');
  const subjectsRes = await pool.query('SELECT COUNT(*) FROM subjects');
  const examsRes = await pool.query('SELECT COUNT(*) FROM exams WHERE is_active = true');
  return c.json({
    students: parseInt(studentsRes.rows[0].count),
    subjects: parseInt(subjectsRes.rows[0].count),
    activeExams: parseInt(examsRes.rows[0].count)
  });
});

app.post('/api/staff/login', async (c) => {
  const { username, password, role } = await c.req.json();
  const pool = getDb(c.env);
  
  // Auto-create default admin if not exists (for demo purposes)
  if (username === 'admin' && password === 'admin' && role === 'admin') {
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', ['admin', 'admin', 'admin']);
  }
  // Auto-create default proctor
  if (username === 'pengawas' && password === 'pengawas' && role === 'proctor') {
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', ['pengawas', 'pengawas', 'proctor']);
  }
  // Auto-create default grader
  if (username === 'korektor' && password === 'korektor' && role === 'grader') {
    await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', ['korektor', 'korektor', 'grader']);
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2 AND role = $3', [username, password, role]);
  if (rows.length === 0) return c.json({ error: 'Invalid credentials' }, 401);
  return c.json({ user: rows[0] });
});

// --- Admin Endpoints ---
app.get('/api/admin/students', async (c) => {
  const pool = getDb(c.env);
  const { rows } = await pool.query('SELECT * FROM students ORDER BY id');
  return c.json(rows);
});

app.post('/api/admin/students/bulk', async (c) => {
  const body = await c.req.json();
  const students = body.students; // Array of { id, name, class }
  const pool = getDb(c.env);
  
  // Simple bulk insert (in production, use parameterized queries properly)
  for (const s of students) {
    await pool.query('INSERT INTO students (id, name, class) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, class = EXCLUDED.class', [s.id, s.name, s.class]);
  }
  return c.json({ success: true, count: students.length });
});

app.put('/api/admin/students/:id', async (c) => {
  const id = c.req.param('id');
  const { name, class: className } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE students SET name = $1, class = $2 WHERE id = $3', [name, className, id]);
  return c.json({ success: true });
});

app.delete('/api/admin/students/:id', async (c) => {
  const id = c.req.param('id');
  const pool = getDb(c.env);
  await pool.query('DELETE FROM students WHERE id = $1', [id]);
  return c.json({ success: true });
});

app.get('/api/admin/users', async (c) => {
  const pool = getDb(c.env);
  const { rows } = await pool.query('SELECT id, username, role FROM users ORDER BY id');
  return c.json(rows);
});

app.post('/api/admin/users', async (c) => {
  const { username, password, role } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [username, password, role]);
  return c.json({ success: true });
});

app.put('/api/admin/users/:id', async (c) => {
  const id = c.req.param('id');
  const { username, password, role } = await c.req.json();
  const pool = getDb(c.env);
  if (password) {
    await pool.query('UPDATE users SET username = $1, password = $2, role = $3 WHERE id = $4', [username, password, role, id]);
  } else {
    await pool.query('UPDATE users SET username = $1, role = $2 WHERE id = $3', [username, role, id]);
  }
  return c.json({ success: true });
});

app.delete('/api/admin/users/:id', async (c) => {
  const id = c.req.param('id');
  const pool = getDb(c.env);
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return c.json({ success: true });
});

app.get('/api/admin/exams', async (c) => {
  const pool = getDb(c.env);
  const { rows } = await pool.query('SELECT * FROM exams ORDER BY id DESC');
  return c.json(rows);
});

app.post('/api/admin/exams', async (c) => {
  const { code, subject_id, title, pdf_url, duration_minutes } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query(
    'INSERT INTO exams (code, subject_id, title, pdf_url, duration_minutes) VALUES ($1, $2, $3, $4, $5)',
    [code, subject_id, title, pdf_url, duration_minutes]
  );
  return c.json({ success: true });
});

app.get('/api/admin/subjects', async (c) => {
  const pool = getDb(c.env);
  const { rows } = await pool.query('SELECT * FROM subjects ORDER BY id');
  return c.json(rows);
});

app.post('/api/admin/subjects', async (c) => {
  const { name } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('INSERT INTO subjects (name) VALUES ($1)', [name]);
  return c.json({ success: true });
});

app.put('/api/admin/subjects/:id', async (c) => {
  const id = c.req.param('id');
  const { name } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE subjects SET name = $1 WHERE id = $2', [name, id]);
  return c.json({ success: true });
});

app.delete('/api/admin/subjects/:id', async (c) => {
  const id = c.req.param('id');
  const pool = getDb(c.env);
  await pool.query('DELETE FROM subjects WHERE id = $1', [id]);
  return c.json({ success: true });
});

app.put('/api/admin/exams/:id', async (c) => {
  const id = c.req.param('id');
  const { code, subject_id, title, pdf_url, duration_minutes } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query(
    'UPDATE exams SET code = $1, subject_id = $2, title = $3, pdf_url = $4, duration_minutes = $5 WHERE id = $6',
    [code, subject_id, title, pdf_url, duration_minutes, id]
  );
  return c.json({ success: true });
});

app.delete('/api/admin/exams/:id', async (c) => {
  const id = c.req.param('id');
  const pool = getDb(c.env);
  await pool.query('DELETE FROM exams WHERE id = $1', [id]);
  return c.json({ success: true });
});

app.get('/api/admin/exams/:examId/questions', async (c) => {
  const examId = c.req.param('examId');
  const pool = getDb(c.env);
  // Ensure weight column exists
  try { await pool.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1'); } catch (e) {}
  const { rows } = await pool.query('SELECT * FROM questions WHERE exam_id = $1 ORDER BY number', [examId]);
  return c.json(rows);
});

app.post('/api/admin/exams/:examId/questions', async (c) => {
  const examId = c.req.param('examId');
  const { number, type, answer_key, weight } = await c.req.json();
  const pool = getDb(c.env);
  try { await pool.query('ALTER TABLE questions ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1'); } catch (e) {}
  
  const { rows } = await pool.query('SELECT id FROM questions WHERE exam_id = $1 AND number = $2', [examId, number]);
  if (rows.length > 0) {
    await pool.query('UPDATE questions SET type = $1, answer_key = $2, weight = $3 WHERE id = $4', [type, answer_key, weight || 1, rows[0].id]);
  } else {
    await pool.query('INSERT INTO questions (exam_id, number, type, answer_key, weight) VALUES ($1, $2, $3, $4, $5)', [examId, number, type, answer_key, weight || 1]);
  }
  return c.json({ success: true });
});

app.delete('/api/admin/questions/:id', async (c) => {
  const id = c.req.param('id');
  const pool = getDb(c.env);
  await pool.query('DELETE FROM questions WHERE id = $1', [id]);
  return c.json({ success: true });
});

app.get('/api/admin/reports/:examId', async (c) => {
  const examId = c.req.param('examId');
  const pool = getDb(c.env);
  const { rows } = await pool.query(`
    SELECT st.id as student_id, st.name as student_name, st.class,
           COALESCE(SUM(a.score), 0) as total_score,
           NOT EXISTS (
             SELECT 1 FROM questions q2 
             LEFT JOIN answers a2 ON a2.question_id = q2.id AND a2.session_id = s.id
             WHERE q2.exam_id = s.exam_id AND q2.type = 'ESSAY' AND a2.score IS NULL
           ) as is_graded
    FROM sessions s
    JOIN students st ON s.student_id = st.id
    LEFT JOIN answers a ON s.id = a.session_id
    WHERE s.exam_id = $1
    GROUP BY st.id, st.name, st.class, s.id, s.exam_id
    ORDER BY st.name
  `, [examId]);
  return c.json(rows);
});

app.get('/api/admin/exams/:examId/students/:studentId/answers', async (c) => {
  const examId = c.req.param('examId');
  const studentId = c.req.param('studentId');
  const pool = getDb(c.env);
  
  const { rows } = await pool.query(`
    SELECT a.id, a.answer_text, a.score, q.number, q.type, q.answer_key, q.weight,
           (a.answer_text = q.answer_key) as is_correct
    FROM answers a
    JOIN sessions s ON a.session_id = s.id
    JOIN questions q ON a.question_id = q.id
    WHERE s.exam_id = $1 AND s.student_id = $2
    ORDER BY q.number
  `, [examId, studentId]);
  
  return c.json(rows);
});

// --- Student Endpoints ---
app.post('/api/student/login', async (c) => {
  const { studentId, examCode } = await c.req.json();
  const pool = getDb(c.env);
  
  const studentRes = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);
  if (studentRes.rowCount === 0) return c.json({ error: 'Student not found' }, 404);
  
  const examRes = await pool.query('SELECT * FROM exams WHERE code = $1 AND is_active = true', [examCode]);
  if (examRes.rowCount === 0) return c.json({ error: 'Exam not found or inactive' }, 404);
  
  const exam = examRes.rows[0];
  
  // Create or get session
  let sessionRes = await pool.query('SELECT * FROM sessions WHERE student_id = $1 AND exam_id = $2', [studentId, exam.id]);
  if (sessionRes.rowCount === 0) {
    sessionRes = await pool.query('INSERT INTO sessions (student_id, exam_id) VALUES ($1, $2) RETURNING *', [studentId, exam.id]);
  }
  
  const session = sessionRes.rows[0];
  if (session.status === 'forced_close') return c.json({ error: 'Session closed by proctor' }, 403);
  if (session.status === 'finished') return c.json({ error: 'Anda sudah menyelesaikan ujian ini' }, 403);
  
  return c.json({ student: studentRes.rows[0], exam, session });
});

app.get('/api/student/exam/:examId/questions', async (c) => {
  const examId = c.req.param('examId');
  const pool = getDb(c.env);
  const { rows } = await pool.query('SELECT id, number, type FROM questions WHERE exam_id = $1 ORDER BY number', [examId]);
  return c.json(rows);
});

app.post('/api/student/violation', async (c) => {
  const { sessionId } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE sessions SET violations = violations + 1 WHERE id = $1', [sessionId]);
  return c.json({ success: true });
});

app.post('/api/student/answer', async (c) => {
  const { sessionId, questionId, answerText } = await c.req.json();
  const pool = getDb(c.env);
  
  // Get question details to auto-grade if PG
  const qRes = await pool.query('SELECT type, answer_key, weight FROM questions WHERE id = $1', [questionId]);
  let score = null;
  if (qRes.rowCount > 0) {
    const q = qRes.rows[0];
    if (q.type === 'PG') {
      score = (answerText === q.answer_key) ? (q.weight || 1) : 0;
    }
  }

  await pool.query(
    'INSERT INTO answers (session_id, question_id, answer_text, score) VALUES ($1, $2, $3, $4) ON CONFLICT (session_id, question_id) DO UPDATE SET answer_text = EXCLUDED.answer_text, score = EXCLUDED.score',
    [sessionId, questionId, answerText, score]
  );
  return c.json({ success: true });
});

app.post('/api/student/finish', async (c) => {
  const { sessionId } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE sessions SET status = $1, end_time = CURRENT_TIMESTAMP WHERE id = $2', ['finished', sessionId]);
  return c.json({ success: true });
});

app.post('/api/student/ping', async (c) => {
  const { sessionId } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE sessions SET last_ping = CURRENT_TIMESTAMP WHERE id = $1', [sessionId]);
  
  const { rows } = await pool.query(`
    SELECT s.status, e.is_active 
    FROM sessions s 
    JOIN exams e ON s.exam_id = e.id 
    WHERE s.id = $1
  `, [sessionId]);
  
  if (rows.length > 0) {
    return c.json({ success: true, status: rows[0].status, is_active: rows[0].is_active });
  }
  return c.json({ success: true });
});

// --- Proctor Endpoints ---
app.get('/api/proctor/exams', async (c) => {
  const pool = getDb(c.env);
  const { rows } = await pool.query('SELECT * FROM exams ORDER BY id DESC');
  return c.json(rows);
});

app.post('/api/proctor/exam/:id/toggle', async (c) => {
  const id = c.req.param('id');
  const { is_active } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE exams SET is_active = $1 WHERE id = $2', [is_active, id]);
  
  if (!is_active) {
    // Auto finish all active sessions for this exam when deactivated
    await pool.query("UPDATE sessions SET status = 'finished', end_time = CURRENT_TIMESTAMP WHERE exam_id = $1 AND status = 'active'", [id]);
  }
  
  return c.json({ success: true });
});

app.get('/api/proctor/sessions/:examId', async (c) => {
  const examId = c.req.param('examId');
  const pool = getDb(c.env);
  const { rows } = await pool.query(`
    SELECT s.*, st.name as student_name 
    FROM sessions s 
    JOIN students st ON s.student_id = st.id 
    WHERE s.exam_id = $1
  `, [examId]);
  return c.json(rows);
});

app.post('/api/proctor/session/:sessionId/close', async (c) => {
  const sessionId = c.req.param('sessionId');
  const pool = getDb(c.env);
  await pool.query('UPDATE sessions SET status = $1 WHERE id = $2', ['forced_close', sessionId]);
  return c.json({ success: true });
});

// --- Grader Endpoints ---
app.get('/api/grader/answers/:examId', async (c) => {
  const examId = c.req.param('examId');
  const pool = getDb(c.env);
  const { rows } = await pool.query(`
    SELECT a.*, q.number, q.type, q.answer_key, s.student_id 
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN sessions s ON a.session_id = s.id
    WHERE q.exam_id = $1
  `, [examId]);
  return c.json(rows);
});

app.post('/api/grader/score', async (c) => {
  const { answerId, score } = await c.req.json();
  const pool = getDb(c.env);
  await pool.query('UPDATE answers SET score = $1 WHERE id = $2', [score, answerId]);
  return c.json({ success: true });
});

export default app;
