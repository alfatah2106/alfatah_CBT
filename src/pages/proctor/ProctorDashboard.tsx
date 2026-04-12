import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { ShieldAlert, Wifi, WifiOff, Play, Square } from 'lucide-react';

export default function ProctorDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadSessions();
      const interval = setInterval(loadSessions, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const data = await api.getProctorExams();
      setExams(data);
      if (data.length > 0 && !selectedExamId) {
        setSelectedExamId(data[0].id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const loadSessions = async () => {
    if (!selectedExamId) return;
    try {
      const data = await api.getSessions(selectedExamId);
      setSessions(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleForceClose = async (sessionId: number) => {
    if (confirm('Yakin ingin menutup paksa sesi murid ini?')) {
      await api.closeSession(sessionId);
      loadSessions();
    }
  };

  const handleToggleExam = async (examId: number, currentStatus: boolean) => {
    if (confirm(`Yakin ingin ${currentStatus ? 'menonaktifkan' : 'mengaktifkan'} ujian ini?`)) {
      await api.toggleExamStatus(examId, !currentStatus);
      loadExams();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Panel Pengawas</h1>
            <p className="text-slate-500 mt-2">Monitoring ujian real-time & aktivasi sesi.</p>
          </div>
          <div className="flex gap-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="text-emerald-600 font-bold text-2xl">{sessions.filter(s => s.status === 'active').length}</div>
                <div className="text-sm text-emerald-800 font-medium">Murid Aktif</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Ujian</CardTitle>
            <CardDescription>Aktifkan atau nonaktifkan ujian agar murid bisa login.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Judul Ujian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-500">Belum ada ujian</TableCell></TableRow>
                ) : (
                  exams.map((e) => (
                    <TableRow key={e.id} className={selectedExamId === e.id ? 'bg-slate-50' : ''}>
                      <TableCell className="font-medium">{e.code}</TableCell>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>
                        {e.is_active ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Nonaktif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant={e.is_active ? "destructive" : "default"} 
                          size="sm" 
                          onClick={() => handleToggleExam(e.id, e.is_active)}
                          className="flex items-center gap-2"
                        >
                          {e.is_active ? <><Square className="w-4 h-4" /> Nonaktifkan</> : <><Play className="w-4 h-4" /> Aktifkan</>}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedExamId(e.id)}
                        >
                          Lihat Sesi
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedExamId && (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Sesi Murid</CardTitle>
              <CardDescription>Status koneksi dan pengerjaan murid secara real-time.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Murid</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pelanggaran</TableHead>
                    <TableHead>Koneksi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
                  ) : sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-slate-500">Belum ada murid yang login</TableCell></TableRow>
                  ) : (
                    sessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.student_id}</TableCell>
                        <TableCell>{s.student_name}</TableCell>
                        <TableCell>
                          {s.status === 'active' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Aktif</Badge>
                          ) : s.status === 'forced_close' ? (
                            <Badge variant="destructive">Ditutup Paksa</Badge>
                          ) : (
                            <Badge variant="secondary">Selesai</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {s.violations > 0 ? (
                            <span className="text-rose-600 font-bold">{s.violations} kali</span>
                          ) : (
                            <span className="text-slate-400">Aman</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {s.status === 'active' ? (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm">
                              <Wifi className="w-4 h-4" /> Online
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                              <WifiOff className="w-4 h-4" /> Offline
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleForceClose(s.id)}
                            disabled={s.status !== 'active'}
                            className="flex items-center gap-2"
                          >
                            <ShieldAlert className="w-4 h-4" />
                            Tutup Paksa
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
