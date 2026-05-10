import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Download, Printer } from 'lucide-react';
import { exportToExcel } from '@/lib/exportExcel';

export default function GraderDashboard() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [students, setStudents] = useState<any[]>([]); // List siswa yang ikut ujian
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      loadStudentList(parseInt(selectedExamId));
    }
  }, [selectedExamId]);

  const loadExams = async () => {
    const data = await api.getExams();
    setExams(data);
  };

  const loadStudentList = async (examId: number) => {
    // Mengambil data laporan/rekap sebagai basis daftar siswa
    let data = await api.getReports(examId);
    data.sort((a: any, b: any) => {
      const classA = String(a.class || '').toLowerCase();
      const classB = String(b.class || '').toLowerCase();
      if (classA < classB) return -1;
      if (classA > classB) return 1;
      const nameA = String(a.student_name || '').toLowerCase();
      const nameB = String(b.student_name || '').toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
    setStudents(data);
  };

  const handleOpenKoreksi = async (student: any) => {
    // Ambil semua jawaban (PG & Essay) untuk siswa ini
    const allAnswers = await api.getAnswersByStudent(selectedExamId, student.student_id);
    setSelectedStudent({ ...student, answers: allAnswers });
    setIsModalOpen(true);
  };

  const handleDownloadExcel = () => {
    if (students.length === 0) return;
    
    const dataToExport = students.map(s => ({
      'ID Murid': s.student_id,
      'Nama Murid': s.student_name,
      'Kelas': s.class,
      'Total Nilai': s.total_score,
      'Koreksi Selesai': s.is_graded ? 'Ya' : 'Belum'
    }));

    const selectedExam = exams.find(e => e.id.toString() === selectedExamId);
    const examName = selectedExam ? selectedExam.title.replace(/[^a-zA-Z0-9]/g, '_') : selectedExamId;
    exportToExcel(dataToExport, `Nilai_${examName}`);
  };

  const handlePrintPdf = async () => {
    if (!selectedExamId || students.length === 0) return;
    setIsPrinting(true);
    try {
      const allAnswers = await api.getAllAnswers(selectedExamId);
      
      const grouped: { [key: string]: any[] } = {};
      allAnswers.forEach((ans: any) => {
        if (!grouped[ans.student_id]) grouped[ans.student_id] = [];
        grouped[ans.student_id].push(ans);
      });

      const studentAnswers = students.map(s => ({
        ...s,
        answers: grouped[s.student_id] || []
      }));

      const exam = exams.find(e => e.id.toString() === selectedExamId);
      setPrintData({ exam, students: studentAnswers });

      setTimeout(() => {
        const oldTitle = document.title;
        document.title = `lembar jawab ujian (${exam?.title || selectedExamId})`;
        window.print();
        document.title = oldTitle;
        setIsPrinting(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      setIsPrinting(false);
    }
  };

  return (
    <>
    <div className="p-8 max-w-6xl mx-auto space-y-6 no-print">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Panel Korektor</h1>
          <p className="text-slate-500 mt-1">Koreksi essay dan unduh laporan nilai ujian.</p>
        </div>
      </div>

      <Tabs defaultValue="koreksi" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-sm mb-6">
          <TabsTrigger value="koreksi">Koreksi Jawaban</TabsTrigger>
          <TabsTrigger value="laporan">Laporan Nilai</TabsTrigger>
        </TabsList>

        <TabsContent value="koreksi" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
              <div>
                <CardTitle>Filter Ujian</CardTitle>
                <CardDescription>Pilih ujian untuk melihat daftar siswa.</CardDescription>
              </div>
              <div className="flex gap-4 items-center">
                <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih Pelajaran/Ujian" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                {selectedExamId && (
                  <Button 
                    variant="outline" 
                    className="flex gap-2 items-center text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={handlePrintPdf}
                    disabled={isPrinting}
                  >
                    <Printer className="w-4 h-4" />
                    {isPrinting ? "Menyiapkan PDF..." : "Unduh Bulk PDF"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.student_id}>
                      <TableCell className="font-medium">{s.student_name}</TableCell>
                      <TableCell>{s.class}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={s.is_graded ? "default" : "outline"}
                          className={s.is_graded ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" : ""}
                        >
                          {s.is_graded ? "Selesai" : "Perlu Koreksi"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button onClick={() => handleOpenKoreksi(s)}>Koreksi</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && selectedExamId && (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">Belum ada siswa di ujian ini</TableCell></TableRow>
                  )}
                  {students.length === 0 && !selectedExamId && (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-4">Pilih ujian terlebih dahulu</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laporan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Laporan Nilai Ujian</CardTitle>
              <CardDescription>Pilih ujian dan unduh rekapitulasi nilai akhir siswa.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 items-center mb-6">
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Pilih Pelajaran/Ujian" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleDownloadExcel} 
                disabled={students.length === 0 || !selectedExamId}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Unduh Excel
              </Button>
            </CardContent>
            
            {selectedExamId && (
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-right">Total Nilai</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((s) => (
                      <TableRow key={s.student_id}>
                        <TableCell className="font-medium">{s.student_name}</TableCell>
                        <TableCell>{s.class}</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">{s.total_score}</TableCell>
                      </TableRow>
                    ))}
                    {students.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center text-slate-500 py-4">Belum ada data nilai</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Detail Jawaban */}
      {selectedStudent && (
        <KoreksiModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          student={selectedStudent}
          onSaveSuccess={() => loadStudentList(parseInt(selectedExamId))}
        />
      )}
    </div>

    {isPrinting && printData && (
      <div className="print-only w-full bg-white text-black min-h-screen">
        {printData.students.map((student: any, index: number) => (
          <div key={student.student_id} className="p-8 page-break" style={{ breakAfter: index === printData.students.length - 1 ? 'auto' : 'page', pageBreakAfter: index === printData.students.length - 1 ? 'auto' : 'always' }}>
              <h2 className="text-2xl font-bold mb-1">Lembar Jawab Ujian</h2>
              <p className="mb-4 text-black font-semibold">Judul Ujian: {printData.exam?.title}</p>
              <table className="mb-6">
                 <tbody>
                   <tr><td className="font-semibold pr-4">Nama</td><td>: {student.student_name}</td></tr>
                   <tr><td className="font-semibold pr-4">Kelas</td><td>: {student.class}</td></tr>
                   <tr><td className="font-semibold pr-4">Total Nilai</td><td>: {student.total_score}</td></tr>
                 </tbody>
              </table>
              
              <h3 className="font-bold text-lg mb-2">I. Pilihan Ganda</h3>
              <table className="w-full border-collapse border border-black mb-6 text-sm">
                  <thead>
                      <tr>
                          <th className="border border-black p-2 text-left w-12">No</th>
                          <th className="border border-black p-2 text-left">Jawaban Siswa</th>
                          <th className="border border-black p-2 text-left">Kunci</th>
                          <th className="border border-black p-2 text-right">Skor</th>
                      </tr>
                  </thead>
                  <tbody>
                      {student.answers.filter((a: any) => a.type === 'PG').sort((a: any, b: any) => a.number - b.number).map((a: any) => (
                          <tr key={a.id}>
                              <td className="border border-black p-2">{a.number}</td>
                              <td className="border border-black p-2">{a.answer_text} {a.is_correct ? '(Benar)' : '(Salah)'}</td>
                              <td className="border border-black p-2">{a.answer_key}</td>
                              <td className="border border-black p-2 text-right">{a.score}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>

              <h3 className="font-bold text-lg mb-2">II. Essay</h3>
              <div className="space-y-4">
                  {student.answers.filter((a: any) => a.type === 'ESSAY').sort((a: any, b: any) => a.number - b.number).map((a: any) => (
                      <div key={a.id} className="border border-black p-4 break-inside-avoid shadow-none">
                          <div className="flex justify-between font-bold mb-2">
                             <span>No. {a.number}</span>
                             <span>Skor: {a.score ?? 'Belum dikoreksi'}</span>
                          </div>
                          <p className="text-sm mb-2"><span className="font-semibold text-black">Kunci:</span> {a.answer_key}</p>
                          <div className="p-3 border border-slate-300 italic whitespace-pre-wrap">
                              {a.answer_text || "Tidak menjawab"}
                          </div>
                      </div>
                  ))}
              </div>
          </div>
        ))}
      </div>
    )}
    </>
  );
}

function KoreksiModal({ isOpen, setIsOpen, student, onSaveSuccess }: any) {
  const [essayScores, setEssayScores] = useState<any>({});

  // Pisahkan tipe soal
  const pgAnswers = student.answers.filter((a: any) => a.type === 'PG');
  const essayAnswers = student.answers.filter((a: any) => a.type === 'ESSAY');

  const handleSaveAll = async () => {
    // Logika simpan semua nilai essay yang diubah
    for (const [id, score] of Object.entries(essayScores)) {
      await api.submitScore(Number(id), Number(score));
    }
    setIsOpen(false);
    onSaveSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lembar Jawab: {student.student_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {/* SEKSI PILIHAN GANDA */}
          <section>
            <h3 className="font-bold text-lg mb-3 text-blue-700">I. Pilihan Ganda (Otomatis)</h3>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Jawaban Siswa</TableHead>
                  <TableHead>Kunci</TableHead>
                  <TableHead className="text-right">Skor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pgAnswers.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.number}</TableCell>
                    <TableCell className={a.is_correct ? "text-emerald-600" : "text-red-600"}>
                      {a.answer_text}
                    </TableCell>
                    <TableCell>{a.answer_key}</TableCell>
                    <TableCell className="text-right font-mono">{a.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>

          {/* SEKSI ESSAY */}
          <section>
            <h3 className="font-bold text-lg mb-3 text-orange-700">II. Essay (Koreksi Manual)</h3>
            <div className="space-y-4">
              {essayAnswers.map((a: any) => (
                <div key={a.id} className="p-4 border rounded-lg bg-slate-50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-sm">Soal No. {a.number}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Skor:</span>
                      <Input
                        type="number"
                        className="w-20 bg-white"
                        defaultValue={a.score}
                        onChange={(e) => setEssayScores({...essayScores, [a.id]: e.target.value})}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Kunci: {a.answer_key}</p>
                  <div className="p-3 bg-white border rounded text-sm italic whitespace-pre-wrap">
                    {a.answer_text || "Tidak menjawab"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
             <div>
                <p className="text-sm text-blue-600">Total Nilai Akhir</p>
                <h2 className="text-3xl font-black text-blue-800">{student.total_score}</h2>
             </div>
             <Button size="lg" onClick={handleSaveAll}>Simpan Seluruh Koreksi</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
