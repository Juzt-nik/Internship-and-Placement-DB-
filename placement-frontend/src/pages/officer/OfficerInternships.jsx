import React, { useState, useEffect } from 'react';
import { getInternships, createInternship, updateInternship, deleteInternship, getStudents, getOrganizations } from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import { Plus, Edit, Trash2, Search, Briefcase } from 'lucide-react';

const MODES = ['Remote', 'On-site', 'Hybrid'];
const STATUSES = ['Ongoing', 'Completed', 'Upcoming'];
const emptyForm = { student_id: '', organization_id: '', internship_domain: '', duration_months: '', stipend: '', start_date: '', end_date: '', mode: 'On-site', internship_status: 'Ongoing', certificate_submitted: false };

const statusColor = { Ongoing: 'bg-blue-100 text-blue-700', Completed: 'bg-green-100 text-green-700', Upcoming: 'bg-orange-100 text-orange-700' };

export default function OfficerInternships() {
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [iR, sR, oR] = await Promise.all([getInternships(), getStudents(), getOrganizations()]);
      setInternships(iR.data || []); setStudents(sR.data || []); setOrgs(oR.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, student_id: parseInt(form.student_id), organization_id: parseInt(form.organization_id), duration_months: parseInt(form.duration_months), stipend: parseFloat(form.stipend)||0 };
      if (modal === 'create') await createInternship(payload);
      else await updateInternship(selected.internship_id, payload);
      setModal(null); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this internship?')) return;
    try { await deleteInternship(id); load(); } catch { alert('Failed'); }
  };

  const filtered = internships.filter(i =>
    (i.student_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (i.organization_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (i.internship_domain||'').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Internships</h1>
            <p className="text-slate-500 text-sm mt-1">{internships.length} internship records</p>
          </div>
          <button onClick={() => { setModal('create'); setForm(emptyForm); setError(''); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <Plus size={16} /> Add Internship
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student, company, domain..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No internships yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(i => (
              <div key={i.internship_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(i.organization_name||'C').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-semibold text-slate-800">{i.internship_domain}</p>
                      <p className="text-sm text-slate-500">{i.organization_name} · <span className="font-medium">{i.student_name}</span></p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor[i.internship_status]||'bg-slate-100 text-slate-600'}`}>{i.internship_status}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                    <span>{i.duration_months} months</span>
                    <span>₹{Number(i.stipend||0).toLocaleString()}/mo</span>
                    <span>{i.mode}</span>
                    {i.certificate_submitted && <span className="text-green-600 font-medium">✓ Certificate</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setSelected(i); setForm({ student_id: i.student_id, organization_id: i.organization_id, internship_domain: i.internship_domain, duration_months: i.duration_months, stipend: i.stipend, start_date: i.start_date?.split('T')[0]||'', end_date: i.end_date?.split('T')[0]||'', mode: i.mode, internship_status: i.internship_status, certificate_submitted: i.certificate_submitted }); setModal('edit'); setError(''); }}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><Edit size={15} /></button>
                  <button onClick={() => handleDelete(i.internship_id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white">
              <h2 className="text-lg font-bold text-slate-800">{modal === 'create' ? 'Add Internship' : 'Edit Internship'}</h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student *</label>
                  <select value={form.student_id} onChange={f('student_id')} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name||s.email} ({s.register_number})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Organization *</label>
                  <select value={form.organization_id} onChange={f('organization_id')} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    <option value="">Select organization</option>
                    {orgs.map(o => <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Domain *</label>
                  <input value={form.internship_domain} onChange={f('internship_domain')} required placeholder="e.g. Full Stack Development" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Duration (months) *</label>
                  <input type="number" min="1" max="24" value={form.duration_months} onChange={f('duration_months')} required placeholder="e.g. 3" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Stipend (₹/month)</label>
                  <input type="number" min="0" value={form.stipend} onChange={f('stipend')} placeholder="0" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date</label>
                  <input type="date" value={form.start_date} onChange={f('start_date')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date</label>
                  <input type="date" value={form.end_date} onChange={f('end_date')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mode *</label>
                  <select value={form.mode} onChange={f('mode')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    {MODES.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status *</label>
                  <select value={form.internship_status} onChange={f('internship_status')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="cert" checked={form.certificate_submitted} onChange={f('certificate_submitted')} className="w-4 h-4 text-emerald-600 rounded" />
                  <label htmlFor="cert" className="text-sm text-slate-700">Certificate Submitted</label>
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {modal === 'create' ? 'Add Internship' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
}
