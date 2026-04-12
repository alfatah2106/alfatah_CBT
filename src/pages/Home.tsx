import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ShieldCheck, FileCheck, Settings } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">Sistem Computer Based Test (CBT)</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Platform ujian digital yang ringan, intuitif, dan responsif. Pilih portal masuk sesuai dengan peran Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto">
        <PortalCard 
          title="Portal Murid" 
          description="Masuk untuk mengerjakan ujian" 
          icon={<GraduationCap className="h-8 w-8 text-blue-600" />} 
          href="/student/login" 
          color="bg-blue-50"
          onClick={() => navigate('/student/login')}
        />
        <PortalCard 
          title="Panel Staff" 
          description="Masuk sebagai Admin, Pengawas, atau Korektor" 
          icon={<ShieldCheck className="h-8 w-8 text-emerald-600" />} 
          href="/staff/login" 
          color="bg-emerald-50"
          onClick={() => navigate('/staff/login')}
        />
      </div>
    </div>
  );
}

function PortalCard({ title, description, icon, href, color, onClick }: { title: string, description: string, icon: React.ReactNode, href: string, color: string, onClick: () => void }) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-slate-200 cursor-pointer" onClick={onClick}>
      <CardHeader className={`${color} rounded-t-xl border-b border-slate-100 pb-6`}>
        <div className="mb-4 bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-slate-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Button className="w-full" variant="outline" onClick={(e) => { e.stopPropagation(); onClick(); }}>
          Masuk
        </Button>
      </CardContent>
    </Card>
  );
}
