import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, User, Briefcase, ClipboardList,
  GraduationCap, LogOut, ChevronRight, Menu, Bell
} from 'lucide-react';

const studentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
  { label: 'My Profile', icon: User, path: '/student/profile' },
  { label: 'Opportunities', icon: Briefcase, path: '/student/opportunities' },
  { label: 'My Applications', icon: ClipboardList, path: '/student/applications' },
];

export default function StudentLayout({ children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`${open ? 'w-60' : 'w-16'} bg-[#0d1b2a] flex flex-col transition-all duration-300 shrink-0 relative z-20`}>
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-500 z-30"
        >
          {open ? <ChevronRight size={12} /> : <Menu size={12} />}
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {open && (
            <div>
              <p className="text-white font-bold text-sm leading-none">SRM HAVLOC</p>
              <p className="text-blue-400 text-[10px] tracking-widest uppercase mt-0.5">Student Portal</p>
            </div>
          )}
        </div>

        {/* User */}
        {open && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {(user?.username || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.name || user?.username?.split('@')[0]}</p>
                <p className="text-blue-400 text-xs">Student</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {studentNav.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {open && <span className="text-sm font-medium truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-white/10">
          <button
            onClick={() => { logoutUser(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            {open && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
