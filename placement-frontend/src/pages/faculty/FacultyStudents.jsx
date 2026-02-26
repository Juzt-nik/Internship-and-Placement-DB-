import React, { useState, useEffect } from 'react';
import { getStudents, verifyStudent, getApplications } from '../../services/api';
import FacultyLayout from './FacultyLayout';
import { Spinner } from '../../components/UI';
import RoundTracker from '../../components/RoundTracker';
import { CheckCircle, Search, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, aRes] = await Promise.all([getStudents(), getApplications().catch(() => ({ data: [] }))]);
      setStudents(sRes.data || []);
      setApplications(aRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleVerify = async (id, e) => {
    e.stopPropagation();
    setVerifying(id);
    try { await verifyStudent(id); load(); } catch { alert('Verification failed'); }
    finally { setVerifying(null); }
  };

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = (s.name||'').toLowerCase().includes(q) ||
      (s.register_number||'').toLowerCase().includes(q) ||
      (s.email||'').toLowerCase().includes(q) ||
      (s.department||'').toLowerCase().includes(q);
    const matchFilter = filter === 'all' || s.profile_status === filter || s.placement_status === filter;
    return matchSearch && matchFilter;
  });

  const getStudentApps = (id) => applications.filter(a => a.student_id === id);

  if (loading) return <FacultyLayout><Spinner /></FacultyLayout>;

  return (
    <FacultyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 text-sm mt-1">Review profiles, verify students and track placement progress</p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, reg. no, dept..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              ['all','All',students.length],
              ['Submitted','Pending Verify',students.filter(s=>s.profile_status==='Submitted').length],
              ['Verified','Verified',students.filter(s=>s.profile_status==='Verified').length],
              ['Placed','Placed',students.filter(s=>s.placement_status==='Placed').length],
            ].map(([key,label,count]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter===key ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {label} <span className="ml-1 opacity-75">({count})</span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Users size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No students found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => {
              const apps = getStudentApps(s.student_id);
              const isExpanded = expandedId === s.student_id;
              return (
                <div key={s.student_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Collapsed row */}
                  <div
                    className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : s.student_id)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {(s.name||'S').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{s.name || <span className="text-slate-400 italic font-normal">Profile incomplete</span>}</p>
                        <p className="text-xs text-slate-400 truncate">{s.register_number} · {s.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 hidden sm:block">{s.department||'—'} {s.year_of_study ? `· Y${s.year_of_study}`:''}</span>
                      {s.cgpa && <span className="text-xs font-semibold text-slate-600 hidden md:block">CGPA {s.cgpa}</span>}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        s.profile_status==='Verified' ? 'bg-green-100 text-green-700' :
                        s.profile_status==='Submitted' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'}`}>
                        {s.profile_status||'Pending'}
                      </span>
                      {s.profile_status === 'Submitted' && (
                        <button onClick={(e) => handleVerify(s.student_id, e)} disabled={verifying===s.student_id}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                          {verifying===s.student_id ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={13} />}
                          Verify
                        </button>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 space-y-6">
                      {/* Profile */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Student Details</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            ['Full Name', s.name],
                            ['Department', s.department],
                            ['Year', s.year_of_study ? `Year ${s.year_of_study}` : null],
                            ['CGPA', s.cgpa],
                            ['Phone', s.phone],
                            ['Email', s.email],
                            ['Placement Status', s.placement_status||'Unplaced'],
                            ['Skills', s.skill_set],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <p className="text-xs text-slate-400">{label}</p>
                              <p className="text-sm font-medium text-slate-700 mt-0.5">{value || <span className="text-slate-300 italic text-xs">Not set</span>}</p>
                            </div>
                          ))}
                        </div>
                        {s.resume_link && (
                          <a href={s.resume_link} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-600 text-sm mt-3 hover:underline font-medium">
                            📄 View Resume
                          </a>
                        )}
                      </div>

                      {/* Applications + Round tracker */}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                          Applications & Round Progress ({apps.length})
                        </p>
                        {apps.length === 0 ? (
                          <p className="text-sm text-slate-400 italic">No applications submitted yet</p>
                        ) : (
                          <div className="space-y-4">
                            {apps.map(app => (
                              <div key={app.application_id} className="bg-white rounded-xl border border-slate-100 p-5">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                      {(app.organization_name||'C').charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-800 text-sm">{app.organization_name}</p>
                                      <p className="text-xs text-slate-400">{app.role_title}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    app.status==='Selected' ? 'bg-green-100 text-green-700' :
                                    app.status==='Rejected' ? 'bg-red-100 text-red-700' :
                                    app.status==='In Process' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'}`}>{app.status}
                                  </span>
                                </div>
                                {/* Compact tracker */}
                                <div className="mb-4">
                                  <RoundTracker application={app} compact />
                                </div>
                                {/* Full tracker */}
                                <RoundTracker application={app} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FacultyLayout>
  );
}
