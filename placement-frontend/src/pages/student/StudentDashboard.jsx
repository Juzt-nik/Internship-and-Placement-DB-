import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getStudent, getApplications } from '../../services/api';
import StudentLayout from './StudentLayout';
import { Spinner } from '../../components/UI';
import { ClipboardList, Award, Briefcase, AlertCircle, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.student_id) { setLoading(false); return; }
      try {
        const [sRes, aRes] = await Promise.all([
          getStudent(user.student_id),
          getApplications().catch(() => ({ data: [] }))
        ]);
        setStudentData(sRes.data);
        setApplications(aRes.data || []);
        // Update local name for sidebar
        if (sRes.data?.name) updateUser({ name: sRes.data.name });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.student_id]);

  if (loading) return <StudentLayout><Spinner /></StudentLayout>;

  const isProfileIncomplete = !studentData?.name || !studentData?.department || !studentData?.cgpa;
  const myApps = applications.filter(a => a.student_id === user?.student_id);
  const placed = myApps.some(a => a.status === 'Selected');
  const greeting = () => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening'; };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0d1b2a] to-[#1a3a5c] rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{greeting()}, {studentData?.name?.split(' ')[0] || user?.username?.split('@')[0]}! 👋</h1>
          <p className="text-blue-200 mt-1 text-sm">
            {studentData?.register_number} · {studentData?.department || 'Profile incomplete'}
          </p>
          {placed && (
            <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-1.5">
              <Award size={14} className="text-green-400" />
              <span className="text-green-300 text-sm font-medium">🎉 Congratulations! You've been placed!</span>
            </div>
          )}
        </div>

        {/* Profile incomplete warning */}
        {isProfileIncomplete && (
          <div
            onClick={() => navigate('/student/profile')}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-amber-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800">Complete your profile</p>
              <p className="text-amber-600 text-sm">Add your name, department, CGPA, skills and resume link to be visible to recruiters.</p>
            </div>
            <ChevronRight size={18} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Applications', value: myApps.length, icon: ClipboardList, color: 'blue', bg: 'bg-blue-50' },
            { label: 'Shortlisted', value: myApps.filter(a => a.status === 'In Process').length, icon: Clock, color: 'orange', bg: 'bg-orange-50' },
            { label: 'Selected', value: myApps.filter(a => a.status === 'Selected').length, icon: CheckCircle2, color: 'green', bg: 'bg-green-50' },
            { label: 'CGPA', value: studentData?.cgpa || '—', icon: Award, color: 'purple', bg: 'bg-purple-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-white`}>
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${color}-600`} />
              </div>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Profile snapshot */}
        {studentData && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Profile Snapshot</h3>
              <button onClick={() => navigate('/student/profile')} className="text-blue-600 text-sm font-medium hover:underline">Edit Profile →</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Full Name', value: studentData.name },
                { label: 'Department', value: studentData.department },
                { label: 'Year', value: studentData.year_of_study ? `Year ${studentData.year_of_study}` : null },
                { label: 'CGPA', value: studentData.cgpa },
                { label: 'Phone', value: studentData.phone },
                { label: 'Skills', value: studentData.skill_set },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-slate-700 mt-0.5">{value || <span className="text-slate-300 italic">Not set</span>}</p>
                </div>
              ))}
            </div>
            {studentData.resume_link && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <a href={studentData.resume_link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline">
                  📄 View Resume
                </a>
              </div>
            )}
          </div>
        )}

        {/* Recent applications */}
        {myApps.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Recent Applications</h3>
              <button onClick={() => navigate('/student/applications')} className="text-blue-600 text-sm font-medium hover:underline">View all →</button>
            </div>
            <div className="divide-y divide-slate-50">
              {myApps.slice(0, 4).map(app => (
                <div key={app.application_id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{app.organization_name || 'Company'}</p>
                    <p className="text-xs text-slate-400">{app.role_title || 'Role'} · Round {app.current_round || 0}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'In Process' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{app.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
