import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, Briefcase, ClipboardList,
  Award, BarChart3, GraduationCap, LogOut, Menu, X, ChevronRight,
  Settings, HelpCircle
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'placement_officer', 'faculty', 'hod', 'student'] },
  { label: 'Students', icon: Users, path: '/students', roles: ['admin', 'placement_officer', 'faculty', 'hod'] },
  { label: 'Organizations', icon: Building2, path: '/organizations', roles: ['admin', 'placement_officer', 'faculty', 'hod'] },
  { label: 'Internships', icon: Briefcase, path: '/internships', roles: ['admin', 'placement_officer', 'faculty', 'hod', 'student'] },
  { label: 'Applications', icon: ClipboardList, path: '/applications', roles: ['admin', 'placement_officer', 'faculty', 'hod', 'student'] },
  { label: 'Placements', icon: Award, path: '/placements', roles: ['admin', 'placement_officer', 'faculty', 'hod'] },
  { label: 'Reports', icon: BarChart3, path: '/reports', roles: ['faculty', 'hod', 'placement_officer'] },
];

export default function Layout({ children }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const roleLabel = {
    admin: 'Administrator',
    placement_officer: 'Placement Officer',
    faculty: 'Faculty',
    hod: 'Head of Department',
    student: 'Student',
  }[user?.role] || user?.role;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#0d1b2a] flex flex-col transition-all duration-300 ease-in-out relative z-20 shrink-0`}>
        
        {/* Toggle button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-500 transition-colors z-30"
        >
          {sidebarOpen ? <ChevronRight size={12} /> : <Menu size={12} />}
        </button>

        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <GraduationCap size={18} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm leading-none">SRM HAVLOC</p>
                <p className="text-blue-400 text-[10px] tracking-widest uppercase mt-0.5">Placement Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-sm font-medium truncate">{user?.username}</p>
                <p className="text-slate-400 text-xs">{roleLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {filtered.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/10 space-y-1">
          {sidebarOpen && (
            <>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                <Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                <HelpCircle size={18} />
                <span className="text-sm font-medium">Help Center</span>
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-h-screen">
        <div className="p-6 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
