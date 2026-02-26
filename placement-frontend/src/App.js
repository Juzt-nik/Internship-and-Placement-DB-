import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth pages
import Login from './pages/Login';
import Activate from './pages/Activate';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentOpportunities from './pages/student/StudentOpportunities';
import StudentApplications from './pages/student/StudentApplications';

// Faculty pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyReports from './pages/faculty/FacultyReports';
import FacultyApplications from './pages/faculty/FacultyApplications';
import FacultyProfile from './pages/faculty/FacultyProfile';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerStudents from './pages/officer/OfficerStudents';
import OfficerCompanies from './pages/officer/OfficerCompanies';
import OfficerJobListings from './pages/officer/OfficerJobListings';
import OfficerInternships from './pages/officer/OfficerInternships';
import OfficerApplications from './pages/officer/OfficerApplications';
import OfficerPlacements from './pages/officer/OfficerPlacements';
import OfficerReports from './pages/officer/OfficerReports';
import OfficerProfile from './pages/officer/OfficerProfile';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'faculty' || user.role === 'hod') return <Navigate to="/faculty/dashboard" replace />;
  if (user.role === 'placement_officer' || user.role === 'admin') return <Navigate to="/officer/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/activate" element={<Activate />} />
          <Route path="/" element={<HomeRedirect />} />

          {/* Student */}
          <Route path="/student/dashboard" element={<Guard roles={['student']}><StudentDashboard /></Guard>} />
          <Route path="/student/profile" element={<Guard roles={['student']}><StudentProfile /></Guard>} />
          <Route path="/student/opportunities" element={<Guard roles={['student']}><StudentOpportunities /></Guard>} />
          <Route path="/student/applications" element={<Guard roles={['student']}><StudentApplications /></Guard>} />

          {/* Faculty */}
          <Route path="/faculty/dashboard" element={<Guard roles={['faculty','hod']}><FacultyDashboard /></Guard>} />
          <Route path="/faculty/students" element={<Guard roles={['faculty','hod']}><FacultyStudents /></Guard>} />
          <Route path="/faculty/applications" element={<Guard roles={['faculty','hod']}><FacultyApplications /></Guard>} />
          <Route path="/faculty/reports" element={<Guard roles={['faculty','hod']}><FacultyReports /></Guard>} />
          <Route path="/faculty/profile" element={<Guard roles={['faculty','hod']}><FacultyProfile /></Guard>} />

          {/* Officer */}
          <Route path="/officer/dashboard" element={<Guard roles={['placement_officer','admin']}><OfficerDashboard /></Guard>} />
          <Route path="/officer/students" element={<Guard roles={['placement_officer','admin']}><OfficerStudents /></Guard>} />
          <Route path="/officer/companies" element={<Guard roles={['placement_officer','admin']}><OfficerCompanies /></Guard>} />
          <Route path="/officer/jobs" element={<Guard roles={['placement_officer','admin']}><OfficerJobListings /></Guard>} />
          <Route path="/officer/internships" element={<Guard roles={['placement_officer','admin']}><OfficerInternships /></Guard>} />
          <Route path="/officer/applications" element={<Guard roles={['placement_officer','admin']}><OfficerApplications /></Guard>} />
          <Route path="/officer/placements" element={<Guard roles={['placement_officer','admin']}><OfficerPlacements /></Guard>} />
          <Route path="/officer/reports" element={<Guard roles={['placement_officer','admin']}><OfficerReports /></Guard>} />
          <Route path="/officer/profile" element={<Guard roles={['placement_officer','admin']}><OfficerProfile /></Guard>} />

          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
