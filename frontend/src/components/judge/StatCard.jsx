import { motion } from 'framer-motion';

/**
 * StatCard — premium statistics card for judge dashboard
 * Props: icon, label, value, color, trend, trendLabel
 */
const StatCard = ({ icon: Icon, label, value, color = 'accent', trend, trendLabel, delay = 0 }) => {
  const colorMap = {
    accent: {
      bg: 'bg-accent-500/10',
      border: 'border-accent-500/20',
      icon: 'text-accent-400',
      glow: 'rgba(0,114,255,0.15)',
    },
    gold: {
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/20',
      icon: 'text-gold-400',
      glow: 'rgba(0,255,135,0.15)',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      glow: 'rgba(16,185,129,0.15)',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      icon: 'text-amber-400',
      glow: 'rgba(245,158,11,0.15)',
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      icon: 'text-violet-400',
      glow: 'rgba(139,92,246,0.15)',
    },
  };
  const c = colorMap[color] || colorMap.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-white/8 p-5 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl pointer-events-none"
        style={{ background: c.glow }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{label}</p>
          <p className="text-white text-3xl font-display font-bold leading-none">{value}</p>
          {trendLabel && (
            <p className="text-slate-500 text-xs mt-2">{trendLabel}</p>
          )}
        </div>
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          {Icon && <Icon className={`${c.icon} text-xl`} />}
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-1.5">
          <span
            className={`text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500 text-xs">vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
