import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiArrowRightLine, RiCheckLine, RiUserLine, RiShieldCheckLine,
  RiCalendarLine, RiGroupLine, RiStarLine, RiBookOpenLine,
} from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const judgeRoles = [
  { icon: RiStarLine,     title: 'Technical Judges',       desc: 'Senior AI engineers and data scientists evaluating the technical rigour of submissions.' },
  { icon: RiGroupLine,    title: 'Industry Judges',         desc: 'Domain experts from healthcare, finance, agriculture, and other sectors assessing real-world impact.' },
  { icon: RiBookOpenLine, title: 'Academic Judges',         desc: 'University professors and research leads evaluating scientific contribution and innovation.' },
  { icon: RiShieldCheckLine, title: 'Ethics Judges',        desc: 'AI ethics specialists assessing responsible AI practices and societal impact.' },
];

const process = [
  { phase: 'Review',      desc: 'Access your assigned applications in the Judge Portal and conduct an initial technical review.' },
  { phase: 'Score',       desc: 'Rate each submission across 5 weighted criteria using our structured scoring rubric.' },
  { phase: 'Discuss',     desc: 'Participate in panel deliberations via video call to resolve scoring discrepancies.' },
  { phase: 'Finalise',    desc: 'Confirm your final scores and recommendations for winners and runners-up.' },
];

const expectations = [
  'Attend a 2-hour judge orientation session (online)',
  'Review 5–15 applications in your assigned category',
  'Score submissions using our digital scoring portal',
  'Attend 1–2 panel discussion sessions',
  'Maintain strict confidentiality of all submissions',
  'Disclose and avoid all conflicts of interest',
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const JudgePortal = () => (
  <div className="overflow-x-hidden">
    {/* ── Hero ── */}
    <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-accent-500/40 to-transparent" />
      <div className="section-container relative z-10 text-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-accent mb-6 inline-flex">
          Expert Evaluation Panel
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight"
        >
          Judge <span className="gradient-text">Portal</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          Are you a thought leader in AI, technology, or innovation? Join our esteemed panel of judges and help 
          shape the future of artificial intelligence in Sri Lanka.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login">
            <Button variant="primary" size="lg">
              Judge Login <RiArrowRightLine />
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="ghost" size="lg">
              Apply to Judge
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── Judge Types ── */}
    <section className="section-py">
      <div className="section-container">
        <SectionHeader
          badge="Panel Composition"
          title="Types of"
          highlight="Judges"
          subtitle="Our diverse judging panel brings together expertise from across academia, industry, and the AI research community."
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {judgeRoles.map((role) => (
            <motion.div key={role.title} variants={fadeUp} className="glass-card p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4">
                <role.icon className="text-accent-400 text-2xl" />
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">{role.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{role.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── Judging Process ── */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container">
        <SectionHeader
          badge="How It Works"
          title="The Judging"
          highlight="Process"
          subtitle="A structured, transparent, and fair evaluation process designed to surface the most deserving innovations."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {process.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 text-center relative"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center mx-auto mb-4 font-display font-bold text-white text-sm shadow-glow">
                {String(i + 1).padStart(2, '0')}
              </div>
              <h3 className="font-display font-bold text-white text-base mb-2">{p.phase}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{p.desc}</p>
              {i < process.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                  <RiArrowRightLine className="text-accent-500/50 text-xl" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Expectations + Login CTA ── */}
    <section className="section-py">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Expectations */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="badge-accent mb-4 inline-flex">What to Expect</span>
            <h2 className="font-display font-bold text-4xl text-white mb-6">
              Judge <span className="gradient-text">Expectations</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We ask all judges to commit to a structured evaluation process conducted between May and June 2026. 
              All activities can be completed remotely via our secure digital portal.
            </p>
            <ul className="space-y-3">
              {expectations.map((e) => (
                <li key={e} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-500/20 border border-accent-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RiCheckLine className="text-accent-400 text-xs" />
                  </span>
                  <p className="text-slate-300 text-sm">{e}</p>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 mt-6 p-4 glass-card !hover:transform-none rounded-xl">
              <RiCalendarLine className="text-accent-400 text-xl flex-shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">Judging Period</p>
                <p className="text-slate-400 text-xs">1 May – 14 June 2026 · Fully Remote</p>
              </div>
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="glass-card p-8 border-accent-500/30">
              <div className="w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6 shadow-glow">
                <RiUserLine className="text-white text-3xl" />
              </div>
              <h3 className="font-display font-bold text-white text-2xl mb-2">Returning Judge?</h3>
              <p className="text-slate-400 text-sm mb-8">
                Log in to your Judge Portal to access your assigned applications, submit your scores, and view the judging schedule.
              </p>
              <Link to="/login" className="block mb-4">
                <Button variant="primary" size="lg" className="w-full">
                  Access Judge Portal <RiArrowRightLine />
                </Button>
              </Link>
              <div className="divider-glow my-6" />
              <p className="text-slate-500 text-sm text-center mb-4">Not yet registered as a judge?</p>
              <Link to="/contact" className="block">
                <Button variant="ghost" className="w-full">
                  Apply to Become a Judge
                </Button>
              </Link>
              <p className="text-slate-600 text-xs text-center mt-4">
                Judges are selected by invitation and application. Criteria include domain expertise, 
                seniority, and commitment to ethical AI.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  </div>
);

export default JudgePortal;
