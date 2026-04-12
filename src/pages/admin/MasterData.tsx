import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Plus, Save, Edit, Trash2, Settings, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { api } from '@/lib/api';

export default function MasterData() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Data Master</h1>
        <p className="text-slate-500 mt-2">Kelola data murid, mata pelajaran, dan ujian.</p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="students">Murid</TabsTrigger>
          <TabsTrigger value="subjects">Mata Pelajaran</TabsTrigger>
          <TabsTrigger value="exams">Ujian</TabsTrigger>
          <TabsTrigger value="users">Petugas (Staff)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-6">
          <StudentManager />
        </TabsContent>
        
        <TabsContent value="subjects" className="mt-6">
          <SubjectManager />
        </TabsContent>
        
        <TabsContent value="exams" className="mt-6">
          <ExamManager />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StudentManager() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.getStudents();
      setStudents(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const parsedStudents = results.data.filter((r: any) => r.id && r.name).map((r: any) => ({
          id: r.id,
          name: r.name,
          class: r.class || ''
        }));
        
        if (parsedStudents.length > 0) {
          await api.bulkUploadStudents(parsedStudents);
          loadStudents();
        }
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus murid ini?')) {
      await api.deleteStudent(id);
      loadStudents();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;
    await api.updateStudent(editingStudent.id, { name: editingStudent.name, class: editingStudent.class });
    setEditingStudent(null);
    loadStudents();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Data Murid</CardTitle>
          <CardDescription>Daftar murid yang terdaftar dalam sistem.</CardDescription>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
            />
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Murid</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kelas</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : students.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-500">Belum ada data murid</TableCell></TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.class}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingStudent(s)}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Murid</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>ID Murid</Label>
                <Input value={editingStudent.id} disabled />
              </div>
              <div className="space-y-2">
                <Label>Nama</Label>
                <Input value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Input value={editingStudent.class} onChange={e => setEditingStudent({...editingStudent, class: e.target.value})} />
              </div>
              <Button className="w-full" onClick={handleSaveEdit}>Simpan Perubahan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function SubjectManager() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [editingSubject, setEditingSubject] = useState<any>(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject) return;
    await api.createSubject(newSubject);
    setNewSubject('');
    loadSubjects();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Yakin ingin menghapus mata pelajaran ini?')) {
      await api.deleteSubject(id);
      loadSubjects();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSubject) return;
    await api.updateSubject(editingSubject.id, editingSubject.name);
    setEditingSubject(null);
    loadSubjects();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Nama Mata Pelajaran</Label>
            <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="Contoh: Matematika" />
          </div>
          <Button onClick={handleAddSubject}><Plus className="w-4 h-4 mr-2" /> Tambah</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Mata Pelajaran</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nama Mata Pelajaran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditingSubject(s)}>
                      <Edit className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mata Pelajaran</DialogTitle>
          </DialogHeader>
          {editingSubject && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nama Mata Pelajaran</Label>
                <Input value={editingSubject.name} onChange={e => setEditingSubject({...editingSubject, name: e.target.value})} />
              </div>
              <Button className="w-full" onClick={handleSaveEdit}>Simpan Perubahan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExamManager() {
  const [exams, setExams] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [newExam, setNewExam] = useState({ code: '', subject_id: '', title: '', pdf_url: '', duration_minutes: 120 });
  const [editingExam, setEditingExam] = useState<any>(null);
  const [managingQuestionsFor, setManagingQuestionsFor] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [newQuestion, setNewQuestion] = useState({ number: 1, type: 'PG', answer_key: 'A', weight: 1 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [exData, subData] = await Promise.all([
        api.getExams(),
        api.getSubjects()
      ]);
      setExams(exData);
      setSubjects(subData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExam = async () => {
    if (!newExam.code || !newExam.subject_id || !newExam.title || !newExam.pdf_url) return;
    await api.createExam({ ...newExam, subject_id: parseInt(newExam.subject_id) });
    setNewExam({ code: '', subject_id: '', title: '', pdf_url: '', duration_minutes: 120 });
    loadData();
  };

  const handleDeleteExam = async (id: number) => {
    if (confirm('Yakin ingin menghapus ujian ini?')) {
      await api.deleteExam(id);
      loadData();
    }
  };

  const handleSaveEditExam = async () => {
    if (!editingExam) return;
    await api.updateExam(editingExam.id, { ...editingExam, subject_id: parseInt(editingExam.subject_id) });
    setEditingExam(null);
    loadData();
  };

  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'cbt_preset'); // User needs to configure this in Cloudinary
      
      // Use auto/upload to let Cloudinary handle it, but we'll instruct the user to allow PDF delivery
      const res = await fetch('https://api.cloudinary.com/v1_1/dgn69p24o/auto/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        if (isEdit) {
          setEditingExam({...editingExam, pdf_url: data.secure_url});
        } else {
          setNewExam({...newExam, pdf_url: data.secure_url});
        }
      } else {
        alert('Upload gagal. Pastikan upload preset "cbt_preset" sudah disetting Unsigned di Cloudinary.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat upload.');
    }
    setUploading(false);
  };

  const openQuestionManager = async (exam: any) => {
    setManagingQuestionsFor(exam);
    loadQuestions(exam.id);
  };

  const loadQuestions = async (examId: number) => {
    const data = await api.getExamQuestions(examId);
    setQuestions(data);
    setNewQuestion({ number: data.length + 1, type: 'PG', answer_key: 'A', weight: 1 });
  };

  const handleSaveQuestion = async () => {
    await api.saveExamQuestion(managingQuestionsFor.id, newQuestion);
    loadQuestions(managingQuestionsFor.id);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('Hapus soal ini?')) {
      await api.deleteExamQuestion(id);
      loadQuestions(managingQuestionsFor.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Buat Ujian Baru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kode Ujian</Label>
              <Input value={newExam.code} onChange={e => setNewExam({...newExam, code: e.target.value})} placeholder="MTK-01" />
            </div>
            <div className="space-y-2">
              <Label>Mata Pelajaran</Label>
              <Select value={newExam.subject_id} onValueChange={v => setNewExam({...newExam, subject_id: v})}>
                <SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                <SelectContent>
                  {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Judul Ujian</Label>
              <Input value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} placeholder="Ujian Tengah Semester" />
            </div>
            <div className="space-y-2">
              <Label>Durasi (Menit)</Label>
              <Input type="number" value={newExam.duration_minutes} onChange={e => setNewExam({...newExam, duration_minutes: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>URL PDF Soal</Label>
              <div className="flex gap-2">
                <Input value={newExam.pdf_url} onChange={e => setNewExam({...newExam, pdf_url: e.target.value})} placeholder="https://..." className="flex-1" />
                <div className="relative">
                  <Input 
                    type="file" 
                    accept="application/pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={e => handleCloudinaryUpload(e, false)}
                    disabled={uploading}
                  />
                  <Button variant="outline" disabled={uploading}>
                    {uploading ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" /> Upload PDF</>}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500">Upload PDF ke Cloudinary (Pastikan preset "cbt_preset" aktif) atau paste URL langsung.</p>
            </div>
          </div>
          <Button onClick={handleAddExam} className="w-full"><Save className="w-4 h-4 mr-2" /> Simpan Ujian</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Ujian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.code}</TableCell>
                    <TableCell>{e.title}</TableCell>
                    <TableCell>{e.duration_minutes} mnt</TableCell>
                    <TableCell>{e.is_active ? 'Aktif' : 'Nonaktif'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openQuestionManager(e)}>
                        <FileText className="w-4 h-4 mr-2" /> Kelola Soal
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingExam({...e, subject_id: e.subject_id.toString()})}>
                        <Edit className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteExam(e.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editingExam} onOpenChange={(open) => !open && setEditingExam(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ujian</DialogTitle>
          </DialogHeader>
          {editingExam && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Kode Ujian</Label>
                <Input value={editingExam.code} onChange={e => setEditingExam({...editingExam, code: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Mata Pelajaran</Label>
                <Select value={editingExam.subject_id} onValueChange={v => setEditingExam({...editingExam, subject_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Pilih Mapel" /></SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Judul Ujian</Label>
                <Input value={editingExam.title} onChange={e => setEditingExam({...editingExam, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Durasi (Menit)</Label>
                <Input type="number" value={editingExam.duration_minutes} onChange={e => setEditingExam({...editingExam, duration_minutes: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>URL PDF Soal</Label>
                <div className="flex gap-2">
                  <Input value={editingExam.pdf_url} onChange={e => setEditingExam({...editingExam, pdf_url: e.target.value})} className="flex-1" />
                  <div className="relative">
                    <Input 
                      type="file" 
                      accept="application/pdf" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={e => handleCloudinaryUpload(e, true)}
                      disabled={uploading}
                    />
                    <Button variant="outline" disabled={uploading}>
                      {uploading ? '...' : <Upload className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={handleSaveEditExam}>Simpan Perubahan</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Questions Dialog */}
      <Dialog open={!!managingQuestionsFor} onOpenChange={(open) => !open && setManagingQuestionsFor(null)}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Soal & Kunci Jawaban</DialogTitle>
            <DialogDescription>Ujian: {managingQuestionsFor?.title}</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="md:col-span-1 space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200 h-fit">
              <h3 className="font-medium text-slate-900">Tambah/Edit Soal</h3>
              <div className="space-y-2">
                <Label>Nomor Soal</Label>
                <Input type="number" value={newQuestion.number} onChange={e => setNewQuestion({...newQuestion, number: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Tipe Soal</Label>
                <Select value={newQuestion.type} onValueChange={v => setNewQuestion({...newQuestion, type: v, answer_key: v === 'PG' ? 'A' : ''})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PG">Pilihan Ganda</SelectItem>
                    <SelectItem value="ESSAY">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kunci Jawaban</Label>
                {newQuestion.type === 'PG' ? (
                  <Select value={newQuestion.answer_key} onValueChange={v => setNewQuestion({...newQuestion, answer_key: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['A', 'B', 'C', 'D', 'E'].map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={newQuestion.answer_key} onChange={e => setNewQuestion({...newQuestion, answer_key: e.target.value})} placeholder="Kata kunci essay..." />
                )}
              </div>
              <div className="space-y-2">
                <Label>Bobot Nilai</Label>
                <Input type="number" value={newQuestion.weight} onChange={e => setNewQuestion({...newQuestion, weight: parseInt(e.target.value)})} />
              </div>
              <Button className="w-full" onClick={handleSaveQuestion}>Simpan Soal</Button>
            </div>

            <div className="md:col-span-2 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kunci</TableHead>
                    <TableHead>Bobot</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-slate-500">Belum ada soal</TableCell></TableRow>
                  ) : (
                    questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.number}</TableCell>
                        <TableCell>{q.type}</TableCell>
                        <TableCell>{q.answer_key}</TableCell>
                        <TableCell>{q.weight}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => setNewQuestion({ number: q.number, type: q.type, answer_key: q.answer_key, weight: q.weight })}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteQuestion(q.id)}>
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'proctor' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus petugas ini?')) {
      await api.deleteUser(id);
      loadUsers();
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    await api.updateUser(editingUser.id, { username: editingUser.username, password: editingUser.password, role: editingUser.role });
    setEditingUser(null);
    loadUsers();
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return;
    await api.addUser(newUser);
    setNewUser({ username: '', password: '', role: 'proctor' });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tambah Petugas Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>Username</Label>
              <Input value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} placeholder="Username" />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Password</Label>
              <Input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} placeholder="Password" />
            </div>
            <div className="space-y-2 flex-1">
              <Label>Peran</Label>
              <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="proctor">Pengawas</SelectItem>
                  <SelectItem value="grader">Korektor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tambah
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Petugas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-slate-500">Belum ada petugas</TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell className="text-right">
                      <Dialog open={editingUser?.id === u.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setEditingUser(u)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Petugas</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Username</Label>
                              <Input value={editingUser?.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <Label>Password (Kosongkan jika tidak ingin diubah)</Label>
                              <Input type="password" placeholder="Password baru" onChange={e => setEditingUser({...editingUser, password: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <Label>Peran</Label>
                              <Select value={editingUser?.role || ''} onValueChange={v => setEditingUser({...editingUser, role: v})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="proctor">Pengawas</SelectItem>
                                  <SelectItem value="grader">Korektor</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button onClick={handleSaveEdit} className="w-full">Simpan Perubahan</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
