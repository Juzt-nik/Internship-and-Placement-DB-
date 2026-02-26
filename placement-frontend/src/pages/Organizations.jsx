import React, { useState, useEffect } from 'react';
import { getOrganizations, createOrganization, updateOrganization, deleteOrganization } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Button, Modal, FormField, Input, Select, Spinner, SearchInput, EmptyState, Badge } from '../components/UI';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';

const emptyForm = { organization_name: '', organization_type: '', location: '', contact_details: '' };

export default function Organizations() {
  const { canManage, isAdmin } = useAuth();
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
    try { const res = await getOrganizations(); setOrgs(res.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createOrganization(form);
      setShowModal(false); setForm(emptyForm); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateOrganization(selected.organization_id, form);
      setEditModal(false); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete organization?')) return;
    try { await deleteOrganization(id); load(); } catch (e) { alert('Failed'); }
  };

  const openEdit = (o) => {
    setSelected(o);
    setForm({ organization_name: o.organization_name, organization_type: o.organization_type, location: o.location, contact_details: o.contact_details });
    setError(''); setEditModal(true);
  };

  const filtered = orgs.filter(o =>
    (o.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.location || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.organization_type || '').toLowerCase().includes(search.toLowerCase())
  );

  const typeColor = { Corporate: 'blue', Startup: 'orange', Academic: 'purple', Research: 'indigo', Government: 'green' };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organizations"
        subtitle={`${orgs.length} organizations`}
        action={
          canManage() && (
            <Button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}>
              <Plus size={16} /> Add Organization
            </Button>
          )
        }
      />

      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations..." />
          <div className="flex gap-2 flex-wrap">
            {['Corporate', 'Startup', 'Academic', 'Research', 'Government'].map(t => (
              <Badge key={t} color={typeColor[t]}>{orgs.filter(o => o.organization_type === t).length} {t}</Badge>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Building2} title="No organizations found" />
        ) : (
          <Table headers={['Organization', 'Type', 'Location', 'Contact', 'Actions']}>
            {filtered.map(o => (
              <tr key={o.organization_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {(o.organization_name || 'O').charAt(0)}
                    </div>
                    <p className="font-medium text-slate-800 text-sm">{o.organization_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge color={typeColor[o.organization_type] || 'gray'}>{o.organization_type}</Badge></td>
                <td className="px-4 py-3 text-sm text-slate-600">{o.location}</td>
                <td className="px-4 py-3 text-sm text-slate-500 max-w-xs truncate">{o.contact_details}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {canManage() && <Button variant="ghost" size="sm" onClick={() => openEdit(o)}><Edit size={14} /></Button>}
                    {isAdmin() && <Button variant="danger" size="sm" onClick={() => handleDelete(o.organization_id)}><Trash2 size={14} /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Organization">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Organization Name" required>
            <Input value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })} placeholder="e.g. TCS, Infosys" required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type" required>
              <Select value={form.organization_type} onChange={e => setForm({ ...form, organization_type: e.target.value })} required>
                <option value="">Select type</option>
                {['Corporate', 'Academic', 'Research', 'Government', 'Startup'].map(t => <option key={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Location" required>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, State" required />
            </FormField>
          </div>
          <FormField label="Contact Details" required>
            <Input value={form.contact_details} onChange={e => setForm({ ...form, contact_details: e.target.value })} placeholder="email or phone" required />
          </FormField>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Organization</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Organization">
        <form onSubmit={handleEdit} className="space-y-4">
          <FormField label="Organization Name"><Input value={form.organization_name} onChange={e => setForm({ ...form, organization_name: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <Select value={form.organization_type} onChange={e => setForm({ ...form, organization_type: e.target.value })}>
                {['Corporate', 'Academic', 'Research', 'Government', 'Startup'].map(t => <option key={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Location"><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></FormField>
          </div>
          <FormField label="Contact"><Input value={form.contact_details} onChange={e => setForm({ ...form, contact_details: e.target.value })} /></FormField>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
