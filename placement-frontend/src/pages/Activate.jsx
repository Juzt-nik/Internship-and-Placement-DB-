import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { activateStudent, login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, KeyRound, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function Activate() {
  const [form, setForm] = useState({ email: '', registration_token: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logging, setLogging] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!form.email.trim()) return setError('Email is required to activate and log in');
    setLoading(true); setError('');
    try {
      // Step 1: Activate account
      await activateStudent({ registration_token: form.registration_token, password: form.password });

      // Step 2: Auto-login immediately
      setLogging(true);
      const res = await login({ username: form.email.trim(), password: form.password });
      loginUser(res.data.token, { role: res.data.role, username: form.email.trim() });
      navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || '';
      if (msg.includes('login') || msg.includes('credentials')) {
        // Activation succeeded but auto-login failed — send to login page
        setError('Account activated! Please log in with your email and new password.');
        setTimeout(() => navigate('/login'), 2500);
      } else {
        setError(msg || 'Activation failed. Check your token and try again.');
      }
    } finally {
      setLoading(false);
      setLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-xl leading-none">SRM HAVLOC</p>
              <p className="text-blue-400 text-xs tracking-[0.2em] uppercase">Placement Portal</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-3">
            <KeyRound size={14} className="text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Student Account Activation</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set Up Your Account</h1>
          <p className="text-slate-400 mt-1 text-sm">Enter the token sent by your Placement Officer</p>
        </div>

        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your College Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={f('email')}
                className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                placeholder="yourname@college.edu"
                required
              />
              <p className="text-slate-500 text-xs mt-1">This is your login username</p>
            </div>

            {/* Token */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Registration Token <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.registration_token}
                onChange={f('registration_token')}
                className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm"
                placeholder="Paste your UUID token here"
                required
              />
              <p className="text-slate-500 text-xs mt-1">Provided by your Placement Officer</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Create Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={f('password')}
                  className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all pr-12"
                  placeholder="Min. 6 characters"
                  required
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password <span className="text-red-400">*</span></label>
              <input
                type="password"
                value={form.confirm}
                onChange={f('confirm')}
                className="w-full px-4 py-3 bg-[#1a2234] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Repeat your password"
                required
              />
            </div>

            {error && (
              <div className={`border rounded-xl px-4 py-3 text-sm ${
                error.includes('activated') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {error.includes('activated') && <CheckCircle size={14} className="inline mr-2" />}
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || logging}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {(loading || logging) ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {logging ? 'Logging you in...' : 'Activating...'}
                </>
              ) : 'Activate & Go to Dashboard →'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              ← Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
