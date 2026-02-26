import React, { useState, useEffect } from 'react';
import { getStudents, createStudent, updateStudent, deleteStudent, verifyStudent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Button, Modal, FormField, Input, Select, StatusBadge, Spinner, SearchInput, EmptyState, Badge } from '../components/UI';
import { Plus, Edit, Trash2, CheckCircle, Users, Copy } from 'lucide-react';

const emptyForm = {
  register_number: '', name: '', email: '', phone: '',
  department: '', year_of_study: '', cgpa: '',
  resume_link: '', skill_set: '',
};

export default function Students() {
  const { user, canManage, isAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [tokenModal, setTokenModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const res = await createStudent({ register_number: form.register_number, email: form.email });
      setShowModal(false);
      setForm(emptyForm);
      setTokenModal(res.data.registration_token);
      load();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to create student');
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await updateStudent(selected.student_id, form);
      setEditModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    try { await deleteStudent(id); load(); } catch (e) { alert('Failed to delete'); }
  };

  const handleVerify = async (id) => {
    try { await verifyStudent(id); load(); } catch (e) { alert('Failed to verify'); }
  };

  const openEdit = (s) => {
    setSelected(s);
    setForm({
      register_number: s.register_number || '',
      name: s.name || '', email: s.email || '', phone: s.phone || '',
      department: s.department || '', year_of_study: s.year_of_study || '',
      cgpa: s.cgpa || '', resume_link: s.resume_link || '', skill_set: s.skill_set || '',
    });
    setError('');
    setEditModal(true);
  };

  const filtered = students.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.register_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = canManage() || ['faculty', 'hod'].includes(user?.role);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle={`${students.length} registered students`}
        action={
          canManage() && (
            <Button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }} icon={Plus}>
              <Plus size={16} /> Add Student
            </Button>
          )
        }
      />

      <Card>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." />
          <div className="flex gap-2 text-xs text-slate-500">
            <Badge color="green">{students.filter(s => s.profile_status === 'Verified').length} Verified</Badge>
            <Badge color="orange">{students.filter(s => s.profile_status === 'Submitted').length} Pending</Badge>
            <Badge color="blue">{students.filter(s => s.placement_status === 'Placed').length} Placed</Badge>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No students found" description="Try adjusting your search" />
        ) : (
          <Table headers={['Student', 'Register No', 'Dept / Year', 'CGPA', 'Profile', 'Placement', 'Actions']}>
            {filtered.map(s => (
              <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(s.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{s.name || <span className="text-slate-400 italic">Not set</span>}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 font-mono">{s.register_number}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{s.department || '—'} {s.year_of_study ? `· Y${s.year_of_study}` : ''}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700">{s.cgpa || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={s.profile_status || 'Pending'} /></td>
                <td className="px-4 py-3"><StatusBadge status={s.placement_status || 'Unplaced'} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {canEdit && (
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)} title="Edit">
                        <Edit size={14} />
                      </Button>
                    )}
                    {canEdit && s.profile_status === 'Submitted' && (
                      <Button variant="success" size="sm" onClick={() => handleVerify(s.student_id)} title="Verify">
                        <CheckCircle size={14} />
                      </Button>
                    )}
                    {isAdmin() && (
                      <Button variant="danger" size="sm" onClick={() => handleDelete(s.student_id)} title="Delete">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Student">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Register Number" required>
              <Input value={form.register_number} onChange={e => setForm({ ...form, register_number: e.target.value })} placeholder="e.g. RA2111003010123" required />
            </FormField>
            <FormField label="Email" required>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@srmist.edu.in" required />
            </FormField>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm">
            A registration token will be generated. Share it with the student to complete their profile.
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Student</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Student" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name">
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
            </FormField>
            <FormField label="Email">
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </FormField>
            <FormField label="Phone">
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9999999999" />
            </FormField>
            <FormField label="Department">
              <Select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML'].map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </FormField>
            <FormField label="Year of Study">
              <Select value={form.year_of_study} onChange={e => setForm({ ...form, year_of_study: e.target.value })}>
                <option value="">Select year</option>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </Select>
            </FormField>
            <FormField label="CGPA">
              <Input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} placeholder="8.5" />
            </FormField>
          </div>
          <FormField label="Resume Link">
            <Input type="url" value={form.resume_link} onChange={e => setForm({ ...form, resume_link: e.target.value })} placeholder="https://drive.google.com/..." />
          </FormField>
          <FormField label="Skills">
            <Input value={form.skill_set} onChange={e => setForm({ ...form, skill_set: e.target.value })} placeholder="React, Node.js, Python..." />
          </FormField>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Token Modal */}
      <Modal isOpen={!!tokenModal} onClose={() => setTokenModal(null)} title="Registration Token Generated">
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
            Student shell created! Share this token with the student so they can activate their account.
          </div>
          <div className="bg-slate-900 rounded-xl p-4 flex items-center justify-between gap-3">
            <code className="text-green-400 text-sm break-all font-mono">{tokenModal}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(tokenModal); }}
              className="shrink-0 text-slate-400 hover:text-white transition-colors"
              title="Copy"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="text-slate-500 text-xs">The student should go to <strong className="text-slate-700">/activate</strong> and enter this token to set their password.</p>
          <div className="flex justify-end">
            <Button onClick={() => setTokenModal(null)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
