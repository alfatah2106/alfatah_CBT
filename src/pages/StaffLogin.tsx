import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'proctor' | 'grader'>('admin');
  const [examCode, setExamCode] = useState(''); // For grader
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.staffLogin({ username, password, role });
      login(data.user, role);
      
      if (role === 'admin') navigate('/admin');
      else if (role === 'proctor') navigate('/proctor');
      else if (role === 'grader') {
        // We could store examCode in store or pass it via state
        navigate('/grader', { state: { examCode } });
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login Petugas</CardTitle>
          <CardDescription>Masuk sebagai Admin, Pengawas, atau Korektor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Peran</Label>
              <Select value={role} onValueChange={(v: any) => setRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="proctor">Pengawas</SelectItem>
                  <SelectItem value="grader">Korektor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Username</Label>
              <Input 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Masukkan username"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Masukkan password"
              />
            </div>

            {role === 'grader' && (
              <div className="space-y-2">
                <Label>Kode Ujian (Opsional)</Label>
                <Input 
                  value={examCode} 
                  onChange={e => setExamCode(e.target.value)} 
                  placeholder="Contoh: MTK-01"
                />
                <p className="text-xs text-slate-500">Masukkan kode ujian untuk memfilter jawaban.</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
            
            <div className="text-center mt-4">
              <Button variant="link" type="button" onClick={() => navigate('/')} className="text-sm text-slate-500">
                Kembali ke Beranda
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
