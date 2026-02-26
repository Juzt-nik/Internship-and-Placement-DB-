import React, { useState, useEffect } from 'react';
import {
  getApplications, createApplication, deleteApplication,
  addRoundToApplication, markApplicationSelected,
  updateRound, getStudents, getOrganizations
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Button, Modal, FormField, Input, Select, StatusBadge, Spinner, SearchInput, EmptyState, Badge } from '../components/UI';
import { Plus, Trash2, ClipboardList, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Applications() {
  const { user, canManage, isAdmin, isStudent } = useAuth();
  const [apps, setApps] = useState([]);
  const [students, setStudents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [roundModal, setRoundModal] = useState(null); // application_id
  const [expandedApp, setExpandedApp] = useState(null);
  const [form, setForm] = useState({ student_id: '', opportunity_id: '' });
  const [roundForm, setRoundForm] = useState({ round_number: '', round_name: '', round_date: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const proms = [getApplications()];
      if (canManage() || user?.role === 'faculty' || user?.role === 'hod') {
        proms.push(getStudents(), getOrganizations());
      }
      const results = await Promise.allSettled(proms);
      setApps(results[0].value?.data || []);
      if (results[1]) setStudents(results[1].value?.data || []);
      if (results[2]) setOrgs(results[2].value?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createApplication(form);
      setShowModal(false); setForm({ student_id: '', opportunity_id: '' }); load();
    } catch (err) { setError(err.response?.data?.error || err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAddRound = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await addRoundToApplication(roundModal, roundForm);
      setRoundModal(null); setRoundForm({ round_number: '', round_name: '', round_date: '' }); load();
    } catch (err) { setError(err.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleSelect = async (id) => {
    if (!window.confirm('Mark this applicant as selected?')) return;
    try { await markApplicationSelected(id); load(); } catch (e) { alert('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete application?')) return;
    try { await deleteApplication(id); load(); } catch (e) { alert('Failed'); }
  };

  const filtered = apps.filter(a =>
    (a.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.role_title || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  const canManageApps = canManage();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications"
        subtitle={`${apps.length} total applications`}
        action={
          isStudent() && (
            <Button onClick={() => { setShowModal(true); setError(''); }}>
              <Plus size={16} /> Apply
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Applied', color: 'blue' },
          { label: 'In Process', color: 'orange' },
          { label: 'Selected', color: 'green' },
          { label: 'Rejected', color: 'red' },
        ].map(({ label, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{apps.filter(a => a.status === label).length}</p>
          </div>
        ))}
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-100">
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No applications found" />
        ) : (
          <Table headers={['Student', 'Organization', 'Role', 'Applied', 'Round', 'Status', 'Actions']}>
            {filtered.map(a => (
              <tr key={a.application_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(a.student_name || 'S').charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{a.student_name || `#${a.student_id}`}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{a.organization_name || '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{a.role_title || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-400">{a.application_date ? new Date(a.application_date).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{a.current_round ? `Round ${a.current_round}` : '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status || 'Applied'} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {canManageApps && a.status !== 'Selected' && a.status !== 'Rejected' && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => { setRoundModal(a.application_id); setError(''); }} title="Add Round">
                          <Plus size={13} /> Round
                        </Button>
                        <Button variant="success" size="sm" onClick={() => handleSelect(a.application_id)} title="Mark Selected">
                          <CheckCircle size={13} />
                        </Button>
                      </>
                    )}
                    {isAdmin() && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(a.application_id)}><Trash2 size={13} /></Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Apply Modal (student) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for Opportunity">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-blue-700 text-sm">
            Enter your student ID and the opportunity ID to apply.
          </div>
          <FormField label="Student ID" required>
            <Input type="number" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} placeholder="Your student ID" required />
          </FormField>
          <FormField label="Opportunity ID" required>
            <Input type="number" value={form.opportunity_id} onChange={e => setForm({ ...form, opportunity_id: e.target.value })} placeholder="Opportunity ID" required />
          </FormField>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Submit Application</Button>
          </div>
        </form>
      </Modal>

      {/* Add Round Modal */}
      <Modal isOpen={!!roundModal} onClose={() => setRoundModal(null)} title="Add Interview Round">
        <form onSubmit={handleAddRound} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Round Number" required>
              <Input type="number" min="1" value={roundForm.round_number} onChange={e => setRoundForm({ ...roundForm, round_number: e.target.value })} required />
            </FormField>
            <FormField label="Round Name" required>
              <Select value={roundForm.round_name} onChange={e => setRoundForm({ ...roundForm, round_name: e.target.value })} required>
                <option value="">Select type</option>
                {['Aptitude Test', 'Technical Round', 'HR Round', 'GD Round', 'Coding Test', 'Manager Round', 'Final Interview'].map(r => <option key={r}>{r}</option>)}
              </Select>
            </FormField>
          </div>
          <FormField label="Round Date" required>
            <Input type="datetime-local" value={roundForm.round_date} onChange={e => setRoundForm({ ...roundForm, round_date: e.target.value })} required />
          </FormField>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setRoundModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Add Round</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
