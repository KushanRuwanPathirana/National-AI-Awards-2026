import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiHeartPulseLine, RiBarChartLine, RiLeafLine, RiBrainLine,
  RiBuilding4Line, RiShieldLine, RiRocketLine, RiStore2Line,
  RiMicroscopeLine, RiLightbulbLine, RiArrowRightLine, RiCheckLine,
  RiAwardLine, RiUserLine, RiGlobalLine,
} from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const categories = [
  {
    id: 1,
    icon: RiAwardLine,
    title: 'National AI Excellence Award',
    desc: 'The top award: best overall AI solution across all sectors.',
    criteria: ['Overall impact', 'Technical maturity', 'Scalability & sustainability'],
    gradient: 'from-gold-500/25 to-orange-600/15',
    border: 'border-gold-500/40',
    iconColor: 'text-gold-400',
    iconBg: 'bg-gold-500/15 border-gold-500/30',
  },
  {
    id: 2,
    icon: RiUserLine,
    title: 'National AI Leadership Excellence Award',
    desc: 'Sri Lanka AI Transformation Leader of the Year — individual recognition for outstanding leadership.',
    criteria: ['Leadership & vision', 'Transformation outcomes', 'Sector influence'],
    gradient: 'from-pink-500/25 to-rose-600/15',
    border: 'border-pink-500/40',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15 border-pink-500/30',
  },
  {
    id: 3,
    icon: RiGlobalLine,
    title: 'National AI Impact Excellence Award',
    desc: 'Government, societal, and economic transformation use cases demonstrating measurable public benefit.',
    criteria: ['Public sector impact', 'Societal benefit', 'Measurable outcomes'],
    gradient: 'from-emerald-500/25 to-teal-600/15',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
  },
  {
    id: 4,
    icon: RiGlobalLine,
    title: 'National AI Export Excellence Award',
    desc: 'Export growth, trade facilitation, supply chain optimization, and global market competitiveness.',
    criteria: ['Export enablement', 'Global scalability', 'Supply chain optimisation'],
    gradient: 'from-blue-500/25 to-cyan-600/15',
    border: 'border-blue-500/40',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15 border-blue-500/30',
  },

  // Industry & Sector Excellence
  {
    id: 5,
    icon: RiLeafLine,
    title: 'Best AI Solution in Agriculture',
    desc: 'Precision agriculture, smart farming, agri-tech innovation, and food security.',
    criteria: ['Precision farming', 'Crop analytics', 'Agri supply chain'],
    gradient: 'from-green-500/25 to-lime-600/15',
    border: 'border-green-500/40',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/15 border-green-500/30',
  },
  {
    id: 6,
    icon: RiBarChartLine,
    title: 'Best AI Solution in Banking, Finance & Insurance',
    desc: 'BFSI innovation and analytics across fraud detection, risk, and customer experience.',
    criteria: ['Fraud & risk', 'Customer impact', 'Regulatory alignment'],
    gradient: 'from-amber-500/25 to-yellow-600/15',
    border: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/30',
  },
  {
    id: 7,
    icon: RiHeartPulseLine,
    title: 'Best AI Solution in Healthcare & Life Sciences',
    desc: 'Patient care, diagnostics, hospital automation and life-sciences innovations.',
    criteria: ['Clinical impact', 'Safety & validation', 'Operational efficiency'],
    gradient: 'from-rose-500/25 to-pink-600/15',
    border: 'border-rose-500/40',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/30',
  },
  {
    id: 8,
    icon: RiGlobalLine,
    title: 'Best AI Solution in Export Development',
    desc: 'Solutions that accelerate export growth, trade facilitation and global market competitiveness.',
    criteria: ['Market analysis', 'Export enablement', 'Logistics optimisation'],
    gradient: 'from-sky-500/25 to-indigo-600/15',
    border: 'border-sky-500/40',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border-sky-500/30',
  },
  {
    id: 9,
    icon: RiBrainLine,
    title: 'Best AI Solution in Education',
    desc: 'AI solutions transforming teaching, learning, educational administration, and student outcomes.',
    criteria: ['Learner outcomes', 'Accessibility', 'Teaching innovation'],
    gradient: 'from-sky-500/25 to-indigo-600/15',
    border: 'border-sky-500/40',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border-sky-500/30',
  },

  // Innovation & Future-Focused
  {
    id: 10,
    icon: RiRocketLine,
    title: 'Best AI Startup / MSME Innovation',
    desc: 'High-growth, scalable AI startups and MSMEs demonstrating strong product-market fit.',
    criteria: ['Scalability', 'Market traction', 'Innovation'],
    gradient: 'from-purple-500/25 to-violet-600/15',
    border: 'border-purple-500/40',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/30',
  },
  {
    id: 11,
    icon: RiMicroscopeLine,
    title: 'Best Agentic AI Solution',
    desc: 'Copilots, LLMs, AI agents and automation delivering tangible productivity gains.',
    criteria: ['Agent safety', 'Utility & automation', 'User experience'],
    gradient: 'from-cyan-500/25 to-blue-600/15',
    border: 'border-cyan-500/40',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15 border-cyan-500/30',
  },
  {
    id: 12,
    icon: RiMicroscopeLine,
    title: 'Best Sinhala/Tamil AI & Localisation Innovation',
    desc: 'Strategic localisation innovations in Sinhala/Tamil that strengthen Sri Lanka\'s digital advantage.',
    criteria: ['Localization quality', 'Language coverage', 'Strategic impact'],
    gradient: 'from-emerald-500/25 to-teal-600/15',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
  },
  {
    id: 13,
    icon: RiMicroscopeLine,
    title: 'University AI Innovation',
    desc: 'Outstanding AI research, innovation, and solutions developed by universities and higher education institutions.',
    criteria: ['Research novelty', 'Societal relevance', 'Commercialisability'],
    gradient: 'from-indigo-500/25 to-violet-600/15',
    border: 'border-indigo-500/40',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 border-indigo-500/30',
  },
  {
    id: 14,
    icon: RiUserLine,
    title: 'Women in AI Leadership',
    desc: 'Recognizing women who are scaling AI solutions — individual award celebrating leadership and impact.',
    criteria: ['Leadership', 'Impact', 'Mentorship'],
    gradient: 'from-pink-500/25 to-rose-600/15',
    border: 'border-pink-500/40',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15 border-pink-500/30',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6 } },
};
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const Categories = () => (
  <div className="overflow-x-hidden">
    {/* ── Hero ── */}
    <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
      <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
      <div className="section-container relative z-10 text-center">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-accent mb-6 inline-flex">
          14 Awards
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6 leading-tight"
        >
          Award <span className="gradient-text">Categories</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto"
        >
          Fourteen awards across core national, industry, and innovation tracks celebrating AI excellence in Sri Lanka.
        </motion.p>
      </div>
    </section>

    {/* ── Categories Grid ── */}
    <section className="section-py">
      <div className="section-container">
        {/** Render grouped sections A/B/C **/}
        <div className="space-y-8">
          {[
            { key: 'A', title: 'Core National Awards', items: categories.slice(0, 4) },
            { key: 'B', title: 'Industry & Sector Excellence Awards', items: categories.slice(4, 9) },
            { key: 'C', title: 'Innovation & Future-Focused Awards', items: categories.slice(9, 14) },
          ].map((group) => (
            <div key={group.key}>
              <div className="mb-4">
                <h3 className="text-emerald-300 font-semibold text-sm">{group.key}. {group.title}</h3>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-6"
              >
                {group.items.map((cat) => (
                  <motion.div
                    key={cat.id}
                    variants={fadeUp}
                    className={`glass-card p-8 border ${cat.border} group relative overflow-hidden`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`} />

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-5">
                        <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} border flex items-center justify-center`}>
                          <cat.icon className={`${cat.iconColor} text-2xl`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs font-mono">#{String(cat.id).padStart(2, '0')}</span>
                        </div>
                      </div>

                      <h2 className="font-display font-bold text-white text-xl mb-3">{cat.title}</h2>
                      <p className="text-slate-400 text-sm leading-relaxed mb-5">{cat.desc}</p>

                      <div>
                        <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Key Criteria</p>
                        <ul className="grid grid-cols-2 gap-2">
                          {cat.criteria.map((c) => (
                            <li key={c} className="flex items-center gap-2 text-xs text-slate-300">
                              <RiCheckLine className={`${cat.iconColor} flex-shrink-0`} />
                              {c}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                        <span className="badge-green text-xs">Open for Applications</span>
                        <Link to="/apply" className={`${cat.iconColor} text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all`}>
                          Apply <RiArrowRightLine />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="section-py bg-surface-200/50">
      <div className="section-container text-center">
        <SectionHeader
          badge="Ready?"
          title="Pick Your Category &"
          highlight="Apply Today"
          subtitle="Applications are open until 31 March 2026. Submit your entry free of charge."
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

export default Categories;
