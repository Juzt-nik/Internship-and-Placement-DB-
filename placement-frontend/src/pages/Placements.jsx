import React, { useState, useEffect } from 'react';
import { getPlacements, createPlacement, getStudents, getOrganizations } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PageHeader, Card, Table, Button, Modal, FormField, Input, Select, Spinner, SearchInput, EmptyState, StatCard } from '../components/UI';
import { Plus, Award, TrendingUp } from 'lucide-react';

const emptyForm = { student_id: '', organization_id: '', job_role: '', package_lpa: '', offer_date: '', joining_date: '', offer_type: '' };

export default function Placements() {
  const { canManage } = useAuth();
  const [placements, setPlacements] = useState([]);
  const [students, setStudents] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, oRes] = await Promise.all([getPlacements(), getStudents(), getOrganizations()]);
      setPlacements(pRes.data); setStudents(sRes.data); setOrgs(oRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await createPlacement(form);
      setShowModal(false); setForm(emptyForm); load();
    } catch (err) { setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed'); }
    finally { setSaving(false); }
  };

  const filtered = placements.filter(p =>
    (p.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.organization_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.job_role || '').toLowerCase().includes(search.toLowerCase())
  );

  const avgPkg = placements.length > 0
    ? (placements.reduce((s, p) => s + parseFloat(p.package_lpa || 0), 0) / placements.length).toFixed(2)
    : 0;
  const maxPkg = placements.length > 0
    ? Math.max(...placements.map(p => parseFloat(p.package_lpa || 0))).toFixed(2)
    : 0;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Placements"
        subtitle={`${placements.length} placed students`}
        action={canManage() && <Button onClick={() => { setShowModal(true); setForm(emptyForm); setError(''); }}><Plus size={16} /> Record Placement</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Placed" value={placements.length} icon={Award} color="green" />
        <StatCard label="Avg Package" value={`${avgPkg} LPA`} icon={TrendingUp} color="blue" />
        <StatCard label="Highest Package" value={`${maxPkg} LPA`} icon={TrendingUp} color="purple" />
        <StatCard label="Companies" value={new Set(placements.map(p => p.organization_id)).size} icon={Award} color="orange" />
      </div>

      <Card>
        <div className="px-6 py-4 border-b border-slate-100">
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search placements..." />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Award} title="No placements yet" description="Record placements using the button above" />
        ) : (
          <Table headers={['Student', 'Organization', 'Role', 'Package', 'Offer Type', 'Offer Date', 'Joining Date']}>
            {filtered.map(p => (
              <tr key={p.placement_id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(p.student_name || 'S').charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{p.student_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.organization_name}</td>
                <td className="px-4 py-3 text-sm text-slate-700 font-medium">{p.job_role}</td>
                <td className="px-4 py-3">
                  <span className="text-green-600 font-bold text-sm">{p.package_lpa} LPA</span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">{p.offer_type}</span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.offer_date ? new Date(p.offer_date).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3 text-sm text-slate-500">{p.joining_date ? new Date(p.joining_date).toLocaleDateString('en-IN') : '—'}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {/* Create Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Placement" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
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
            <FormField label="Job Role" required>
              <Input value={form.job_role} onChange={e => setForm({ ...form, job_role: e.target.value })} placeholder="e.g. Software Engineer" required />
            </FormField>
            <FormField label="Package (LPA)" required>
              <Input type="number" step="0.1" min="0" value={form.package_lpa} onChange={e => setForm({ ...form, package_lpa: e.target.value })} placeholder="e.g. 6.5" required />
            </FormField>
            <FormField label="Offer Type" required>
              <Select value={form.offer_type} onChange={e => setForm({ ...form, offer_type: e.target.value })} required>
                <option value="">Select type</option>
                {['Full Time', 'Part Time', 'Contract', 'PPO'].map(t => <option key={t}>{t}</option>)}
              </Select>
            </FormField>
            <FormField label="Offer Date">
              <Input type="date" value={form.offer_date} onChange={e => setForm({ ...form, offer_date: e.target.value })} />
            </FormField>
            <FormField label="Joining Date">
              <Input type="date" value={form.joining_date} onChange={e => setForm({ ...form, joining_date: e.target.value })} />
            </FormField>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Record Placement</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
