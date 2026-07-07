import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiCalendarLine, RiCheckLine, RiTimeLine, RiArrowRightLine } from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const phases = [
  {
    phase: 'Phase 1',
    title: 'Winner & Finalist Recognition',
    dateRange: 'Weeks 1–4 Post-Event',
    status: 'completed',
    color: 'emerald',
    milestones: [
      { date: 'Week 1', event: 'Publish winner case studies on ICTA, SLASSCOM & FITIS', status: 'completed' },
      { date: 'Week 2', event: 'Issue National AI Trustmark badge to all winners', status: 'completed' },
      { date: 'Week 3', event: 'Distribute press release & media kit to national press', status: 'completed' },
      { date: 'Week 4', event: 'Launch winner spotlight series — #NationalAIAwardsSL', status: 'completed' },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Knowledge Sharing & Ecosystem Building',
    dateRange: 'Months 1–3 Post-Event',
    status: 'completed',
    color: 'accent',
    milestones: [
      { date: 'Month 1', event: "Host Winners' Showcase webinar for industry & academia", status: 'completed' },
      { date: 'Month 2', event: 'Release anonymised judge feedback to future applicants', status: 'completed' },
      { date: 'Month 3', event: 'Compile annual "State of AI in Sri Lanka" insights report', status: 'completed' },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Alumni Network & Continuity',
    dateRange: 'Ongoing',
    status: 'ongoing',
    color: 'purple',
    milestones: [
      { date: 'Ongoing', event: "Launch Winners' Alumni Network for mentoring & community", status: 'ongoing' },
      { date: 'Ongoing', event: 'Invite past winners as screeners in future award cycles', status: 'ongoing' },
      { date: 'Ongoing', event: 'Publish yearly impact metrics from winning solutions', status: 'ongoing' },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Program Evaluation & Improvement',
    dateRange: 'Months 2–4 Post-Event',
    status: 'upcoming',
    color: 'gold',
    milestones: [
      { date: 'Month 2', event: "Survey all judges, finalists & applicants' post-event", status: 'upcoming' },
      { date: 'Month 3', event: 'Review categories & criteria based on Year 1 learnings', status: 'upcoming' },
      { date: 'Month 4', event: 'Benchmark against GLOMO & IMDA · Prepare for 2027 cycle', status: 'upcoming' },
    ],
  },
];

const colorMap = {
  emerald: { dot: 'bg-emerald-500', bar: 'from-emerald-500/60', badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', line: 'bg-emerald-500/40' },
  accent:  { dot: 'bg-accent-500',  bar: 'from-accent-500/60',  badge: 'text-accent-400 bg-accent-500/15 border-accent-500/30',   line: 'bg-accent-500/40' },
  purple:  { dot: 'bg-purple-500',  bar: 'from-purple-500/60',  badge: 'text-purple-400 bg-purple-500/15 border-purple-500/30',   line: 'bg-purple-500/40' },
  gold:    { dot: 'bg-gold-500',    bar: 'from-gold-500/60',    badge: 'text-gold-400 bg-gold-500/15 border-gold-500/30',         line: 'bg-gold-500/40' },
};

const statusLabel = { completed: 'Completed', active: 'In Progress', ongoing: 'Ongoing', upcoming: 'Upcoming' };

const Timeline = () => (
  <div className="overflow-x-hidden">
    {/* ── Hero ── */}
    <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="section-container relative z-10 text-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-accent mb-6 inline-flex">
          Post-Awards Roadmap
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
        >
          Ecosystem & <span className="gradient-text">Roadmap</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg max-w-xl mx-auto"
        >
          Explore our roadmap for winner recognition, knowledge sharing, alumni community building, and program evaluation.
        </motion.p>
      </div>
    </section>

    {/* ── Visual Progress Bar ── */}
    <section className="py-10 bg-surface-200/50">
      <div className="section-container">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          {phases.map((phase, i) => {
            const c = colorMap[phase.color];
            return (
              <div key={phase.phase} className="flex-1 flex flex-col items-center gap-2">
                <div className={`w-full h-2 rounded-full ${phase.status === 'upcoming' ? 'bg-surface-100' : (phase.status === 'active' || phase.status === 'ongoing') ? c.line : c.line} relative overflow-hidden`}>
                  {(phase.status === 'active' || phase.status === 'ongoing') && (
                    <motion.div
                      animate={{ x: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-y-0 w-1/2 bg-gradient-to-r ${c.bar} to-transparent`}
                    />
                  )}
                </div>
                <p className={`text-xs font-medium ${phase.status === 'upcoming' ? 'text-slate-600' : (phase.status === 'active' || phase.status === 'ongoing') ? 'text-accent-400' : 'text-emerald-400'}`}>
                  {phase.phase}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* ── Phases ── */}
    <section className="section-py">
      <div className="section-container max-w-4xl mx-auto space-y-10">
        {phases.map((phase, phaseIdx) => {
          const c = colorMap[phase.color];
          return (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: phaseIdx * 0.1 }}
              className="glass-card overflow-hidden"
            >
              {/* Phase header */}
              <div className="p-6 border-b border-white/10 flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`badge border ${c.badge} text-xs`}>{phase.phase}</span>
                    <span className={`badge border ${c.badge} text-xs`}>{statusLabel[phase.status]}</span>
                  </div>
                  <h2 className="font-display font-bold text-white text-2xl">{phase.title}</h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <RiCalendarLine className="text-accent-400" />
                  {phase.dateRange}
                </div>
              </div>

              {/* Milestones */}
              <div className="relative p-6">
                <div className="absolute left-10 top-6 bottom-6 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                <div className="space-y-6">
                  {phase.milestones.map((m, mi) => (
                    <motion.div
                      key={`${phase.phase}-${m.date}-${mi}`}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: phaseIdx * 0.05 + mi * 0.08 }}
                      className="relative flex items-start gap-6 pl-4"
                    >
                      {/* Dot */}
                      <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 z-10 ${
                        m.status === 'completed' ? `${c.dot} border-white/30` :
                        (m.status === 'active' || m.status === 'ongoing') ? `${c.dot} border-white/50 shadow-glow` :
                                                   'bg-surface-100 border-slate-700'
                      }`} />

                      <div className="flex-1 flex items-start justify-between gap-4 flex-wrap">
                        <p className={`font-medium text-sm ${m.status === 'upcoming' ? 'text-slate-500' : 'text-white'}`}>
                          {m.event}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-shrink-0">
                          <RiTimeLine />
                          {m.date}
                          {m.status === 'completed' && <RiCheckLine className="text-emerald-400" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container text-center">
        <SectionHeader
          badge="Prepare for the Next Cycle"
          title="Looking Ahead to the"
          highlight="2027 Program"
          subtitle="Keep up with updates, review the evaluation results, and get ready for the next edition of the National AI Awards."
        />
        <Link to="/contact">
          <Button variant="gold" size="lg">Get in Touch <RiArrowRightLine /></Button>
        </Link>
      </div>
    </section>
  </div>
);

export default Timeline;
