import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudent, updateStudent } from '../../services/api';
import StudentLayout from './StudentLayout';
import { Spinner } from '../../components/UI';
import { CheckCircle, Save, User, BookOpen, Phone, Link2, Sparkles } from 'lucide-react';

const depts = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AIDS', 'AIML', 'BCA', 'MCA'];

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const [studentData, setStudentData] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.student_id) { setLoading(false); return; }
      try {
        const res = await getStudent(user.student_id);
        const s = res.data;
        setStudentData(s);
        setForm({
          name: s.name || '',
          email: s.email || '',
          phone: s.phone || '',
          department: s.department || '',
          year_of_study: s.year_of_study || '',
          cgpa: s.cgpa || '',
          resume_link: s.resume_link || '',
          skill_set: s.skill_set || '',
        });
        setIsFirstTime(!s.name || !s.department);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.student_id]);

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return setError('Full name is required');
    if (!form.department) return setError('Department is required');
    if (!form.year_of_study) return setError('Year of study is required');
    setSaving(true); setError('');
    try {
      await updateStudent(user.student_id, form);
      setSaved(true);
      setIsFirstTime(false);
      updateUser({ name: form.name });
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally { setSaving(false); }
  };

  if (loading) return <StudentLayout><Spinner /></StudentLayout>;

  if (!user?.student_id) {
    return (
      <StudentLayout>
        <div className="text-center py-20">
          <p className="text-slate-500">No student profile linked to your account. Contact your Placement Officer.</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isFirstTime ? '👋 Complete Your Profile' : 'My Profile'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isFirstTime
              ? 'Fill in your details to appear in placement records. This information will be reviewed by your faculty.'
              : 'Keep your profile updated. Changes are saved to the placement database.'}
          </p>
        </div>

        {/* First-time banner */}
        {isFirstTime && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-800">Set up your placement profile</p>
              <p className="text-blue-600 text-sm mt-0.5">Your register number is <strong>{studentData?.register_number}</strong>. Fill in all the fields below to complete your profile.</p>
            </div>
          </div>
        )}

        {/* Read-only info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">System Info (Read-only)</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">Register Number</p>
              <p className="font-mono font-semibold text-slate-700">{studentData?.register_number || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Profile Status</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                studentData?.profile_status === 'Verified' ? 'bg-green-100 text-green-700' :
                studentData?.profile_status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>{studentData?.profile_status || 'Pending'}</span>
            </div>
            <div>
              <p className="text-xs text-slate-400">Placement Status</p>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${
                studentData?.placement_status === 'Placed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>{studentData?.placement_status || 'Unplaced'}</span>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          {/* Personal */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={16} className="text-blue-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Personal Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input value={form.name} onChange={f('name')} placeholder="e.g. Arjun Sharma"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                <input value={form.email} onChange={f('email')} type="email" placeholder="your@email.com"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={f('phone')} placeholder="+91 9999999999"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          {/* Academic */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={16} className="text-blue-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Academic Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Department <span className="text-red-500">*</span></label>
                <select value={form.department} onChange={f('department')}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required>
                  <option value="">Select dept.</option>
                  {depts.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Year of Study <span className="text-red-500">*</span></label>
                <select value={form.year_of_study} onChange={f('year_of_study')}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" required>
                  <option value="">Select year</option>
                  {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">CGPA</label>
                <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={f('cgpa')} placeholder="e.g. 8.50"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
            </div>
          </div>

          {/* Resume & Skills */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-4">
              <Link2 size={16} className="text-blue-600" />
              <h3 className="font-semibold text-slate-700 text-sm">Resume & Skills</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Resume Link (Google Drive / GitHub)</label>
                <input type="url" value={form.resume_link} onChange={f('resume_link')} placeholder="https://drive.google.com/file/..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Skills <span className="text-slate-400">(comma-separated)</span></label>
                <input value={form.skill_set} onChange={f('skill_set')} placeholder="React, Node.js, Python, SQL, AWS..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all" />
                {form.skill_set && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.skill_set.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between pt-2">
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={16} />
                <span>Profile saved successfully!</span>
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {isFirstTime ? 'Save Profile' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
