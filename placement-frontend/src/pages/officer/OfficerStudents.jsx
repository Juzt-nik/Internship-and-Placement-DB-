import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent } from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import { Plus, Trash2, Search, Users, Copy, CheckCircle, ExternalLink } from 'lucide-react';

export default function OfficerStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ register_number: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tokenModal, setTokenModal] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await getStudents(); setStudents(r.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await createStudent({ register_number: form.register_number, email: form.email });
      setShowModal(false);
      setForm({ register_number: '', email: '' });
      setTokenModal({ token: res.data.registration_token, email: form.email, reg: form.register_number });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create student');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student record? This cannot be undone.')) return;
    try { await deleteStudent(id); load(); } catch { alert('Failed to delete'); }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(tokenModal.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = students.filter(s =>
    (s.name||'').toLowerCase().includes(search.toLowerCase()) ||
    (s.register_number||'').toLowerCase().includes(search.toLowerCase()) ||
    (s.email||'').toLowerCase().includes(search.toLowerCase()) ||
    (s.department||'').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Students</h1>
            <p className="text-slate-500 text-sm mt-1">{students.length} registered students</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setForm({ register_number: '', email: '' }); setError(''); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} /> Add Student
          </button>
        </div>

        {/* Stats chips */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Total', students.length, 'slate'],
            ['Verified', students.filter(s => s.profile_status === 'Verified').length, 'green'],
            ['Placed', students.filter(s => s.placement_status === 'Placed').length, 'emerald'],
          ].map(([label, count, color]) => (
            <div key={label} className={`bg-${color}-50 rounded-2xl p-4 border border-white`}>
              <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search + table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Users size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Student', 'Register No', 'Dept / Year', 'CGPA', 'Profile', 'Placement', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(s => (
                    <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {(s.name||'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{s.name || <span className="text-slate-400 italic">Not set</span>}</p>
                            <p className="text-xs text-slate-400">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{s.register_number}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{s.department || '—'}{s.year_of_study ? ` · Y${s.year_of_study}` : ''}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">{s.cgpa || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          s.profile_status === 'Verified' ? 'bg-green-100 text-green-700' :
                          s.profile_status === 'Submitted' ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-500'}`}>
                          {s.profile_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.placement_status === 'Placed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {s.placement_status || 'Unplaced'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDelete(s.student_id)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Add New Student</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Register Number <span className="text-red-500">*</span></label>
                <input value={form.register_number} onChange={e => setForm(p => ({ ...p, register_number: e.target.value }))} required placeholder="e.g. RA2111003010001"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="student@srmist.edu.in"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-sm text-emerald-700">
                💡 A unique registration token will be generated. Share it with the student to activate their account at <strong>/activate</strong>.
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Token Modal */}
      {tokenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 text-center mb-1">Student Created!</h2>
              <p className="text-slate-500 text-sm text-center mb-6">
                Share this registration token with <strong>{tokenModal.email}</strong>
              </p>
              <div className="bg-[#0d1b2a] rounded-xl p-4 flex items-center gap-3 mb-4">
                <code className="text-emerald-400 text-sm break-all font-mono flex-1">{tokenModal.token}</code>
                <button onClick={copyToken} className={`shrink-0 p-2 rounded-lg transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 mb-5 space-y-1">
                <p>📌 <strong>Student instructions:</strong></p>
                <p>1. Go to <code className="bg-blue-100 px-1 rounded">/activate</code> on the portal</p>
                <p>2. Paste the token above</p>
                <p>3. Set their password</p>
                <p>4. Wait for faculty verification</p>
              </div>
              <button onClick={() => setTokenModal(null)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
}
