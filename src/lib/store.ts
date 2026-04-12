import { create } from 'zustand';

interface AuthState {
  user: any | null;
  role: 'admin' | 'proctor' | 'grader' | 'student' | null;
  login: (user: any, role: 'admin' | 'proctor' | 'grader' | 'student') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  login: (user, role) => set({ user, role }),
  logout: () => set({ user: null, role: null }),
}));

interface ExamState {
  currentExam: any | null;
  currentSession: any | null;
  setExam: (exam: any, session: any) => void;
}

export const useExamStore = create<ExamState>((set) => ({
  currentExam: null,
  currentSession: null,
  setExam: (exam, session) => set({ currentExam: exam, currentSession: session }),
}));
