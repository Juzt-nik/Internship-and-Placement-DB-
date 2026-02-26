import React, { useState, useEffect } from 'react';
import {
  getApplications, createApplication, deleteApplication,
  getStudents, getOrganizations,
  addRoundToApplication, markApplicationSelected, updateRound
} from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import RoundTracker from '../../components/RoundTracker';
import { Plus, Trash2, Search, ChevronDown, ChevronUp, Award, PlusCircle } from 'lucide-react';

const ROUND_TYPES = ['Aptitude', 'Technical', 'HR', 'Group Discussion', 'Manager Round', 'Final Interview', 'Coding Test'];
const STATUS_STYLE = {
  Applied: 'bg-blue-100 text-blue-700',
  'In Process': 'bg-orange-100 text-orange-700',
  Selected: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export default function OfficerApplications() {
  const [applications, setApplications] = useState([]);
  const [students, setStudents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [roundModal, setRoundModal] = useState(null); // app_id
  const [createForm, setCreateForm] = useState({ student_id: '', organization_id: '', role_title: '', application_date: '' });
  const [roundForm, setRoundForm] = useState({ round_name: '', round_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [aRes, sRes, oRes] = await Promise.all([getApplications(), getStudents(), getOrganizations()]);
      setApplications(aRes.data || []);
      setStudents(sRes.data || []);
      setOrgs(oRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = {
        student_id: parseInt(createForm.student_id),
        organization_id: parseInt(createForm.organization_id),
        role_title: createForm.role_title,
        application_date: createForm.application_date || new Date().toISOString().split('T')[0],
      };
      await createApplication(payload);
      setCreateModal(false);
      setCreateForm({ student_id: '', organization_id: '', role_title: '', application_date: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create application');
    } finally { setSaving(false); }
  };

  const handleAddRound = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await addRoundToApplication(roundModal, { round_name: roundForm.round_name, round_date: roundForm.round_date });
      setRoundModal(null);
      setRoundForm({ round_name: '', round_date: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add round');
    } finally { setSaving(false); }
  };

  const handleMarkSelected = async (id) => {
    if (!window.confirm('Mark this student as Selected? This will update their placement status.')) return;
    try { await markApplicationSelected(id); load(); } catch { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try { await deleteApplication(id); load(); } catch { alert('Failed'); }
  };

  const handleRoundResult = async (roundId, result) => {
    try { await updateRound(roundId, { result }); load(); } catch { alert('Failed to update round'); }
  };

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = (a.student_name||'').toLowerCase().includes(q) ||
      (a.organization_name||'').toLowerCase().includes(q) ||
      (a.role_title||'').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Applications</h1>
            <p className="text-slate-500 text-sm mt-1">Manage placement applications and interview rounds</p>
          </div>
          <button onClick={() => { setCreateModal(true); setError(''); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <Plus size={16} /> New Application
          </button>
        </div>

        {/* Status stats */}
        <div className="grid grid-cols-4 gap-3">
          {[['Applied','blue'],['In Process','orange'],['Selected','green'],['Rejected','red']].map(([s,c]) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`rounded-2xl p-4 border text-left transition-all ${statusFilter === s ? `bg-${c}-100 border-${c}-300` : 'bg-white border-slate-100 hover:border-slate-200'}`}>
              <p className={`text-2xl font-bold text-${c}-700`}>{applications.filter(a => a.status === s).length}</p>
              <p className={`text-xs font-medium text-${c}-500 mt-0.5`}>{s}</p>
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, company, role..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
        </div>

        {/* Applications list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <p className="text-slate-500">No applications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(app => (
              <div key={app.application_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Row */}
                <div
                  className="px-6 py-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === app.application_id ? null : app.application_id)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(app.student_name||'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{app.student_name}</p>
                      <p className="text-xs text-slate-400 truncate">{app.organization_name} · {app.role_title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:block">R{app.current_round||0}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[app.status]||'bg-slate-100 text-slate-600'}`}>{app.status}</span>
                    {/* Quick action buttons */}
                    <button
                      onClick={e => { e.stopPropagation(); setRoundModal(app.application_id); setError(''); setRoundForm({ round_name: '', round_date: '' }); }}
                      className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                      title="Add Round"
                    >
                      <PlusCircle size={12} /> Round
                    </button>
                    {app.status !== 'Selected' && app.status !== 'Rejected' && (
                      <button
                        onClick={e => { e.stopPropagation(); handleMarkSelected(app.application_id); }}
                        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all"
                        title="Mark Selected"
                      >
                        <Award size={12} /> Select
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); handleDelete(app.application_id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={13} />
                    </button>
                    {expanded === app.application_id ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                  </div>
                </div>

                {/* Compact tracker always visible */}
                <div className="px-6 pb-3">
                  <RoundTracker application={app} compact />
                </div>

                {/* Expanded full tracker */}
                {expanded === app.application_id && (
                  <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/60">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">Full Application Timeline</p>
                    <RoundTracker application={app} />

                    {/* Round result controls */}
                    {(app.rounds||[]).length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Update Round Results</p>
                        <div className="flex flex-wrap gap-2">
                          {(app.rounds||[]).map(r => !r.result && (
                            <div key={r.round_id} className="flex items-center gap-2 bg-white rounded-xl border border-slate-100 px-3 py-2">
                              <span className="text-xs text-slate-600 font-medium">R{r.round_number}: {r.round_name}</span>
                              <button onClick={() => handleRoundResult(r.round_id, 'Cleared')}
                                className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-2 py-0.5 rounded-full transition-all">Cleared</button>
                              <button onClick={() => handleRoundResult(r.round_id, 'Eliminated')}
                                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-medium px-2 py-0.5 rounded-full transition-all">Eliminated</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-xs text-slate-400">Applied</p><p className="font-medium text-slate-700 mt-0.5">{app.application_date ? new Date(app.application_date).toLocaleDateString('en-IN') : '—'}</p></div>
                      <div><p className="text-xs text-slate-400">Student</p><p className="font-medium text-slate-700 mt-0.5">{app.student_name}</p></div>
                      <div><p className="text-xs text-slate-400">Company</p><p className="font-medium text-slate-700 mt-0.5">{app.organization_name}</p></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Application Modal */}
      {createModal && (
        <Modal title="New Application" onClose={() => setCreateModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Student <span className="text-red-500">*</span></label>
              <select value={createForm.student_id} onChange={e => setCreateForm(p => ({ ...p, student_id: e.target.value }))} required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="">Select student</option>
                {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name || s.email} ({s.register_number})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Company <span className="text-red-500">*</span></label>
              <select value={createForm.organization_id} onChange={e => setCreateForm(p => ({ ...p, organization_id: e.target.value }))} required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="">Select company</option>
                {orgs.map(o => <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Role / Position <span className="text-red-500">*</span></label>
              <input value={createForm.role_title} onChange={e => setCreateForm(p => ({ ...p, role_title: e.target.value }))} required placeholder="e.g. Software Engineer"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Application Date</label>
              <input type="date" value={createForm.application_date} onChange={e => setCreateForm(p => ({ ...p, application_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
            <ModalFooter onCancel={() => setCreateModal(false)} label="Create Application" saving={saving} />
          </form>
        </Modal>
      )}

      {/* Add Round Modal */}
      {roundModal && (
        <Modal title="Add Interview Round" onClose={() => setRoundModal(null)}>
          <form onSubmit={handleAddRound} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Round Name <span className="text-red-500">*</span></label>
              <select value={roundForm.round_name} onChange={e => setRoundForm(p => ({ ...p, round_name: e.target.value }))} required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                <option value="">Select round type</option>
                {ROUND_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Scheduled Date</label>
              <input type="date" value={roundForm.round_date} onChange={e => setRoundForm(p => ({ ...p, round_date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
            <ModalFooter onCancel={() => setRoundModal(null)} label="Add Round" saving={saving} />
          </form>
        </Modal>
      )}
    </OfficerLayout>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, label, saving }) {
  return (
    <div className="flex gap-3 pt-1">
      <button type="button" onClick={onCancel} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all">Cancel</button>
      <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
        {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
        {label}
      </button>
    </div>
  );
}
