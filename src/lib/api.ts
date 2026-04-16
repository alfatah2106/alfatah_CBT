// Mock API for preview environment
const API_URL = import.meta.env.VITE_API_URL || 'https://cbt01.miqdad-alfatah.workers.dev/api';
const USE_MOCK = false;

// Helper to add headers
const fetchWithHeaders = async (url: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
};

// Mock Data
let mockStudents = [
  { id: 'S001', name: 'Budi Santoso', class: '12 IPA 1' },
  { id: 'S002', name: 'Siti Aminah', class: '12 IPA 1' },
];

let mockExams = [
  { id: 1, code: 'MTK-01', title: 'Ujian Matematika', pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', duration_minutes: 120, is_active: true },
];

let mockQuestions = [
  { id: 1, exam_id: 1, number: 1, type: 'PG', answer_key: 'A' },
  { id: 2, exam_id: 1, number: 2, type: 'PG', answer_key: 'C' },
  { id: 3, exam_id: 1, number: 3, type: 'PG', answer_key: 'B' },
  { id: 4, exam_id: 1, number: 4, type: 'PG', answer_key: 'D' },
  { id: 5, exam_id: 1, number: 5, type: 'PG', answer_key: 'E' },
  { id: 6, exam_id: 1, number: 6, type: 'ESSAY', answer_key: 'Rumus abc' },
];

let mockSessions = [
  { id: 1, student_id: 'S001', exam_id: 1, status: 'active', student_name: 'Budi Santoso' }
];

let mockAnswers: any[] = [];

export const api = {
  // Admin
  getStats: async () => {
    if (USE_MOCK) return { students: 1240, subjects: 12, activeExams: 3 };
    const res = await fetch(`${API_URL}/admin/stats`);
    return res.json();
  },
  staffLogin: async (data: any) => {
    if (USE_MOCK) return { user: { id: 1, username: data.username, role: data.role } };
    const res = await fetchWithHeaders(`${API_URL}/staff/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },
  getUsers: async () => {
    const res = await fetch(`${API_URL}/admin/users`);
    return res.json();
  },
  addUser: async (data: any) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  bulkUploadUsers: async (users: any[]) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/users/bulk`, {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
    return res.json();
  },
  updateUser: async (id: string, data: any) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteUser: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getStudents: async () => {
    if (USE_MOCK) return mockStudents;
    const res = await fetch(`${API_URL}/admin/students`);
    return res.json();
  },
  bulkUploadStudents: async (students: any[]) => {
    if (USE_MOCK) {
      mockStudents = [...mockStudents, ...students];
      return { success: true };
    }
    const res = await fetchWithHeaders(`${API_URL}/admin/students/bulk`, {
      method: 'POST',
      body: JSON.stringify({ students }),
    });
    return res.json();
  },
  updateStudent: async (id: string, data: any) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteStudent: async (id: string) => {
    const res = await fetch(`${API_URL}/admin/students/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getExams: async () => {
    if (USE_MOCK) return mockExams;
    const res = await fetch(`${API_URL}/admin/exams`);
    return res.json();
  },
  createExam: async (exam: any) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/exams`, {
      method: 'POST',
      body: JSON.stringify(exam),
    });
    return res.json();
  },
  updateExam: async (id: number, exam: any) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(exam),
    });
    return res.json();
  },
  deleteExam: async (id: number) => {
    const res = await fetch(`${API_URL}/admin/exams/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getSubjects: async () => {
    const res = await fetch(`${API_URL}/admin/subjects`);
    return res.json();
  },
  createSubject: async (name: string) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/subjects`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    return res.json();
  },
  bulkUploadSubjects: async (subjects: any[]) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/subjects/bulk`, {
      method: 'POST',
      body: JSON.stringify({ subjects }),
    });
    return res.json();
  },
  updateSubject: async (id: number, name: string) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
    return res.json();
  },
  deleteSubject: async (id: number) => {
    const res = await fetch(`${API_URL}/admin/subjects/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getExamQuestions: async (examId: number) => {
    const res = await fetch(`${API_URL}/admin/exams/${examId}/questions`);
    return res.json();
  },
  saveExamQuestion: async (examId: number, question: any) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
    return res.json();
  },
  bulkUploadQuestions: async (examId: number, questions: any[]) => {
    const res = await fetchWithHeaders(`${API_URL}/admin/exams/${examId}/questions/bulk`, {
      method: 'POST',
      body: JSON.stringify({ questions }),
    });
    return res.json();
  },
  deleteExamQuestion: async (id: number) => {
    const res = await fetch(`${API_URL}/admin/questions/${id}`, { method: 'DELETE' });
    return res.json();
  },
  getReports: async (examId: number) => {
    const res = await fetch(`${API_URL}/admin/reports/${examId}`);
    return res.json();
  },
  
  // Student
  studentLogin: async (studentId: string, examCode: string) => {
    if (USE_MOCK) {
      const student = mockStudents.find(s => s.id === studentId);
      const exam = mockExams.find(e => e.code === examCode && e.is_active);
      if (!student || !exam) throw new Error('Invalid credentials or inactive exam');
      let session = mockSessions.find(s => s.student_id === studentId && s.exam_id === exam.id);
      if (!session) {
        session = { id: Date.now(), student_id: studentId, exam_id: exam.id, status: 'active', student_name: student.name };
        mockSessions.push(session);
      }
      if (session.status === 'forced_close') throw new Error('Session closed');
      return { student, exam, session };
    }
    const res = await fetchWithHeaders(`${API_URL}/student/login`, {
      method: 'POST',
      body: JSON.stringify({ studentId, examCode }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  getQuestions: async (examId: number) => {
    if (USE_MOCK) return mockQuestions.filter(q => q.exam_id === examId);
    const res = await fetch(`${API_URL}/student/exam/${examId}/questions`);
    return res.json();
  },
  submitAnswer: async (sessionId: number, questionId: number, answerText: string) => {
    if (USE_MOCK) {
      const existing = mockAnswers.find(a => a.session_id === sessionId && a.question_id === questionId);
      if (existing) existing.answer_text = answerText;
      else mockAnswers.push({ id: Date.now(), session_id: sessionId, question_id: questionId, answer_text: answerText });
      return { success: true };
    }
    const res = await fetchWithHeaders(`${API_URL}/student/answer`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, answerText }),
    });
    return res.json();
  },
  reportViolation: async (sessionId: number) => {
    if (USE_MOCK) return { success: true };
    const res = await fetchWithHeaders(`${API_URL}/student/violation`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },
  finishExam: async (sessionId: number) => {
    if (USE_MOCK) {
      const session = mockSessions.find(s => s.id === sessionId);
      if (session) session.status = 'finished';
      return { success: true };
    }
    const res = await fetchWithHeaders(`${API_URL}/student/finish`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },
  pingSession: async (sessionId: number) => {
    if (USE_MOCK) return { success: true };
    const res = await fetchWithHeaders(`${API_URL}/student/ping`, {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
    return res.json();
  },
  
  // Proctor
  getProctorExams: async () => {
    if (USE_MOCK) return mockExams;
    const res = await fetch(`${API_URL}/proctor/exams`);
    return res.json();
  },
  toggleExamStatus: async (examId: number, isActive: boolean) => {
    if (USE_MOCK) return { success: true };
    const res = await fetchWithHeaders(`${API_URL}/proctor/exam/${examId}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ is_active: isActive })
    });
    return res.json();
  },
  getSessions: async (examId: number) => {
    if (USE_MOCK) return mockSessions.filter(s => s.exam_id === examId);
    const res = await fetch(`${API_URL}/proctor/sessions/${examId}`);
    return res.json();
  },
  closeSession: async (sessionId: number) => {
    if (USE_MOCK) {
      const session = mockSessions.find(s => s.id === sessionId);
      if (session) session.status = 'forced_close';
      return { success: true };
    }
    const res = await fetchWithHeaders(`${API_URL}/proctor/session/${sessionId}/close`, { method: 'POST' });
    return res.json();
  },
  
  // Grader
  getAnswers: async (examId: number) => {
    if (USE_MOCK) {
      return mockAnswers.map(a => {
        const q = mockQuestions.find(q => q.id === a.question_id);
        const s = mockSessions.find(s => s.id === a.session_id);
        return { ...a, number: q?.number, type: q?.type, answer_key: q?.answer_key, student_id: s?.student_id };
      });
    }
    const res = await fetch(`${API_URL}/grader/answers/${examId}`);
    return res.json();
  },
  getAnswersByStudent: async (examId: string, studentId: string) => {
    if (USE_MOCK) return [];
    const res = await fetch(`${API_URL}/admin/exams/${examId}/students/${studentId}/answers`);
    return res.json();
  },
  submitScore: async (answerId: number, score: number) => {
    if (USE_MOCK) {
      const answer = mockAnswers.find(a => a.id === answerId);
      if (answer) answer.score = score;
      return { success: true };
    }
    const res = await fetchWithHeaders(`${API_URL}/grader/score`, {
      method: 'POST',
      body: JSON.stringify({ answerId, score }),
    });
    return res.json();
  }
};
