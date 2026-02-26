import React, { useState, useEffect } from 'react';
import { getInternships, createInternship, updateInternship, deleteInternship, getStudents, getOrganizations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Button, Modal, FormField, Input, Select, StatusBadge, Spinner, SearchInput, EmptyState } from '../components/UI';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';

const emptyForm = {
  student_id: '', organization_id: '', internship_domain: '',
  start_date: '', end_date: '', duration_months: '',
  mode: 'Online', stipend: '', internship_status: 'Ongoing', certificate_submitted: 0
};

export default function Internships() {
  const { canManage, isAdmin } = useAuth();
  const [internships, setInternships] = useState([]);
  const [students, setStudents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [iRes, sRes, oRes] = await Promise.all([getInternships(), getStudents(), getOrganizations()]);
      setInternships(iRes.data); setStudents(sRes.data); setOrgs(oRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createInternship(form);
      setShowModal(false); setForm(emptyForm); load();
    } catch (err) { setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateInternship(selected.internship_id, form);
      setEditModal(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete internship?')) return;
    try { await deleteInternship(id); load(); } catch (e) { alert('Failed'); }
  };

  const openEdit = (i) => {
    setSelected(i);
    setForm({
      student_id: i.student_id, organization_id: i.organization_id,
      internship_domain: i.internship_domain, start_date: i.start_date?.split('T')[0] || '',
      end_date: i.end_date?.split('T')[0] || '', duration_months: i.duration_months,
      mode: i.mode, stipend: i.stipend, internship_status: i.internship_status,
      certificate_submitted: i.certificate_submitted
    });
    setError(''); setEditModal(true);
  };

  const filtered = internships.filter(i =>
    (i.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.internship_domain || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  const InternshipForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Student" required>
          <Select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} required>
            <option value="">Select student</option>
            {students.map(s => <option key={s.student_id} value={s.student_id}>{s.name || s.register_number}</option>)}
          </Select>
        </FormField>
        <FormField label="Organization" required>
          <Select value={form.organization_id} onChange={e => setForm({ ...form, organization_id: e.target.value })} required>
            <option value="">Select organization</option>
            {orgs.map(o => <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>)}
          </Select>
        </FormField>
        <FormField label="Domain" required>
          <Input value={form.internship_domain} onChange={e => setForm({ ...form, internship_domain: e.target.value })} placeholder="e.g. Web Development" required />
        </FormField>
        <FormField label="Mode">
          <Select value={form.mode} onChange={e => setForm({ ...form, mode: e.target.value })}>
            {['Online', 'Offline', 'Hybrid'].map(m => <option key={m}>{m}</option>)}
          </Select>
        </FormField>
        <FormField label="Start Date" required>
          <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} required />
        </FormField>
        <FormField label="End Date" required>
          <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} required />
        </FormField>
        <FormField label="Duration (months)" required>
          <Input type="number" min="1" value={form.duration_months} onChange={e => setForm({ ...form, duration_months: e.target.value })} required />
        </FormField>
        <FormField label="Stipend (₹/month)">
          <Input type="number" min="0" value={form.stipend} onChange={e => setForm({ ...form, stipend: e.target.value })} placeholder="0" />
        </FormField>
        <FormField label="Status">
          <Select value={form.internship_status} onChange={e => setForm({ ...form, internship_status: e.target.value })}>
            {['Ongoing', 'Completed', 'Terminated'].map(s => <option key={s}>{s}</option>)}
          </Select>
        </FormField>
        <FormField label="Certificate Submitted">
          <Select value={form.certificate_submitted} onChange={e => setForm({ ...form, certificate_submitted: parseInt(e.target.value) })}>
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </Select>
        </FormField>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" type="button" onClick={() => { setShowModal(false); setEditModal(false); }}>Cancel</Button>
        <Button type="submit" loading={saving}>{submitLabel}</Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Internships"
        subtitle={`${internships.length} internship records`}
        action={canManage() && <Button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}><Plus size={16} /> Add Internship</Button>}
      />

      <Card>
        <div className="px-6 py-4 border-b border-slate-100">
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search internships..." />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Briefcase} title="No internships found" />
        ) : (
          <Table headers={['Student', 'Organization', 'Domain', 'Duration', 'Mode', 'Stipend', 'Status', 'Actions']}>
            {filtered.map(i => (
              <tr key={i.internship_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{i.student_name || `#${i.student_id}`}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{i.organization_name}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{i.internship_domain}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{i.duration_months}m</td>
                <td className="px-4 py-3 text-sm text-slate-500">{i.mode}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-700">₹{Number(i.stipend || 0).toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={i.internship_status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {canManage() && <Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Edit size={14} /></Button>}
                    {isAdmin() && <Button variant="danger" size="sm" onClick={() => handleDelete(i.internship_id)}><Trash2 size={14} /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Internship" size="lg">
        <InternshipForm onSubmit={handleCreate} submitLabel="Add Internship" />
      </Modal>

      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Internship" size="lg">
        <InternshipForm onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>
    </div>
  );
}
