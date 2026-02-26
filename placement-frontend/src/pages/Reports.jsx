import React, { useState, useEffect } from 'react';
import { getDashboard, getOrganizations } from '../services/api';
import { Card, Button, Select, Spinner, StatCard } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Users, Award, Briefcase, Filter } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function Reports() {
  const [report, setReport] = useState(null);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: '', cgpa_min: '', cgpa_max: '', organization_id: '', type: '' });

  useEffect(() => {
    getOrganizations().then(r => setOrgs(r.data)).catch(() => {});
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

  const handleFilter = (e) => {
    e.preventDefault();
    loadReport(filters);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm mt-0.5">Placement and internship insights</p>
      </div>

      {/* Filters */}
      <Card title="Filters" action={<Filter size={16} className="text-slate-400" />}>
        <form onSubmit={handleFilter} className="px-6 pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Year of Study</label>
              <Select value={filters.year} onChange={e => setFilters({ ...filters, year: e.target.value })}>
                <option value="">All Years</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Min CGPA</label>
              <Select value={filters.cgpa_min} onChange={e => setFilters({ ...filters, cgpa_min: e.target.value })}>
                <option value="">Any</option>
                {['6', '6.5', '7', '7.5', '8', '8.5', '9'].map(v => <option key={v} value={v}>≥ {v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Max CGPA</label>
              <Select value={filters.cgpa_max} onChange={e => setFilters({ ...filters, cgpa_max: e.target.value })}>
                <option value="">Any</option>
                {['7', '7.5', '8', '8.5', '9', '9.5', '10'].map(v => <option key={v} value={v}>≤ {v}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Organization</label>
              <Select value={filters.organization_id} onChange={e => setFilters({ ...filters, organization_id: e.target.value })}>
                <option value="">All</option>
                {orgs.map(o => <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Type</label>
              <Select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All</option>
                <option value="Placement">Placement</option>
                <option value="Internship">Internship</option>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit"><Filter size={14} /> Apply Filters</Button>
            <Button variant="secondary" type="button" onClick={() => { setFilters({ year: '', cgpa_min: '', cgpa_max: '', organization_id: '', type: '' }); loadReport({ year: '', cgpa_min: '', cgpa_max: '', organization_id: '', type: '' }); }}>Clear</Button>
          </div>
        </form>
      </Card>

      {loading ? <Spinner /> : report ? (
        <>
          {/* Summary Stats */}
          {report.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Students Placed" value={report.summary.totalPlaced || 0} icon={Award} color="green" />
              <StatCard label="Total Internships" value={report.summary.totalInternships || 0} icon={Briefcase} color="blue" />
              <StatCard label="Total Placements" value={report.summary.totalPlacements || 0} icon={TrendingUp} color="purple" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Applications by Stage */}
            {report.studentsByStage?.length > 0 && (
              <Card title="Applications by Status">
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={report.studentsByStage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {report.studentsByStage.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Internship vs Placement */}
            {report.internshipVsPlacementRatio?.length > 0 && (
              <Card title="Internship vs Placement Ratio">
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={report.internshipVsPlacementRatio} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                        {report.internshipVsPlacementRatio.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Placement by Org */}
            {report.placementByOrganization?.length > 0 && (
              <Card title="Placements by Organization">
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={report.placementByOrganization.slice(0, 8)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <YAxis dataKey="organization_name" type="category" width={100} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Placement by Year */}
            {report.placementByYear?.length > 0 && (
              <Card title="Placements by Year of Study">
                <div className="p-5">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={report.placementByYear}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={v => `Year ${v}`} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f8fafc', fontSize: 12 }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}
          </div>

          {/* Internship Stats */}
          {report.internshipStats?.length > 0 && (
            <Card title="Internship Application Stages">
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {report.internshipStats.map((s, i) => (
                    <div key={s.status} className="text-center p-4 rounded-xl" style={{ background: `${COLORS[i]}15` }}>
                      <p className="text-2xl font-bold" style={{ color: COLORS[i] }}>{s.count}</p>
                      <p className="text-xs text-slate-500 mt-1">{s.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-slate-400">No data available</div>
      )}
    </div>
  );
}
