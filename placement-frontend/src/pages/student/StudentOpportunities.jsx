import React, { useState, useEffect } from 'react';
import { getInternships, getOrganizations, getPlacements } from '../../services/api';
import StudentLayout from './StudentLayout';
import { Spinner } from '../../components/UI';
import { Briefcase, Building2, MapPin, DollarSign, Calendar } from 'lucide-react';

export default function StudentOpportunities() {
  const [internships, setInternships] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('internships');

  useEffect(() => {
    const load = async () => {
      try {
        const [iRes, oRes, pRes] = await Promise.all([
          getInternships().catch(() => ({ data: [] })),
          getOrganizations().catch(() => ({ data: [] })),
          getPlacements().catch(() => ({ data: [] })),
        ]);
        setInternships(iRes.data || []);
        setOrgs(oRes.data || []);
        setPlacements(pRes.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <StudentLayout><Spinner /></StudentLayout>;

  const orgMap = Object.fromEntries(orgs.map(o => [o.organization_id, o]));

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Opportunities</h1>
          <p className="text-slate-500 text-sm mt-1">Browse available internships and placement drives</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {[['internships', 'Internships', internships.length], ['placements', 'Placement Drives', placements.length]].map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {label} <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${tab === key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Internships */}
        {tab === 'internships' && (
          internships.length === 0 ? (
            <EmptyCard icon={Briefcase} text="No internships listed yet" />
          ) : (
            <div className="grid gap-4">
              {internships.map(i => (
                <div key={i.internship_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                    {(i.organization_name || 'C').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-800">{i.internship_domain}</p>
                        <p className="text-sm text-slate-500">{i.organization_name}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        i.internship_status === 'Ongoing' ? 'bg-blue-100 text-blue-700' :
                        i.internship_status === 'Completed' ? 'bg-green-100 text-green-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{i.internship_status}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar size={12} />{i.duration_months} months</span>
                      <span className="flex items-center gap-1"><DollarSign size={12} />₹{Number(i.stipend || 0).toLocaleString()}/mo</span>
                      <span className="flex items-center gap-1"><Briefcase size={12} />{i.mode}</span>
                    </div>
                  </div>
                  {i.certificate_submitted ? (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2.5 py-1 rounded-full border border-green-100 shrink-0">✓ Certificate</span>
                  ) : null}
                </div>
              ))}
            </div>
          )
        )}

        {/* Placements */}
        {tab === 'placements' && (
          placements.length === 0 ? (
            <EmptyCard icon={Building2} text="No placement records yet" />
          ) : (
            <div className="grid gap-4">
              {placements.map(p => (
                <div key={p.placement_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
                    {(p.organization_name || 'C').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-800">{p.job_role}</p>
                        <p className="text-sm text-slate-500">{p.organization_name}</p>
                      </div>
                      <span className="text-green-600 font-bold text-lg">{p.package_lpa} LPA</span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Briefcase size={12} />{p.offer_type}</span>
                      {p.offer_date && <span className="flex items-center gap-1"><Calendar size={12} />Offer: {new Date(p.offer_date).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </StudentLayout>
  );
}

function EmptyCard({ icon: Icon, text }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-slate-400" />
      </div>
      <p className="text-slate-500">{text}</p>
    </div>
  );
}
