import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore, useExamStore } from '@/lib/store';

export default function StudentLogin() {
  const [studentId, setStudentId] = useState('');
  const [examCode, setExamCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { login } = useAuthStore();
  const { setExam } = useExamStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await api.studentLogin(studentId, examCode);
      login(data.student, 'student');
      setExam(data.exam, data.session);
      navigate('/student/exam');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa ID dan Kode Ujian.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Portal Ujian</CardTitle>
          <CardDescription className="text-slate-500">Masukkan ID Murid dan Kode Ujian</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="studentId">ID Murid</Label>
              <Input 
                id="studentId" 
                placeholder="Contoh: S001" 
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="examCode">Kode Ujian</Label>
              <Input 
                id="examCode" 
                placeholder="Contoh: MTK-01" 
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                required
                className="h-12 uppercase"
              />
            </div>
          </CardContent>
          <CardFooter className="pb-10">
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? 'Memproses...' : 'Mulai Ujian'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
