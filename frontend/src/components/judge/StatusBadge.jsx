/**
 * StatusBadge — evaluation status badge
 * status: 'not_started' | 'draft' | 'submitted' | 'completed'
 */
const STATUS_CONFIG = {
  not_started: {
    label: 'Not Started',
    className: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
    dot: 'bg-slate-400',
  },
  draft: {
    label: 'Draft Saved',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400',
  },
  submitted: {
    label: 'Submitted',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    dot: 'bg-emerald-400',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    dot: 'bg-amber-400',
  },
};

const StatusBadge = ({ status = 'not_started', className = '' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;
