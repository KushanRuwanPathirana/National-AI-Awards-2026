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
    title: 'Core National Awards',
    desc: 'Recognising the most prestigious achievements in artificial intelligence that drive national strategy and large-scale transformation across Sri Lanka.',
    criteria: ['National impact & reach', 'Alignment with national AI strategy', 'Technical elegance', 'Ethical & standard compliance'],
    gradient: 'from-gold-500/25 to-orange-600/15',
    border: 'border-gold-500/40',
    iconColor: 'text-gold-400',
    iconBg: 'bg-gold-500/15 border-gold-500/30',
    badge: '⭐ Flagship',
  },
  {
    id: 2,
    icon: RiUserLine,
    title: 'Women in AI Leadership Award',
    desc: 'Honouring outstanding female leaders, researchers, and entrepreneurs driving innovation and leadership in the field of Artificial Intelligence.',
    criteria: ['Leadership & advocacy', 'Technical contribution', 'Mentorship & community impact', 'Innovation in AI application'],
    gradient: 'from-pink-500/25 to-rose-600/15',
    border: 'border-pink-500/40',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/15 border-pink-500/30',
    badge: 'Women in AI',
  },
  {
    id: 3,
    icon: RiRocketLine,
    title: 'Innovation & Future-Focused Awards',
    desc: 'Celebrating disruptive, forward-looking AI concepts and emerging research that pave the way for future technological breakthroughs.',
    criteria: ['Novelty of AI model/approach', 'Potential for disruption', 'Scalability & feasibility', 'Future market readiness'],
    gradient: 'from-purple-500/25 to-violet-600/15',
    border: 'border-purple-500/40',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/30',
    badge: 'Future Tech',
  },
  {
    id: 4,
    icon: RiLeafLine,
    title: 'AI in Agriculture',
    desc: 'Smart farming, crop monitoring, weather prediction, and supply chain optimisation powered by AI for Sri Lanka\'s agricultural sector.',
    criteria: ['Crop disease detection', 'Precision agriculture', 'Supply chain AI', 'Weather analytics'],
    gradient: 'from-green-500/25 to-lime-600/15',
    border: 'border-green-500/40',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/15 border-green-500/30',
    badge: 'AgriTech',
  },
  {
    id: 5,
    icon: RiBarChartLine,
    title: 'AI in Banking, Finance & Insurance',
    desc: 'AI-driven solutions for banking, insurance, investment, fraud detection, risk management, or financial inclusion in Sri Lanka\'s economy.',
    criteria: ['Fraud detection systems', 'Credit scoring AI', 'Robo-advisory platforms', 'Financial inclusion tools'],
    gradient: 'from-emerald-500/25 to-teal-600/15',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    badge: 'FinTech',
  },
  {
    id: 6,
    icon: RiHeartPulseLine,
    title: 'AI in Healthcare & Life Sciences',
    desc: 'Innovations leveraging AI to enhance diagnostics, patient outcomes, drug discovery, biological research, or healthcare delivery.',
    criteria: ['Diagnostic or treatment AI tools', 'Patient data analytics', 'Telemedicine AI integration', 'Mental health solutions'],
    gradient: 'from-rose-500/25 to-pink-600/15',
    border: 'border-rose-500/40',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/30',
    badge: 'Healthcare',
  },
  {
    id: 7,
    icon: RiGlobalLine,
    title: 'AI in Export Development',
    desc: 'Leveraging AI to scale international trade, optimize global logistics, analyze export markets, and elevate Sri Lanka\'s presence in global trade.',
    criteria: ['Supply chain optimization', 'Global market analytics', 'Automated trade processes', 'Export growth enablement'],
    gradient: 'from-blue-500/25 to-cyan-600/15',
    border: 'border-blue-500/40',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15 border-blue-500/30',
    badge: 'Export AI',
  },
  {
    id: 8,
    icon: RiBrainLine,
    title: 'AI in Education',
    desc: 'Personalised learning, intelligent tutoring systems, and administrative AI transforming education quality and accessibility in Sri Lanka.',
    criteria: ['Adaptive learning platforms', 'Student performance analytics', 'EdTech AI tools', 'Language learning AI'],
    gradient: 'from-sky-500/25 to-indigo-600/15',
    border: 'border-sky-500/40',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border-sky-500/30',
    badge: 'EdTech',
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
          8 Award Tracks
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
          Ten specialised tracks celebrating AI excellence across every major industry sector in Sri Lanka.
        </motion.p>
      </div>
    </section>

    {/* ── Categories Grid ── */}
    <section className="section-py">
      <div className="section-container">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={fadeUp}
              className={`glass-card p-8 border ${cat.border} group relative overflow-hidden`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl`} />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} border flex items-center justify-center`}>
                    <cat.icon className={`${cat.iconColor} text-2xl`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs font-mono">#{String(cat.id).padStart(2, '0')}</span>
                    {cat.badge === '⭐ Flagship' && (
                      <span className="badge-gold text-xs">{cat.badge}</span>
                    )}
                  </div>
                </div>

                {/* Title & desc */}
                <h2 className="font-display font-bold text-white text-xl mb-3">{cat.title}</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-5">{cat.desc}</p>

                {/* Criteria */}
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

                {/* Apply link */}
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
