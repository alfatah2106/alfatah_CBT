/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import MasterData from './pages/admin/MasterData';
import Reports from './pages/admin/Reports';
import StudentLogin from './pages/student/Login';
import Exam from './pages/student/Exam';
import ProctorDashboard from './pages/proctor/ProctorDashboard';
import GraderDashboard from './pages/grader/GraderDashboard';
import StaffLogin from './pages/StaffLogin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="master" element={<MasterData />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/exam" element={<Exam />} />

        {/* Proctor Routes */}
        <Route path="/proctor" element={<ProctorDashboard />} />

        {/* Grader Routes */}
        <Route path="/grader" element={<GraderDashboard />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
