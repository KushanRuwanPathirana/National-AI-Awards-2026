import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiCalendarLine, RiCheckLine, RiTimeLine, RiArrowRightLine } from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

/* ─────────────────────────────────────────────── */
/* UPDATED TIMELINE DATA — YOUR NEW DATES          */
/* ─────────────────────────────────────────────── */
const timeline = [
  { date: '15 July 2026', event: 'Application Calling', status: 'active' },
  { date: '15 August 2026', event: 'Application Deadline', status: 'upcoming' },
  { date: 'First Week of August', event: 'Initial Screening', status: 'upcoming' },
  { date: 'Second Week of August', event: 'Face-to-Face Evaluation', status: 'upcoming' },
  { date: 'Last Week of August', event: 'Final Announcements', status: 'upcoming' },
];

/* ─────────────────────────────────────────────── */

const Timeline = () => (
  <div className="overflow-x-hidden">

    {/* ═══════════════ HERO ═══════════════════════════════════════════════ */}
    <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="section-container relative z-10 text-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-accent mb-6 inline-flex">
          Programme Timeline
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight"
        >
          Key Dates & <span className="gradient-text">Milestones</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto"
        >
          Plan your journey with our structured timeline from application to the grand awards ceremony.
        </motion.p>
      </div>
    </section>

    {/* ═══════════════ TIMELINE ═══════════════════════════════════════════════ */}
    <section className="section-py">
      <div className="section-container">
        <div className="relative max-w-3xl mx-auto">

          {/* Vertical line */}
          <div className="absolute left-8 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent-500/60 via-accent-500/30 to-transparent" />

          {timeline.map((item, i) => (
            <motion.div
              key={item.date}
              initial={{ opacity: 0, x: i % 2 === 0 ? -32 : 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex items-start gap-8 mb-8 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
            >
              {/* Dot */}
              <div
                className={`absolute left-8 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${item.status === 'done'
                  ? 'bg-emerald-500 border-emerald-400'
                  : item.status === 'active'
                    ? 'bg-accent-500 border-accent-400 shadow-glow'
                    : 'bg-surface-100 border-slate-600'
                  }`}
              />

              {/* Card */}
              <div
                className={`ml-16 sm:ml-0 glass-card p-5 sm:w-5/12 !hover:transform-none ${item.status === 'active' ? 'border-accent-500/50' : ''
                  }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <RiCalendarLine className="text-accent-400 text-sm" />
                  <span className="text-accent-400 text-xs font-medium">{item.date}</span>
                </div>

                <p
                  className={`font-display font-semibold text-sm ${item.status === 'done'
                    ? 'text-emerald-300'
                    : item.status === 'active'
                      ? 'text-white'
                      : 'text-slate-300'
                    }`}
                >
                  {item.event}
                </p>

                {item.status === 'done' && (
                  <span className="badge-green mt-2 text-xs">Completed</span>
                )}
                {item.status === 'active' && (
                  <span className="badge-accent mt-2 text-xs">Current</span>
                )}
              </div>

              {/* Spacer */}
              <div className="hidden sm:block sm:w-5/12" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ═══════════════ CTA ═══════════════════════════════════════════════ */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container text-center">
        <SectionHeader
          badge="Ready?"
          title="Prepare Your Submission &"
          highlight="Apply Today"
          subtitle="Applications are open until 15 August 2026. Submit your entry free of charge."
        />
        <Link to="/apply">
          <Button variant="gold" size="lg">
            Start Application <RiArrowRightLine />
          </Button>
        </Link>
      </div>
    </section>
  </div>
);

export default Timeline;
