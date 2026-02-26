import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, GraduationCap, Users, BookOpen, Briefcase } from 'lucide-react';

const roleHome = {
  student:           '/student/dashboard',
  faculty:           '/faculty/dashboard',
  hod:               '/faculty/dashboard',
  placement_officer: '/officer/dashboard',
  admin:             '/officer/dashboard',
};

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      const data = res.data;

      // Support multiple possible backend response shapes:
      // { token, role } OR { token, user: { role } } OR { token, data: { role } }
      const token = data.token || data.access_token;
      const role  = data.role || data.user?.role || data.data?.role;

      if (!token) throw new Error('No token received from server');

      loginUser(token, { role, username: form.username });

      const dest = roleHome[role];
      if (!dest) {
        setError(`Unknown role "${role}". Contact your administrator.`);
        return;
      }
      navigate(dest);
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const portalRoles = [
    { label: 'Student', icon: Users, color: 'blue', hint: 'student@college.edu' },
    { label: 'Faculty / HOD', icon: BookOpen, color: 'purple', hint: 'faculty@college.edu' },
    { label: 'Placement Officer', icon: Briefcase, color: 'emerald', hint: 'officer@college.edu' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      {/* Grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-xl leading-none tracking-wide">SRM HAVLOC</p>
              <p className="text-blue-400 text-xs tracking-[0.2em] uppercase">Placement Portal</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mt-2">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to continue to your portal</p>
        </div>

        {/* Portal role chips */}
        <div className="flex justify-center gap-2 flex-wrap mb-6">
          {portalRoles.map(({ label, icon: Icon, color }) => (
            <div key={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                bg-${color}-500/10 text-${color}-400 border border-${color}-500/20`}>
              <Icon size={11} />
              {label}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email / Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white
                  placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1
                  focus:ring-blue-500/50 transition-all"
                placeholder="your@email.com"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white
                    placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1
                    focus:ring-blue-500/50 transition-all pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm flex items-start gap-2">
                <span className="mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold
                py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
              {loading
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign In →'
              }
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              First time? Have a registration token?{' '}
              <Link to="/activate" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Activate Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
