import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, FileBarChart, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Data Master', path: '/admin/master', icon: <Database className="w-5 h-5" /> },
    { name: 'Laporan', path: '/admin/reports', icon: <FileBarChart className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Admin Panel</h2>
          <p className="text-sm text-slate-500">CBT System</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-slate-100 text-slate-900 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
