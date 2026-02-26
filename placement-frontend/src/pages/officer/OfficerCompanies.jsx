import React, { useState, useEffect } from 'react';
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '../../services/api';
import OfficerLayout from './OfficerLayout';
import { Spinner } from '../../components/UI';
import { Plus, Edit, Trash2, Building2, Search, Calendar, MapPin, Phone } from 'lucide-react';

const emptyForm = {
  organization_name: '', organization_type: '', location: '', contact_details: '',
  // These are extra UI-only fields for placement drive dates (stored in contact_details JSON or notes)
  drive_opening_date: '', drive_closing_date: '', website: '',
};

const ORG_TYPES = ['Corporate', 'Academic', 'Research', 'Government', 'Startup'];
const typeColor = { Corporate: 'bg-blue-100 text-blue-700', Startup: 'bg-orange-100 text-orange-700', Academic: 'bg-purple-100 text-purple-700', Research: 'bg-indigo-100 text-indigo-700', Government: 'bg-green-100 text-green-700' };

export default function OfficerCompanies() {
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await getOrganizations(); setOrgs(r.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const f = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  // Pack extra fields into contact_details as JSON so they persist to DB
  const packForm = (formData) => {
    let contact = formData.contact_details;
    try {
      const extra = {};
      if (formData.drive_opening_date) extra.drive_opening_date = formData.drive_opening_date;
      if (formData.drive_closing_date) extra.drive_closing_date = formData.drive_closing_date;
      if (formData.website) extra.website = formData.website;
      if (Object.keys(extra).length) {
        // Append as JSON tag if contact has no JSON
        const existing = {};
        try { Object.assign(existing, JSON.parse(contact)); contact = null; } catch {}
        contact = JSON.stringify({ ...existing, _raw: formData.contact_details, ...extra });
      }
    } catch {}
    return { organization_name: formData.organization_name, organization_type: formData.organization_type, location: formData.location, contact_details: contact || formData.contact_details };
  };

  const unpackOrg = (org) => {
    let extra = {};
    try { const parsed = JSON.parse(org.contact_details); extra = parsed; org = { ...org, contact_details: parsed._raw || org.contact_details }; } catch {}
    return { ...org, drive_opening_date: extra.drive_opening_date || '', drive_closing_date: extra.drive_closing_date || '', website: extra.website || '' };
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await createOrganization(packForm(form)); setShowModal(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try { await updateOrganization(selected.organization_id, packForm(form)); setEditModal(false); load(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this company? This cannot be undone.')) return;
    try { await deleteOrganization(id); load(); } catch { alert('Failed to delete'); }
  };

  const openEdit = (org) => {
    const unpacked = unpackOrg(org);
    setSelected(org);
    setForm({ organization_name: unpacked.organization_name, organization_type: unpacked.organization_type, location: unpacked.location, contact_details: unpacked.contact_details, drive_opening_date: unpacked.drive_opening_date, drive_closing_date: unpacked.drive_closing_date, website: unpacked.website });
    setError(''); setEditModal(true);
  };

  const filtered = orgs.filter(o =>
    (typeFilter === 'all' || o.organization_type === typeFilter) &&
    ((o.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
     (o.location || '').toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <OfficerLayout><Spinner /></OfficerLayout>;

  const CompanyForm = ({ onSubmit, label }) => (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Basic info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Company Name <span className="text-red-500">*</span></label>
          <input value={form.organization_name} onChange={f('organization_name')} required
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="e.g. Tata Consultancy Services" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Company Type <span className="text-red-500">*</span></label>
          <select value={form.organization_type} onChange={f('organization_type')} required
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all">
            <option value="">Select type</option>
            {ORG_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Location <span className="text-red-500">*</span></label>
          <input value={form.location} onChange={f('location')} required
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="Chennai, Tamil Nadu" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Details <span className="text-red-500">*</span></label>
          <input value={form.contact_details} onChange={f('contact_details')} required
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="hr@company.com or phone" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Website</label>
          <input type="url" value={form.website} onChange={f('website')}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            placeholder="https://company.com" />
        </div>
      </div>

      {/* Placement drive dates */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
          <Calendar size={12} /> Placement Drive Window
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Opening Date</label>
            <input type="date" value={form.drive_opening_date} onChange={f('drive_opening_date')}
              className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Closing Date</label>
            <input type="date" value={form.drive_closing_date} onChange={f('drive_closing_date')}
              className="w-full px-3 py-2.5 bg-white border border-emerald-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => { setShowModal(false); setEditModal(false); }}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-all">Cancel</button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Companies</h1>
            <p className="text-slate-500 text-sm mt-1">{orgs.length} registered companies</p>
          </div>
          <button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <Plus size={16} /> Add Company
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setTypeFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
            {ORG_TYPES.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Company grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <Building2 size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No companies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(org => {
              const unpacked = unpackOrg(org);
              const now = new Date();
              const opening = unpacked.drive_opening_date ? new Date(unpacked.drive_opening_date) : null;
              const closing = unpacked.drive_closing_date ? new Date(unpacked.drive_closing_date) : null;
              const driveStatus = !opening ? null : closing && now > closing ? 'Closed' : opening && now < opening ? 'Upcoming' : 'Open';

              return (
                <div key={org.organization_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-bold shrink-0">
                        {(org.organization_name || 'C').charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{org.organization_name}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[org.organization_type] || 'bg-slate-100 text-slate-600'}`}>
                          {org.organization_type}
                        </span>
                      </div>
                    </div>
                    {driveStatus && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${driveStatus === 'Open' ? 'bg-green-100 text-green-700' : driveStatus === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                        {driveStatus}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5"><MapPin size={11} />{org.location}</div>
                    <div className="flex items-center gap-1.5"><Phone size={11} />{unpacked.contact_details || '—'}</div>
                    {(opening || closing) && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <Calendar size={11} />
                        {opening ? new Date(opening).toLocaleDateString('en-IN', {day:'2-digit',month:'short'}) : '?'}
                        {' → '}
                        {closing ? new Date(closing).toLocaleDateString('en-IN', {day:'2-digit',month:'short'}) : '?'}
                      </div>
                    )}
                    {unpacked.website && (
                      <a href={unpacked.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">🌐 {unpacked.website.replace('https://', '').slice(0, 30)}</a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1 border-t border-slate-50">
                    <button onClick={() => openEdit(org)} className="flex-1 text-xs font-medium py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all flex items-center justify-center gap-1.5">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDelete(org.organization_id)} className="flex-1 text-xs font-medium py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all flex items-center justify-center gap-1.5">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {(showModal || editModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); setEditModal(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">{showModal ? 'Register Company' : 'Edit Company'}</h2>
              <button onClick={() => { setShowModal(false); setEditModal(false); }} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
            <div className="p-6">
              <CompanyForm onSubmit={showModal ? handleCreate : handleEdit} label={showModal ? 'Register Company' : 'Save Changes'} />
            </div>
          </div>
        </div>
      )}
    </OfficerLayout>
  );
}
