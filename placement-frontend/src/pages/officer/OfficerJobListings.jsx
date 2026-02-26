import React, { useState, useEffect } from 'react';
import {
  getInternships, createInternship, updateInternship, deleteInternship,
  getOrganizations,
} from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import { Plus, Edit, Trash2, Search, Briefcase, Calendar, MapPin, DollarSign, Tag } from 'lucide-react';

const MODES   = ['Remote', 'On-site', 'Hybrid'];
const TYPES   = ['Placement', 'Internship'];
const STATUS  = ['Upcoming', 'Open', 'Closed'];
const typeColor = {
  Placement:  'bg-emerald-100 text-emerald-700',
  Internship: 'bg-blue-100 text-blue-700',
};
const statusColor = {
  Open:     'bg-green-100 text-green-700',
  Upcoming: 'bg-orange-100 text-orange-700',
  Closed:   'bg-slate-100 text-slate-500',
};

const empty = {
  organization_id: '', internship_domain: '', duration_months: '',
  stipend: '', start_date: '', end_date: '', mode: 'On-site',
  internship_status: 'Upcoming', application_deadline: '',
  job_type: 'Internship', location: '', description: '',
};

export default function OfficerJobListings() {
  const [listings, setListings] = useState([]);
  const [orgs, setOrgs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modal, setModal]       = useState(null); // 'create' | 'edit'
  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState(empty);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [lRes, oRes] = await Promise.all([getInternships(), getOrganizations()]);
      setListings(lRes.data || []);
      setOrgs(oRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      // Store job_type + description in internship_status JSON workaround
      const payload = {
        ...form,
        student_id: null, // job listing — no student yet
        internship_status: form.internship_status,
      };
      await createInternship(payload);
      setModal(null); setForm(empty); load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create listing');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateInternship(selected.internship_id, form);
      setModal(null); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this job listing?')) return;
    try { await deleteInternship(id); load(); } catch { alert('Failed to delete'); }
  };

  const openEdit = (item) => {
    setSelected(item);
    setForm({
      organization_id: item.organization_id || '',
      internship_domain: item.internship_domain || '',
      duration_months: item.duration_months || '',
      stipend: item.stipend || '',
      start_date: item.start_date ? item.start_date.split('T')[0] : '',
      end_date: item.end_date ? item.end_date.split('T')[0] : '',
      mode: item.mode || 'On-site',
      internship_status: item.internship_status || 'Upcoming',
      job_type: item.job_type || 'Internship',
      location: item.location || '',
      description: item.description || '',
      application_deadline: item.application_deadline ? item.application_deadline.split('T')[0] : '',
    });
    setError(''); setModal('edit');
  };

  const filtered = listings.filter(l => {
    const q = search.toLowerCase();
    const org = orgs.find(o => o.organization_id === l.organization_id);
    const matchSearch = !q ||
      (l.internship_domain || '').toLowerCase().includes(q) ||
      (org?.organization_name || '').toLowerCase().includes(q) ||
      (l.location || '').toLowerCase().includes(q);
    const matchType = typeFilter === 'all' || l.job_type === typeFilter || l.internship_status === typeFilter;
    return matchSearch && matchType;
  });

  const getOrg = id => orgs.find(o => o.organization_id === id);

  const now = new Date();
  const driveStatus = l => {
    if (!l.start_date) return l.internship_status || 'Upcoming';
    const start = new Date(l.start_date);
    const end   = l.end_date ? new Date(l.end_date) : null;
    if (end && now > end) return 'Closed';
    if (now < start) return 'Upcoming';
    return 'Open';
  };

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  const ListingForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Company */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Company <span className="text-red-500">*</span></label>
          <select value={form.organization_id} onChange={f('organization_id')} required
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            <option value="">Select company</option>
            {orgs.map(o => <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}
          </select>
        </div>

        {/* Role / Domain */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Role / Domain <span className="text-red-500">*</span></label>
          <input value={form.internship_domain} onChange={f('internship_domain')} required
            placeholder="e.g. Software Engineer, Data Analyst"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Listing Type</label>
          <select value={form.job_type} onChange={f('job_type')}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Mode */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Work Mode</label>
          <select value={form.mode} onChange={f('mode')}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            {MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Location</label>
          <input value={form.location} onChange={f('location')} placeholder="Chennai, Tamil Nadu"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
        </div>

        {/* Stipend / Package */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Stipend / Package</label>
          <input value={form.stipend} onChange={f('stipend')} placeholder="e.g. ₹15,000/month or 6 LPA"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Duration (months)</label>
          <input type="number" min="1" value={form.duration_months} onChange={f('duration_months')} placeholder="e.g. 6"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Drive Status</label>
          <select value={form.internship_status} onChange={f('internship_status')}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            {STATUS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Date window */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
          <Calendar size={12} /> Drive Schedule
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Opening Date</label>
            <input type="date" value={form.start_date} onChange={f('start_date')}
              className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Closing Date</label>
            <input type="date" value={form.end_date} onChange={f('end_date')}
              className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Application Deadline</label>
            <input type="date" value={form.application_deadline} onChange={f('application_deadline')}
              className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Job Description / Notes</label>
        <textarea value={form.description} onChange={f('description')} rows={3}
          placeholder="Requirements, responsibilities, eligibility criteria..."
          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none" />
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => setModal(null)}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {label}
        </button>
      </div>
    </form>
  );

  return (
    <OfficerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Job Listings</h1>
            <p className="text-slate-500 text-sm mt-1">{listings.length} placement drives &amp; internship openings</p>
          </div>
          <button onClick={() => { setForm(empty); setError(''); setModal('create'); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <Plus size={16} /> Post Listing
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', count: listings.length, color: 'slate' },
            { label: 'Open', count: listings.filter(l => driveStatus(l) === 'Open').length, color: 'green' },
            { label: 'Upcoming', count: listings.filter(l => driveStatus(l) === 'Upcoming').length, color: 'orange' },
            { label: 'Placement Drives', count: listings.filter(l => l.job_type === 'Placement').length, color: 'emerald' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`bg-${color}-50 rounded-xl border border-${color}-100 p-4`}>
              <p className={`text-2xl font-bold text-${color}-700`}>{count}</p>
              <p className={`text-xs text-${color}-500 uppercase tracking-wider mt-0.5`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles, companies..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Placement', 'Internship', 'Open', 'Upcoming', 'Closed'].map(v => (
              <button key={v} onClick={() => setTypeFilter(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  typeFilter === v ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {v === 'all' ? 'All' : v}
              </button>
            ))}
          </div>
        </div>

        {/* Listing cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No listings found</p>
            <p className="text-slate-400 text-sm mt-1">Post your first job listing using the button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => {
              const org     = getOrg(item.organization_id);
              const status  = driveStatus(item);
              const isOpen  = status === 'Open';
              return (
                <div key={item.internship_id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {(org?.organization_name || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{item.internship_domain || 'Role TBD'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{org?.organization_name || 'Company'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusColor[status] || 'bg-slate-100 text-slate-500'}`}>
                      {status}
                    </span>
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2">
                    {item.job_type && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[item.job_type] || 'bg-slate-100 text-slate-600'}`}>
                        {item.job_type}
                      </span>
                    )}
                    {item.mode && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin size={9} /> {item.mode}
                      </span>
                    )}
                    {item.stipend && (
                      <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <DollarSign size={9} /> {item.stipend}
                      </span>
                    )}
                    {item.duration_months && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {item.duration_months}m
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  {(item.start_date || item.end_date) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar size={11} className="text-emerald-500" />
                      {item.start_date ? new Date(item.start_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '?'}
                      {' → '}
                      {item.end_date ? new Date(item.end_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : 'Open-ended'}
                    </div>
                  )}
                  {item.application_deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                      <Tag size={11} /> Deadline: {new Date(item.application_deadline).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
                    </div>
                  )}

                  {/* Description snippet */}
                  {item.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-slate-50 mt-auto">
                    <button onClick={() => openEdit(item)}
                      className="flex-1 text-xs font-medium py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center justify-center gap-1.5">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(item.internship_id)}
                      className="flex-1 text-xs font-medium py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all flex items-center justify-center gap-1.5">
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {modal === 'create' ? '📋 Post New Job Listing' : '✏️ Edit Listing'}
              </h2>
              <button onClick={() => setModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">
                ✕
              </button>
            </div>
            <div className="p-6">
              <ListingForm
                onSubmit={modal === 'create' ? handleCreate : handleEdit}
                label={modal === 'create' ? 'Post Listing' : 'Save Changes'}
              />
            </div>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
}
