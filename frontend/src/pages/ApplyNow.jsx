import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiArrowRightLine, RiCheckLine, RiFileTextLine, RiUserLine,
  RiLightbulbLine, RiAwardLine, RiCalendarLine, RiUploadLine,
} from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const steps = [
  { step: '01', icon: RiUserLine,     title: 'Create an Account',         desc: 'Register on our portal with your email and create your applicant profile.' },
  { step: '02', icon: RiLightbulbLine, title: 'Choose Your Category',      desc: 'Select up to 2 award categories that best match your AI innovation.' },
  { step: '03', icon: RiFileTextLine,  title: 'Complete the Application',  desc: 'Fill in your project details, describe your AI solution, and demonstrate impact.' },
  { step: '04', icon: RiUploadLine,    title: 'Upload Supporting Docs',    desc: 'Attach your pitch deck, demo video, impact report, and any relevant evidence.' },
  { step: '05', icon: RiAwardLine,     title: 'Submit & Await Results',    desc: 'Review and submit before 31 March 2026. Our team will be in touch with next steps.' },
];

const requirements = [
  'AI-driven product, service, or research project',
  'Launched or deployed within the last 3 years',
  'Demonstrable real-world impact or traction',
  'Sri Lankan citizen or Sri Lanka-incorporated entity',
  'Commitment to ethical AI principles',
  'Complete application with required documentation',
];

const benefits = [
  { icon: '🏆', title: 'Cash Prizes',        desc: 'Substantial prize pool with awards for winners and runners-up in each category.' },
  { icon: '📡', title: 'Media Coverage',      desc: 'Featured in national media, tech publications, and our digital channels.' },
  { icon: '🤝', title: 'Investor Access',     desc: 'Exclusive networking with investors, VCs, and industry partners.' },
  { icon: '🎓', title: 'Mentorship',          desc: 'One-year mentorship package with senior technology and business leaders.' },
  { icon: '🌍', title: 'Global Exposure',     desc: 'Represent Sri Lanka at international AI forums and events.' },
  { icon: '🚀', title: 'Accelerator Access',  desc: 'Fast-track access to startup accelerator programmes and incubators.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const ApplyNow = () => (
  <div className="overflow-x-hidden">
    {/* ── Hero ── */}
    <section className="relative pt-36 pb-20 overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="section-container relative z-10 text-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-gold mb-6 inline-flex text-sm">
          🏆 Applications Open — Free to Apply
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight"
        >
          Apply for{' '}
          <span className="gradient-text-gold">AI Awards</span>
          <br />
          <span className="text-4xl sm:text-5xl lg:text-6xl">Sri Lanka 2026</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10"
        >
          Is your AI innovation transforming an industry? Nominate yourself or your organisation for Sri Lanka's most prestigious AI Awards.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/login">
            <Button variant="gold" size="lg">
              Start Application <RiArrowRightLine />
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <RiCalendarLine className="text-accent-400" />
            Deadline: 31 March 2026
          </div>
        </motion.div>
      </div>
    </section>

    {/* ── How to Apply ── */}
    <section className="section-py">
      <div className="section-container">
        <SectionHeader
          badge="Application Process"
          title="5 Simple Steps"
          highlight="to Apply"
          subtitle="Our streamlined application process makes it easy to showcase your AI innovation to the panel of expert judges."
        />
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-accent-500/60 via-accent-500/20 to-transparent" />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                variants={fadeUp}
                className="relative flex items-start gap-6 pl-4"
              >
                <div className="absolute left-0 top-3 w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center flex-shrink-0 shadow-glow border border-accent-500/30 z-10">
                  <step.icon className="text-white text-2xl" />
                </div>
                <div className="ml-16 glass-card p-6 !hover:transform-none flex-1">
                  <span className="text-accent-500 font-mono text-xs font-bold mb-1 block">{step.step}</span>
                  <h3 className="font-display font-bold text-white text-lg mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Requirements ── */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="badge-accent mb-4 inline-flex">Eligibility Requirements</span>
            <h2 className="font-display font-bold text-4xl text-white mb-6 leading-tight">
              Do You <span className="gradient-text">Qualify?</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              We welcome applications from a wide range of AI innovators. Review the requirements and apply if you meet the criteria.
            </p>
            <ul className="space-y-3">
              {requirements.map((r) => (
                <li key={r} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <RiCheckLine className="text-emerald-400 text-xs" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Benefits Grid */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {benefits.map((b) => (
              <motion.div key={b.title} variants={fadeUp} className="glass-card p-5">
                <span className="text-3xl mb-3 block">{b.icon}</span>
                <p className="font-display font-semibold text-white text-sm mb-1">{b.title}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Final CTA ── */}
    <section className="section-py">
      <div className="section-container text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 sm:p-16 max-w-3xl mx-auto border-gold-500/30"
        >
          <span className="badge-gold mb-6 inline-flex">Limited Time</span>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">
            Applications Close{' '}
            <span className="gradient-text-gold">31 March 2026</span>
          </h2>
          <p className="text-slate-400 text-base mb-8">
            Don't let your AI innovation go unrecognised. Apply today — it's completely free.
          </p>
          <Link to="/login">
            <Button variant="gold" size="lg">
              Register & Apply Now <RiArrowRightLine />
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-6">Already have an account? <Link to="/login" className="text-accent-400 hover:underline">Sign in here</Link></p>
        </motion.div>
      </div>
    </section>
  </div>
);

export default ApplyNow;
