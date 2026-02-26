import React from 'react';
import { CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';

/**
 * RoundTracker — shared component for Student, Faculty, Officer portals.
 * Props:
 *   application: { application_id, organization_name, role_title, status, current_round, application_date, rounds: [] }
 *   compact: bool — short inline dot view (for lists)
 */
export default function RoundTracker({ application: app, compact = false }) {
  if (!app) return null;
  const rounds = app.rounds || [];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Applied */}
        <Step compact result="done" label="Applied" />
        {/* Rounds */}
        {Array.from({ length: app.current_round || 0 }, (_, i) => {
          const round = rounds[i];
          const isLast = i === (app.current_round || 0) - 1;
          const result = round?.result || (isLast && app.status === 'Rejected' ? 'Eliminated' : isLast ? 'Pending' : 'Cleared');
          return (
            <React.Fragment key={i}>
              <div className="w-4 h-px bg-slate-200" />
              <Step compact result={result} label={`R${i + 1}`} />
            </React.Fragment>
          );
        })}
        {/* Offer */}
        {app.status === 'Selected' && (
          <>
            <div className="w-4 h-px bg-slate-200" />
            <Step compact result="selected" label="Offer" />
          </>
        )}
      </div>
    );
  }

  // Full vertical timeline
  return (
    <div className="space-y-0">
      <TimelineStep
        label="Application Submitted"
        sub={app.application_date ? new Date(app.application_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null}
        result="done"
        number="✓"
        isLast={false}
      />

      {rounds.length > 0 ? (
        rounds.map((r, i) => (
          <TimelineStep
            key={r.round_id || i}
            label={r.round_name || `Round ${r.round_number}`}
            sub={r.round_date ? new Date(r.round_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + (r.round_date.includes('T') ? ' · ' + new Date(r.round_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '') : null}
            result={r.result || 'Pending'}
            number={r.round_number}
            isLast={i === rounds.length - 1 && app.status !== 'Selected' && app.status !== 'Rejected'}
          />
        ))
      ) : app.current_round > 0 ? (
        Array.from({ length: app.current_round }, (_, i) => (
          <TimelineStep
            key={i}
            label={`Round ${i + 1}`}
            result={i < app.current_round - 1 ? 'Cleared' : app.status === 'Rejected' ? 'Eliminated' : 'Pending'}
            number={i + 1}
            isLast={i === app.current_round - 1 && app.status !== 'Selected'}
          />
        ))
      ) : (
        <div className="ml-4 pl-5 border-l-2 border-dashed border-slate-200 py-4">
          <p className="text-sm text-slate-400 italic">No interview rounds scheduled yet</p>
        </div>
      )}

      {app.status === 'Selected' && (
        <TimelineStep label="🎉 Offer Extended" sub="Congratulations!" result="selected" number="★" isLast={true} />
      )}
      {app.status === 'Rejected' && rounds.length === 0 && app.current_round === 0 && (
        <TimelineStep label="Application Declined" result="Eliminated" number="✗" isLast={true} />
      )}
    </div>
  );
}

function Step({ result, label, compact }) {
  const colors = {
    done: 'bg-green-100 text-green-700',
    Cleared: 'bg-green-100 text-green-700',
    selected: 'bg-green-500 text-white',
    Eliminated: 'bg-red-100 text-red-700',
    Pending: 'bg-orange-100 text-orange-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[result] || 'bg-slate-100 text-slate-500'}`}>
      {result === 'done' || result === 'Cleared' || result === 'selected'
        ? <CheckCircle2 size={11} />
        : result === 'Eliminated'
          ? <XCircle size={11} />
          : <Clock size={11} />}
      {label}
    </span>
  );
}

function TimelineStep({ label, sub, result, number, isLast }) {
  const isDone = result === 'done' || result === 'Cleared' || result === 'selected';
  const isBad = result === 'Eliminated';
  const isPending = result === 'Pending';

  const dotColor = isDone
    ? 'bg-green-500 border-green-500 text-white'
    : isBad
      ? 'bg-red-500 border-red-500 text-white'
      : isPending
        ? 'bg-orange-400 border-orange-400 text-white'
        : 'bg-white border-slate-300 text-slate-400';

  const lineColor = isDone ? 'bg-green-300' : 'bg-slate-200';

  return (
    <div className="flex gap-4">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${dotColor}`}>
          {isDone ? <CheckCircle2 size={14} /> : isBad ? <XCircle size={14} /> : number}
        </div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[20px] mt-0.5 ${lineColor}`} />}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${isBad ? 'text-red-600 line-through' : 'text-slate-800'}`}>
          {label}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {result && result !== 'done' && (
          <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
            result === 'Cleared' || result === 'selected' ? 'bg-green-100 text-green-700' :
            result === 'Eliminated' ? 'bg-red-100 text-red-700' :
            result === 'Pending' ? 'bg-orange-100 text-orange-700' : ''
          }`}>
            {result === 'done' ? '' : result}
          </span>
        )}
      </div>
    </div>
  );
}
