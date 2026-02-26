import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboard, getStudents, getApplications, getPlacements } from '../services/api';
import { StatCard, Card, Spinner, StatusBadge } from '../components/UI';
import { Users, Award, Briefcase, ClipboardList, TrendingUp, Building2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const proms = [getStudents(), getApplications().catch(() => ({ data: [] })), getPlacements().catch(() => ({ data: [] }))];
        const isStaff = ['admin', 'placement_officer', 'faculty', 'hod'].includes(user?.role);
        if (isStaff) proms.push(getDashboard());
        const results = await Promise.allSettled(proms);
        setStudents(results[0].value?.data || []);
        setApplications(results[1].value?.data || []);
        setPlacements(results[2].value?.data || []);
        if (isStaff && results[3]?.value) setReport(results[3].value.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const isStaff = ['admin', 'placement_officer', 'faculty', 'hod'].includes(user?.role);
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) return <Spinner />;

  const placed = students.filter(s => s.placement_status === 'Placed').length;
  const recentApps = applications.slice(0, 5);
  const recentPlacements = placements.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d1b2a] to-[#1a3a5c] rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{greeting()}, {user?.username?.split('@')[0]}! 👋</h1>
          <p className="text-blue-200 mt-1 text-sm">
            {isStaff ? `Managing ${students.length} students · ${applications.length} applications` : 'Here\'s your placement overview'}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-blue-200 text-xs uppercase tracking-wider">Today</p>
          <p className="text-white font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={students.length} icon={Users} color="blue" />
        <StatCard label="Applications" value={applications.length} icon={ClipboardList} color="indigo" />
        <StatCard label="Placed Students" value={placed} icon={Award} color="green" />
        <StatCard label="Placements" value={placements.length} icon={TrendingUp} color="purple" />
      </div>

      {/* Charts row - staff only */}
      {isStaff && report && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Application Status Chart */}
          {report.studentsByStage?.length > 0 && (
            <Card title="Applications by Status">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.studentsByStage} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Pie chart */}
          {report.internshipVsPlacementRatio?.length > 0 && (
            <Card title="Internship vs Placement">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={report.internshipVsPlacementRatio} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, count }) => `${type}: ${count}`} labelLine={false}>
                      {report.internshipVsPlacementRatio.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Top orgs */}
          {report.placementByOrganization?.length > 0 && (
            <Card title="Top Recruiting Organizations">
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.placementByOrganization.slice(0, 6)} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis dataKey="organization_name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={90} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Summary stats */}
          {report.summary && (
            <Card title="Placement Summary">
              <div className="p-4 space-y-4">
                {[
                  { label: 'Total Placed Students', value: report.summary.totalPlaced, color: 'text-green-600' },
                  { label: 'Total Internships', value: report.summary.totalInternships, color: 'text-blue-600' },
                  { label: 'Total Placements', value: report.summary.totalPlacements, color: 'text-purple-600' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 text-sm">{label}</span>
                    <span className={`font-bold text-xl ${color}`}>{value ?? 0}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Recent tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Applications */}
        <Card title="Recent Applications" action={
          <a href="/applications" className="text-blue-600 text-xs font-medium hover:underline">View all →</a>
        }>
          {recentApps.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">No applications yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentApps.map(app => (
                <div key={app.application_id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{app.student_name || `Student #${app.student_id}`}</p>
                    <p className="text-xs text-slate-400">{app.organization_name || 'Unknown Org'} · {app.role_title || 'N/A'}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Placements */}
        <Card title="Recent Placements" action={
          <a href="/placements" className="text-blue-600 text-xs font-medium hover:underline">View all →</a>
        }>
          {recentPlacements.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-400 text-sm">No placements recorded</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentPlacements.map(p => (
                <div key={p.placement_id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.student_name || `Student #${p.student_id}`}</p>
                    <p className="text-xs text-slate-400">{p.organization_name} · {p.job_role}</p>
                  </div>
                  <span className="text-green-600 font-semibold text-sm">{p.package_lpa} LPA</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
