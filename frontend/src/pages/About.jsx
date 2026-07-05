import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApplyLink from '../components/shared/ApplyLink';
import {
  RiAwardLine, RiTeamLine, RiGlobalLine, RiGovernmentLine,
  RiArrowRightLine, RiCheckLine, RiBrainLine,
} from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const objectives = [
  'Recognise and celebrate Sri Lankan AI innovators',
  'Foster a culture of innovation and research excellence',
  'Connect innovators with investors and industry leaders',
  'Promote ethical and responsible AI development',
  'Inspire the next generation of AI talent',
  'Showcase Sri Lanka on the global AI map',
];

const organisers = [
  { name: 'ICTA', role: 'Information & Communication Technology Agency' },
  { name: 'SLASSCOM', role: 'Sri Lanka Association of Software & Service Companies' },
  { name: 'SLT-Mobitel', role: 'National Telecommunications Operator' },
  { name: 'University of Colombo', role: 'Academic Partner' },
  { name: 'Ministry of Technology', role: 'Government Partner' },
  { name: 'AI Society of Sri Lanka', role: 'Technical Advisory Body' },
];

const About = () => (
  <div className="overflow-x-hidden">
    {/* ── Hero ── */}
    <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />
      <div className="section-container relative z-10 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="badge-accent mb-6 inline-flex"
        >
          About the Programme
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight"
        >
          About <span className="gradient-text">AI Awards</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          Sri Lanka's most prestigious recognition programme for Artificial Intelligence innovation — 
          uniting government, industry, and academia to celebrate our nation's brightest minds.
        </motion.p>
      </div>
    </section>

    {/* ── Mission ── */}
    <section className="section-py">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="badge-accent mb-4 inline-flex">Our Mission</span>
            <h2 className="font-display font-bold text-4xl text-white mb-6 leading-tight">
              Accelerating Sri Lanka's{' '}
              <span className="gradient-text">AI Future</span>
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-4">
              Launched by Sri Lanka's leading technology and government bodies, the National AI Awards 
              exists to shine a spotlight on the extraordinary AI innovations happening across our island 
              — in hospitals, farms, classrooms, and factories.
            </p>
            <p className="text-slate-400 text-base leading-relaxed mb-8">
              We believe that by recognising excellence today, we inspire the trailblazers of tomorrow. 
              This programme is more than an awards night — it is a movement to build a sustainable, 
              inclusive AI ecosystem in Sri Lanka.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
                <RiBrainLine className="text-white text-3xl" />
              </div>
              <div>
                <p className="text-white font-semibold">Est. 2024</p>
                <p className="text-slate-400 text-sm">Sri Lanka's first national AI Awards</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <h3 className="font-display font-bold text-white text-xl mb-6 flex items-center gap-3">
              <RiAwardLine className="text-accent-400" /> Programme Objectives
            </h3>
            <ul className="space-y-4">
              {objectives.map((obj) => (
                <motion.li key={obj} variants={fadeUp} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-accent-500/20 border border-accent-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RiCheckLine className="text-accent-400 text-xs" />
                  </span>
                  <p className="text-slate-300 text-sm">{obj}</p>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>

    {/* ── Organisers ── */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container">
        <SectionHeader
          badge="Partners & Organisers"
          title="Backed by"
          highlight="Sri Lanka's Best"
          subtitle="The National AI Awards is a collaborative initiative between government, industry, and academia."
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {organisers.map((org) => (
            <motion.div key={org.name} variants={fadeUp} className="glass-card p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent/20 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
                <RiGovernmentLine className="text-accent-400 text-xl" />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm">{org.name}</p>
                <p className="text-slate-400 text-xs mt-0.5 leading-snug">{org.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── Impact Numbers ── */}
    <section className="section-py">
      <div className="section-container">
        <SectionHeader
          badge="Our Impact"
          title="Numbers That"
          highlight="Tell the Story"
          subtitle="Since our inaugural edition, the AI Awards has grown into Sri Lanka's foremost technology recognition platform."
        />
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { value: '2', label: 'Years Running', suffix: '' },
            { value: '300+', label: 'Applications Received', suffix: '' },
            { value: '40+', label: 'Companies Recognised', suffix: '' },
            { value: '15', label: 'Industries Represented', suffix: '' },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="glass-card p-8 text-center">
              <p className="gradient-text-gold font-display font-black text-4xl sm:text-5xl">{s.value}</p>
              <p className="text-slate-400 text-sm mt-2">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-6">
            Be Part of Sri Lanka's{' '}
            <span className="gradient-text">AI Story</span>
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            Apply today and let your innovation represent what Sri Lanka is capable of achieving.
          </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
            <ApplyLink><Button variant="gold" size="lg">Apply Now <RiArrowRightLine /></Button></ApplyLink>
            <Link to="/categories"><Button variant="ghost" size="lg">View Categories</Button></Link>
          </div>
        </motion.div>
      </div>
    </section>
  </div>
);

export default About;
