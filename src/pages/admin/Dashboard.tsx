import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText } from 'lucide-react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, subjects: 0, activeExams: 0 });

  useEffect(() => {
    api.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">Ringkasan sistem CBT Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Murid" value={stats.students.toString()} icon={<Users className="w-6 h-6 text-blue-600" />} />
        <StatCard title="Mata Pelajaran" value={stats.subjects.toString()} icon={<BookOpen className="w-6 h-6 text-emerald-600" />} />
        <StatCard title="Ujian Aktif" value={stats.activeExams.toString()} icon={<FileText className="w-6 h-6 text-amber-600" />} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value}</div>
      </CardContent>
    </Card>
  );
}
