import React, { useState, useEffect } from 'react';
import { getStudents, getOrganizations, getApplications, getPlacements, getDashboard } from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import { Users, Building2, Award, ClipboardList, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function OfficerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], orgs: [], apps: [], placements: [], report: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sR, oR, aR, pR, rR] = await Promise.all([
          getStudents(), getOrganizations(),
          getApplications().catch(() => ({ data: [] })),
          getPlacements().catch(() => ({ data: [] })),
          getDashboard().catch(() => ({ data: null })),
        ]);
        setData({ students: sR.data||[], orgs: oR.data||[], apps: aR.data||[], placements: pR.data||[], report: rR.data });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  const { students, orgs, apps, placements, report } = data;
  const placed = students.filter(s => s.placement_status === 'Placed').length;
  const avgPkg = placements.length > 0 ? (placements.reduce((s, p) => s + parseFloat(p.package_lpa || 0), 0) / placements.length).toFixed(1) : 0;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1f14] to-[#0d3320] rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold">Placement Officer Dashboard 🎯</h1>
          <p className="text-emerald-200 mt-1 text-sm">Manage students, companies, and placement drives</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Students', value: students.length, icon: Users, color: 'emerald', path: '/officer/students' },
            { label: 'Companies', value: orgs.length, icon: Building2, color: 'blue', path: '/officer/companies' },
            { label: 'Applications', value: apps.length, icon: ClipboardList, color: 'orange', path: '/officer/applications' },
            { label: 'Placements', value: placed, icon: Award, color: 'green', path: '/officer/placements' },
            { label: 'Avg Package', value: `${avgPkg} LPA`, icon: TrendingUp, color: 'purple', path: '/officer/placements' },
          ].map(({ label, value, icon: Icon, color, path }) => (
            <div key={label} onClick={() => navigate(path)} className={`bg-${color}-50 rounded-2xl p-4 border border-white cursor-pointer hover:shadow-md transition-all`}>
              <div className={`w-9 h-9 bg-${color}-100 rounded-xl flex items-center justify-center mb-2`}>
                <Icon size={18} className={`text-${color}-600`} />
              </div>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {report?.studentsByStage?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-800 mb-4">Application Pipeline</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={report.studentsByStage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {report.studentsByStage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {report.placementByOrganization?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-semibold text-slate-800 mb-4">Top Recruiters</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={report.placementByOrganization.slice(0,6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis dataKey="organization_name" type="category" width={85} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                    <Bar dataKey="count" fill="#10b981" radius={[0,6,6,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Recent applications */}
        {apps.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Recent Applications</h3>
              <button onClick={() => navigate('/officer/applications')} className="text-emerald-600 text-sm font-medium hover:underline">Manage →</button>
            </div>
            <div className="divide-y divide-slate-50">
              {apps.slice(0, 6).map(a => (
                <div key={a.application_id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{a.student_name}</p>
                    <p className="text-xs text-slate-400">{a.organization_name} · {a.role_title} · Round {a.current_round || 0}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    a.status === 'Selected' ? 'bg-green-100 text-green-700' :
                    a.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    a.status === 'In Process' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </OfficerLayout>
  );
}
