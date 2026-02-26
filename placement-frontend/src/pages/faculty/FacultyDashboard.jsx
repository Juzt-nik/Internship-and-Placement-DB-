import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudents, getApplications, getDashboard, getPlacements } from '../../services/api';
import FacultyLayout from './FacultyLayout';
import { Spinner } from '../../components/UI';
import { Users, CheckCircle, AlertCircle, Award, ChevronRight, TrendingUp, BookOpen, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#8b5cf6','#10b981','#f59e0b','#ef4444','#3b82f6'];

export default function FacultyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students,     setStudents]     = useState([]);
  const [applications, setApplications] = useState([]);
  const [placements,   setPlacements]   = useState([]);
  const [report,       setReport]       = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, aRes, pRes, rRes] = await Promise.all([
          getStudents(),
          getApplications().catch(() => ({ data: [] })),
          getPlacements().catch(()  => ({ data: [] })),
          getDashboard().catch(()   => ({ data: null })),
        ]);
        setStudents(sRes.data || []);
        setApplications(aRes.data || []);
        setPlacements(pRes.data || []);
        setReport(rRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <FacultyLayout><Spinner /></FacultyLayout>;

  const pending  = students.filter(s => s.profile_status === 'Submitted');
  const verified = students.filter(s => s.profile_status === 'Verified');
  const placed   = students.filter(s => s.placement_status === 'Placed');
  const avgCGPA  = students.length
    ? (students.reduce((sum, s) => sum + parseFloat(s.cgpa || 0), 0) / students.filter(s => s.cgpa).length).toFixed(2)
    : '—';

  const deptStats = students.reduce((acc, s) => {
    if (s.department) acc[s.department] = (acc[s.department] || 0) + 1;
    return acc;
  }, {});
  const deptData = Object.entries(deptStats).map(([dept, count]) => ({ dept, count }));

  const appStatusData = [
    { status: 'Applied',    count: applications.filter(a => a.status === 'Applied').length },
    { status: 'In Process', count: applications.filter(a => a.status === 'In Process').length },
    { status: 'Selected',   count: applications.filter(a => a.status === 'Selected').length },
    { status: 'Rejected',   count: applications.filter(a => a.status === 'Rejected').length },
  ].filter(d => d.count > 0);

  const avgPkg = placements.length
    ? (placements.reduce((s, p) => s + parseFloat(p.package_lpa || 0), 0) / placements.length).toFixed(1)
    : 0;
  const maxPkg = placements.length
    ? Math.max(...placements.map(p => parseFloat(p.package_lpa || 0))).toFixed(1)
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <FacultyLayout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#1a0533] to-[#2d1058] rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">{greeting()}, {user?.username?.split('@')[0]} 👋</h1>
          <p className="text-purple-200 mt-1 text-sm">
            {user?.role === 'hod' ? 'Head of Department' : 'Faculty'} · {user?.username}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {pending.length > 0 && (
              <button
                onClick={() => navigate('/faculty/students')}
                className="flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 hover:bg-orange-500/30 rounded-xl px-4 py-2 text-orange-300 text-sm font-medium transition-all"
              >
                <AlertCircle size={14} />
                {pending.length} student{pending.length > 1 ? 's' : ''} pending verification
                <ChevronRight size={14} />
              </button>
            )}
            {pending.length === 0 && (
              <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 text-green-300 text-sm">
                <CheckCircle size={14} /> All student profiles reviewed ✓
              </div>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: students.length,    icon: Users,      color: 'purple', bg: 'bg-purple-50',  path: '/faculty/students' },
            { label: 'Pending Verify', value: pending.length,     icon: AlertCircle,color: 'orange', bg: 'bg-orange-50',  path: '/faculty/students' },
            { label: 'Verified',       value: verified.length,    icon: CheckCircle,color: 'green',  bg: 'bg-green-50',   path: '/faculty/students' },
            { label: 'Placed',         value: placed.length,      icon: Award,      color: 'blue',   bg: 'bg-blue-50',    path: '/faculty/reports'  },
          ].map(({ label, value, icon: Icon, color, bg, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className={`${bg} rounded-2xl p-5 text-left border border-white hover:shadow-md transition-all group`}>
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${color}-600`} />
              </div>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            </button>
          ))}
        </div>

        {/* Placement stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Avg Package', value: `${avgPkg} LPA`, icon: TrendingUp,  color: 'indigo' },
            { label: 'Highest Package', value: `${maxPkg} LPA`, icon: Award,   color: 'emerald' },
            { label: 'Avg CGPA', value: avgCGPA, icon: BookOpen, color: 'pink' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-${color}-50 rounded-2xl p-5 border border-white`}>
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={`text-${color}-600`} />
              </div>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Dept distribution */}
          {deptData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-purple-500" /> Students by Department
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background:'#1e293b', border:'none', borderRadius:8, color:'#f8fafc', fontSize:12 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* App status */}
          {appStatusData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-purple-500" /> Application Status
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={appStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75}
                    label={({ status, count }) => `${status}: ${count}`} labelLine={false}>
                    {appStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background:'#1e293b', border:'none', borderRadius:8, color:'#f8fafc', fontSize:12 }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pending verifications quick list */}
        {pending.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">⏳ Pending Verifications</h3>
              <button onClick={() => navigate('/faculty/students')}
                className="text-purple-600 text-sm font-medium hover:underline">
                Go to Students →
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {pending.slice(0, 5).map(s => (
                <div key={s.student_id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {(s.name || 'S').charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.name || 'Profile Incomplete'}</p>
                      <p className="text-xs text-slate-400">{s.register_number} · {s.department}</p>
                    </div>
                  </div>
                  <span className="text-xs text-orange-600 font-semibold bg-orange-50 px-2.5 py-1 rounded-full">
                    Awaiting Verification
                  </span>
                </div>
              ))}
              {pending.length > 5 && (
                <div className="px-6 py-3 text-center text-sm text-slate-400">
                  +{pending.length - 5} more students pending
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
