import React, { useState, useEffect } from 'react';
import { getApplications, getStudents } from '../../services/api';
import FacultyLayout from './FacultyLayout';
import { Spinner } from '../../components/UI';
import RoundTracker from '../../components/RoundTracker';
import { Search, ChevronDown, ChevronUp, Building2, Filter } from 'lucide-react';

const STATUS_STYLE = {
  Applied:      'bg-blue-100 text-blue-700',
  'In Process': 'bg-orange-100 text-orange-700',
  Selected:     'bg-green-100 text-green-700',
  Rejected:     'bg-red-100 text-red-700',
};

export default function FacultyApplications() {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          getApplications().catch(() => ({ data: [] })),
          getStudents().catch(() => ({ data: [] })),
        ]);
        setApplications(aRes.data || []);
        setStudents(sRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || (a.organization_name || '').toLowerCase().includes(q) ||
      (a.student_name || '').toLowerCase().includes(q) ||
      (a.register_number || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    inProcess: applications.filter(a => a.status === 'In Process').length,
    selected: applications.filter(a => a.status === 'Selected').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  };

  if (loading) return <FacultyLayout><Spinner /></FacultyLayout>;

  return (
    <FacultyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Application Tracker</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor all student applications and their interview round progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'slate' },
            { label: 'Applied', value: stats.applied, color: 'blue' },
            { label: 'In Process', value: stats.inProcess, color: 'orange' },
            { label: 'Selected', value: stats.selected, color: 'green' },
            { label: 'Rejected', value: stats.rejected, color: 'red' },
          ].map(({ label, value, color }) => (
            <button key={label}
              onClick={() => setStatusFilter(label === 'Total' ? 'all' : label)}
              className={`p-4 rounded-xl border text-left transition-all ${
                (statusFilter === 'all' && label === 'Total') || statusFilter === label
                  ? `bg-${color}-50 border-${color}-200`
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className={`text-xs uppercase tracking-wider mt-0.5 text-${color}-500`}>{label}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student, company..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="In Process">In Process</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Applications list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Building2 size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.application_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header row */}
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === app.application_id ? null : app.application_id)}
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                    <Building2 size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-800">{app.student_name || `Student #${app.student_id}`}</p>
                      <span className="text-slate-400 text-xs">·</span>
                      <p className="text-slate-500 text-sm">{app.register_number || ''}</p>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {app.organization_name || 'Company'} 
                      {app.role_title && <span className="text-slate-400"> · {app.role_title}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[app.status] || 'bg-slate-100 text-slate-600'}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:block">
                      Round {app.current_round || 0}
                    </span>
                    {expanded === app.application_id
                      ? <ChevronUp size={16} className="text-slate-400" />
                      : <ChevronDown size={16} className="text-slate-400" />
                    }
                  </div>
                </div>

                {/* Expanded: Round Tracker */}
                {expanded === app.application_id && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Application Progress</p>
                    <RoundTracker application={app} />
                    {/* Meta */}
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Applied On', value: app.application_date ? new Date(app.application_date).toLocaleDateString() : '—' },
                        { label: 'Type', value: app.application_type || '—' },
                        { label: 'Current Round', value: `Round ${app.current_round || 0}` },
                        { label: 'Total Rounds', value: app.rounds?.length || 0 },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-xs text-slate-400">{label}</p>
                          <p className="text-sm font-medium text-slate-700 mt-0.5">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
