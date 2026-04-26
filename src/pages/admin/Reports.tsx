import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { api } from '@/lib/api';
import { exportToExcel } from '@/lib/exportExcel';

export default function Reports() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadReports(parseInt(selectedExamId));
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    try {
      const data = await api.getExams();
      setExams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async (examId: number) => {
    setLoading(true);
    try {
      const data = await api.getReports(examId);
      setReports(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDownloadExcel = () => {
    if (reports.length === 0) return;
    
    // Siapkan data untuk diexport
    const dataToExport = reports.map(r => ({
      'ID Murid': r.student_id,
      'Nama Murid': r.student_name,
      'Kelas': r.class,
      'Total Nilai': r.total_score,
      'Koreksi Selesai': r.is_graded ? 'Ya' : 'Belum'
    }));

    const selectedExam = exams.find(e => e.id.toString() === selectedExamId);
    const examName = selectedExam ? selectedExam.title.replace(/[^a-zA-Z0-9]/g, '_') : selectedExamId;
    exportToExcel(dataToExport, `Nilai_${examName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Laporan Nilai</h1>
        <p className="text-slate-500 mt-2">Rekapitulasi nilai hasil ujian gabungan PG dan Essay.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
          <CardDescription>Pilih ujian untuk melihat rekap nilai.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-center">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Pilih Ujian" />
            </SelectTrigger>
            <SelectContent>
              {exams.map(e => (
                <SelectItem key={e.id} value={e.id.toString()}>{e.code} - {e.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleDownloadExcel} 
            disabled={reports.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Unduh Excel
          </Button>
        </CardContent>
      </Card>

      {selectedExamId && (
        <Card>
          <CardHeader>
            <CardTitle>Rekapitulasi Nilai</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Murid</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead className="text-right">Total Nilai</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
                ) : reports.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center text-slate-500">Belum ada data nilai untuk ujian ini</TableCell></TableRow>
                ) : (
                  reports.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.student_id}</TableCell>
                      <TableCell>{r.student_name}</TableCell>
                      <TableCell>{r.class}</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">{r.total_score}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
