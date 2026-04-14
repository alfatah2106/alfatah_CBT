import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useExamStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, AlertCircle } from 'lucide-react';
import { useLockdown } from '@/lib/useLockdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Exam() {
  const { user, role, logout } = useAuthStore();
  const { currentExam, currentSession } = useExamStore();
  const navigate = useNavigate();

  // 1. Lockdown Mode
  useLockdown(true);

  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  
  // State Dialog
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [showBlurWarning, setShowBlurWarning] = useState(false);
  const [blurCount, setBlurCount] = useState(0);

  // 2. Deteksi Pindah Tab (Anti-Blur)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBlurCount(prev => prev + 1);
        setShowBlurWarning(true);
        if (currentSession?.id) {
          api.reportViolation(currentSession.id).catch(console.error);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentSession]);

  // 3. Load Data & Timer
  useEffect(() => {
    if (!user || role !== 'student' || !currentExam) {
      navigate('/student/login');
      return;
    }

    api.getQuestions(currentExam.id).then(data => {
      setQuestions(data);
    });

    const durationInMs = (currentExam.duration_minutes || 0) * 60000;
    // Workaround: Kurangi 7 jam (7 * 60 * 60 * 1000 ms) dari startTime karena bug zona waktu
    const startTime = new Date(currentSession.start_time).getTime() - (7 * 60 * 60 * 1000);
    const endTime = startTime + durationInMs;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        handleConfirmFinish();
      } else {
        setTimeLeft(Math.floor(distance / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentExam, currentSession, user, role, navigate]);

  // 4. Ping Session
  useEffect(() => {
    if (!currentSession?.id) return;
    const pingInterval = setInterval(() => {
      api.pingSession(currentSession.id).catch(console.error);
    }, 30000); // Ping every 30 seconds
    return () => clearInterval(pingInterval);
  }, [currentSession]);

  const handleAnswer = async (answerText: string) => {
    const q = questions[activeQuestionIndex];
    if (!q) return;
    setAnswers(prev => ({ ...prev, [q.id]: answerText }));
    try {
      await api.submitAnswer(currentSession.id, q.id, answerText);
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleConfirmFinish = async () => {
    if (currentSession?.id) {
      try {
        await api.finishExam(currentSession.id);
      } catch (err) {
        console.error('Finish failed', err);
      }
    }
    logout();
    navigate('/');
  };

  if (!currentExam) return null;
  const activeQuestion = questions[activeQuestionIndex];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl text-slate-800 tracking-tight">{currentExam.title}</div>
          <div className="hidden md:block text-sm text-slate-500 px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
            {user?.name}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-rose-600 font-mono text-2xl font-bold bg-rose-50 px-4 py-1 rounded-lg border border-rose-200">
            <Clock className="w-6 h-6" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="destructive" className="font-bold" onClick={() => setShowFinishDialog(true)}>
            SELESAI
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 p-4 bg-slate-200/50">
          <div className="bg-white rounded-xl shadow-md border border-slate-300 h-full overflow-hidden flex flex-col">
            <div className="bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase shrink-0">Naskah Soal</div>
            <iframe src={`${currentExam.pdf_url}#toolbar=0`} className="w-full flex-1 border-0" title="Soal" />
          </div>
        </div>

        {/* Navigation & Answer */}
        <div className="w-[400px] flex flex-col bg-white border-l border-slate-200 shadow-xl overflow-hidden">
          {/* Navigasi Nomor */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-wider">Navigasi Soal</h3>
            <div className="max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-5 gap-2 pb-2">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isActive = idx === activeQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`h-12 w-12 rounded-lg text-sm font-bold transition-all flex items-center justify-center border-2
                        ${isActive ? 'border-blue-600 ring-4 ring-blue-50 z-10' : ''}
                        ${isAnswered ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'}`}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Area Jawaban */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
            {activeQuestion ? (
              <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center shrink-0">
                  <h3 className="text-xl font-black text-slate-800 uppercase">No. {activeQuestion.number}</h3>
                </div>

                {/* Scroll Biasa (Native) */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {activeQuestion.type === 'PG' ? (
                    <div className="flex flex-col gap-4">
                      <Label className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Pilih Jawaban:</Label>
                      <div className="flex flex-wrap gap-3">
                        {['A', 'B', 'C', 'D', 'E'].map(opt => {
                          const isSelected = answers[activeQuestion.id] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => handleAnswer(opt)}
                              className={`w-12 h-12 rounded-lg text-lg font-bold transition-all flex items-center justify-center border-2
                                ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-slate-50'}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <Label className="text-slate-400 font-bold text-[11px] uppercase tracking-widest">Jawaban Essay:</Label>
                      <Textarea
                        className="min-h-[350px] w-full resize-none p-4 text-base border-2 focus-visible:ring-blue-500 rounded-xl bg-slate-50 leading-relaxed"
                        placeholder="Ketik jawaban..."
                        value={answers[activeQuestion.id] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Navigasi */}
                <div className="p-6 border-t border-slate-100 bg-white grid grid-cols-2 gap-3 shrink-0">
                  <Button variant="outline" className="h-12 font-bold" onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))} disabled={activeQuestionIndex === 0}>KEMBALI</Button>
                  <Button className="h-12 font-bold bg-slate-900" onClick={() => setActiveQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={activeQuestionIndex === questions.length - 1}>LANJUT</Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">Loading...</div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Selesaikan Ujian?</AlertDialogTitle>
            <AlertDialogDescription>Semua jawaban akan dikirim. Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmFinish} className="bg-rose-600 hover:bg-rose-700">Ya, Selesai</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showBlurWarning} onOpenChange={setShowBlurWarning}>
        <AlertDialogContent className="border-2 border-rose-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-rose-600"><AlertCircle /> Peringatan Keamanan</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-900">
              Jangan meninggalkan halaman ujian atau membuka aplikasi lain. Aktivitas Anda dicatat.<br/><br/>
              Pelanggaran: <span className="font-bold text-rose-600">{blurCount}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBlurWarning(false)}>Saya Mengerti</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}