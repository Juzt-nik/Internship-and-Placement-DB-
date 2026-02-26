import React, { useState, useEffect } from 'react';
import { getPlacements, createPlacement, getStudents, getOrganizations } from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import { Plus, Search, Award, TrendingUp } from 'lucide-react';

const OFFER_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship-to-PPO'];

export default function OfficerPlacements() {
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ student_id: '', organization_id: '', job_role: '', package_lpa: '', offer_type: 'Full-time', offer_date: '', joining_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [pR, sR, oR] = await Promise.all([getPlacements(), getStudents(), getOrganizations()]);
      setPlacements(pR.data || []); setStudents(sR.data || []); setOrgs(oR.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createPlacement({ ...form, student_id: parseInt(form.student_id), organization_id: parseInt(form.organization_id), package_lpa: parseFloat(form.package_lpa) });
      setShowModal(false);
      setForm({ student_id: '', organization_id: '', job_role: '', package_lpa: '', offer_type: 'Full-time', offer_date: '', joining_date: '' });
      load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to record placement'); }
    finally { setSaving(false); }
  };

  const filtered = placements.filter(p =>
    (p.student_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.organization_name||'').toLowerCase().includes(search.toLowerCase()) ||
    (p.job_role||'').toLowerCase().includes(search.toLowerCase())
  );

  const avgPkg = placements.length > 0 ? (placements.reduce((s, p) => s + parseFloat(p.package_lpa||0), 0) / placements.length).toFixed(1) : 0;
  const maxPkg = placements.length > 0 ? Math.max(...placements.map(p => parseFloat(p.package_lpa||0))).toFixed(1) : 0;

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  return (
    <OfficerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Placements</h1>
            <p className="text-slate-500 text-sm mt-1">{placements.length} placement records</p>
          </div>
          <button onClick={() => { setShowModal(true); setError(''); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <Plus size={16} /> Record Placement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ['Total Placed', placements.length, 'emerald'],
            ['Avg Package', `${avgPkg} LPA`, 'blue'],
            ['Highest Package', `${maxPkg} LPA`, 'purple'],
          ].map(([label, value, color]) => (
            <div key={label} className={`bg-${color}-50 rounded-2xl p-5 border border-white`}>
              <p className={`text-2xl font-bold text-${color}-700`}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search placements..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Award size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No placement records yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Student', 'Company', 'Role', 'Package', 'Type', 'Offer Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.placement_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(p.student_name||'S').charAt(0)}
                        </div>
                        <p className="font-medium text-slate-800 text-sm">{p.student_name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.organization_name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.job_role}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold text-sm">{p.package_lpa} LPA</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{p.offer_type}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{p.offer_date ? new Date(p.offer_date).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Record Placement</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Student *</label>
                  <select value={form.student_id} onChange={f('student_id')} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name||s.email} ({s.register_number})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company *</label>
                  <select value={form.organization_id} onChange={f('organization_id')} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    <option value="">Select company</option>
                    {orgs.map(o => <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Job Role *</label>
                  <input value={form.job_role} onChange={f('job_role')} required placeholder="e.g. Software Engineer" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Package (LPA) *</label>
                  <input type="number" step="0.01" min="0" value={form.package_lpa} onChange={f('package_lpa')} required placeholder="e.g. 7.5" className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Offer Type</label>
                  <select value={form.offer_type} onChange={f('offer_type')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 transition-all">
                    {OFFER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Offer Date</label>
                  <input type="date" value={form.offer_date} onChange={f('offer_date')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Joining Date</label>
                  <input type="date" value={form.joining_date} onChange={f('joining_date')} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>
              {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Record Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
}
