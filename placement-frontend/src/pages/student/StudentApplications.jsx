import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApplications } from '../../services/api';
import StudentLayout from './StudentLayout';
import { Spinner } from '../../components/UI';
import RoundTracker from '../../components/RoundTracker';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';

const statusStyle = {
  Applied:     'bg-blue-100 text-blue-700',
  'In Process':'bg-orange-100 text-orange-700',
  Selected:    'bg-green-100 text-green-700',
  Rejected:    'bg-red-100 text-red-700',
};

export default function StudentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getApplications();
        const myApps = (res.data || []).filter(a => a.student_id === user?.student_id);
        setApplications(myApps);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.student_id]);

  if (loading) return <StudentLayout><Spinner /></StudentLayout>;

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track your application status and interview round progress</p>
        </div>

        {applications.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {[['Applied','blue'],['In Process','orange'],['Selected','green'],['Rejected','red']].map(([s,c]) => {
              const count = applications.filter(a => a.status === s).length;
              if (!count) return null;
              return (
                <div key={s} className={`bg-${c}-50 border border-${c}-100 rounded-xl px-4 py-2.5 text-center min-w-[80px]`}>
                  <p className={`text-xl font-bold text-${c}-700`}>{count}</p>
                  <p className={`text-xs text-${c}-500 font-medium`}>{s}</p>
                </div>
              );
            })}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={24} className="text-slate-400" />
            </div>
            <p className="text-slate-600 font-semibold">No applications yet</p>
            <p className="text-slate-400 text-sm mt-1">Your placement officer will register you to placement drives</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.application_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(expanded === app.application_id ? null : app.application_id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0d1b2a] to-[#1e3a5f] flex items-center justify-center text-white font-bold text-base shrink-0">
                      {(app.organization_name || 'C').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{app.organization_name || 'Company'}</p>
                      <p className="text-sm text-slate-400">{app.role_title || 'Position'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[app.status] || 'bg-slate-100 text-slate-600'}`}>{app.status}</span>
                    {(app.current_round||0) > 0 && <span className="text-xs text-slate-400 hidden sm:block">Round {app.current_round}</span>}
                    {expanded === app.application_id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                <div className="px-6 pb-3">
                  <RoundTracker application={app} compact />
                </div>

                {expanded === app.application_id && (
                  <div className="border-t border-slate-100 px-6 py-5 bg-slate-50/60">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">Full Application Timeline</p>
                    <RoundTracker application={app} />
                    <div className="mt-2 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-400">Applied On</p>
                        <p className="font-medium text-slate-700 mt-0.5">{app.application_date ? new Date(app.application_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Current Round</p>
                        <p className="font-medium text-slate-700 mt-0.5">{app.current_round ? `Round ${app.current_round}` : 'Not started'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <p className={`font-semibold mt-0.5 ${app.status==='Selected'?'text-green-600':app.status==='Rejected'?'text-red-600':app.status==='In Process'?'text-orange-600':'text-blue-600'}`}>{app.status}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
