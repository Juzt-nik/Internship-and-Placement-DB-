import React, { useState, useEffect } from 'react';
import { getDashboard, getOrganizations } from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line
} from 'recharts';
import { Filter } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function OfficerReports() {
  const [report, setReport] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: '', cgpa_min: '', cgpa_max: '', organization_id: '', type: '' });

  useEffect(() => {
    getOrganizations().then(r => setOrgs(r.data || [])).catch(() => {});
    loadReport();
  }, []);

  const loadReport = async (f = filters) => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
      const res = await getDashboard(clean);
      setReport(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const applyFilters = () => loadReport(filters);
  const clearFilters = () => {
    const empty = { year: '', cgpa_min: '', cgpa_max: '', organization_id: '', type: '' };
    setFilters(empty);
    loadReport(empty);
  };

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Placement Reports</h1>
          <p className="text-slate-500 text-sm mt-1">Dynamic analytics — filter by year, CGPA, company or type</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
            <Filter size={12} /> Filters
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Year', field: 'year', options: [['','All Years'],['1','Y1'],['2','Y2'],['3','Y3'],['4','Y4']] },
              { label: 'Min CGPA', field: 'cgpa_min', options: [['','Any'],...['6','6.5','7','7.5','8','8.5','9'].map(v=>[v,`≥${v}`])] },
              { label: 'Max CGPA', field: 'cgpa_max', options: [['','Any'],...['7','7.5','8','8.5','9','9.5','10'].map(v=>[v,`≤${v}`])] },
              { label: 'Company', field: 'organization_id', options: [['','All'],...orgs.map(o=>[String(o.organization_id),o.organization_name])] },
              { label: 'Type', field: 'type', options: [['','All'],['Placement','Placement'],['Internship','Internship']] },
            ].map(({ label, field, options }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                <select value={filters[field]} onChange={e => setFilters(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
                  {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={applyFilters} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
              <Filter size={14} /> Apply
            </button>
            <button onClick={clearFilters} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl transition-all">
              Clear
            </button>
          </div>
        </div>

        {loading ? <Spinner /> : report ? (
          <>
            {/* Summary */}
            {report.summary && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  ['Placed', report.summary.totalPlaced||0, 'emerald'],
                  ['Internships', report.summary.totalInternships||0, 'blue'],
                  ['Total Drives', report.summary.totalPlacements||0, 'purple'],
                ].map(([label,value,color]) => (
                  <div key={label} className={`bg-${color}-50 rounded-2xl p-5 border border-white`}>
                    <p className={`text-3xl font-bold text-${color}-700`}>{value}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {report.studentsByStage?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">Application Pipeline</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={report.studentsByStage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background:'#1e293b',border:'none',borderRadius:8,color:'#f8fafc',fontSize:12 }} />
                      <Bar dataKey="count" radius={[6,6,0,0]}>
                        {report.studentsByStage.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {report.internshipVsPlacementRatio?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">Internship vs Placement</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={report.internshipVsPlacementRatio} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={3}>
                        {report.internshipVsPlacementRatio.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background:'#1e293b',border:'none',borderRadius:8,color:'#f8fafc',fontSize:12 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {report.placementByOrganization?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">Top Recruiters</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={report.placementByOrganization.slice(0,8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize:11,fill:'#94a3b8' }} />
                      <YAxis dataKey="organization_name" type="category" width={90} tick={{ fontSize:10,fill:'#94a3b8' }} />
                      <Tooltip contentStyle={{ background:'#1e293b',border:'none',borderRadius:8,color:'#f8fafc',fontSize:12 }} />
                      <Bar dataKey="count" fill="#10b981" radius={[0,6,6,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {report.placementByYear?.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-800 mb-4">Distribution by Year</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={report.placementByYear}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize:12,fill:'#94a3b8' }} tickFormatter={v => `Year ${v}`} />
                      <YAxis tick={{ fontSize:11,fill:'#94a3b8' }} />
                      <Tooltip contentStyle={{ background:'#1e293b',border:'none',borderRadius:8,color:'#f8fafc',fontSize:12 }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-400">No report data available</div>
        )}
      </div>
    </OfficerLayout>
  );
}
