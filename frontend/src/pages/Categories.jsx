import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiHeartPulseLine, RiBarChartLine, RiLeafLine, RiBrainLine,
  RiBuilding4Line, RiShieldLine, RiRocketLine, RiStore2Line,
  RiMicroscopeLine, RiLightbulbLine, RiArrowRightLine, RiCheckLine,
} from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const categories = [
  {
    id: 1,
    icon: RiHeartPulseLine,
    title: 'AI in Healthcare',
    desc: 'Innovations leveraging AI to enhance diagnostics, patient outcomes, drug discovery, or healthcare delivery across Sri Lanka.',
    criteria: ['Diagnostic or treatment AI tools', 'Patient data analytics', 'Telemedicine AI integration', 'Mental health solutions'],
    gradient: 'from-rose-500/25 to-pink-600/15',
    border: 'border-rose-500/40',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 border-rose-500/30',
    badge: 'Healthcare',
  },
  {
    id: 2,
    icon: RiBarChartLine,
    title: 'AI in Finance & FinTech',
    desc: 'AI-driven solutions for banking, insurance, investment, fraud detection, or financial inclusion in Sri Lanka\'s economy.',
    criteria: ['Fraud detection systems', 'Credit scoring AI', 'Robo-advisory platforms', 'Financial inclusion tools'],
    gradient: 'from-emerald-500/25 to-teal-600/15',
    border: 'border-emerald-500/40',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 border-emerald-500/30',
    badge: 'FinTech',
  },
  {
    id: 3,
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
    id: 4,
    icon: RiBrainLine,
    title: 'AI in Education',
    desc: 'Personalised learning, intelligent tutoring systems, and administrative AI transforming education quality in Sri Lanka.',
    criteria: ['Adaptive learning platforms', 'Student performance analytics', 'EdTech AI tools', 'Language learning AI'],
    gradient: 'from-purple-500/25 to-violet-600/15',
    border: 'border-purple-500/40',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15 border-purple-500/30',
    badge: 'EdTech',
  },
  {
    id: 5,
    icon: RiBuilding4Line,
    title: 'AI in Smart Cities & Infrastructure',
    desc: 'AI for urban planning, traffic management, energy optimisation, and public service delivery in Sri Lankan cities.',
    criteria: ['Smart traffic systems', 'Energy optimisation', 'Waste management AI', 'Urban planning tools'],
    gradient: 'from-blue-500/25 to-cyan-600/15',
    border: 'border-blue-500/40',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/15 border-blue-500/30',
    badge: 'Smart City',
  },
  {
    id: 6,
    icon: RiShieldLine,
    title: 'AI in Cybersecurity',
    desc: 'AI-powered threat detection, vulnerability assessment, and digital security solutions protecting Sri Lankan organisations.',
    criteria: ['Threat detection AI', 'Anomaly detection systems', 'Identity verification', 'Security automation'],
    gradient: 'from-orange-500/25 to-red-600/15',
    border: 'border-orange-500/40',
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/15 border-orange-500/30',
    badge: 'CyberSec',
  },
  {
    id: 7,
    icon: RiRocketLine,
    title: 'AI in Manufacturing & Industry',
    desc: 'Predictive maintenance, quality control, process automation, and supply chain AI for Sri Lanka\'s manufacturing sector.',
    criteria: ['Predictive maintenance', 'Quality inspection AI', 'Process optimisation', 'Industrial IoT + AI'],
    gradient: 'from-amber-500/25 to-yellow-600/15',
    border: 'border-amber-500/40',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 border-amber-500/30',
    badge: 'Industry 4.0',
  },
  {
    id: 8,
    icon: RiStore2Line,
    title: 'AI Innovation by SMEs',
    desc: 'Recognising small and medium enterprises that have successfully integrated AI into their products, services, or operations.',
    criteria: ['AI-powered products', 'Process automation', 'Customer experience AI', 'Operational efficiency'],
    gradient: 'from-fuchsia-500/25 to-pink-600/15',
    border: 'border-fuchsia-500/40',
    iconColor: 'text-fuchsia-400',
    iconBg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
    badge: 'SME Track',
  },
  {
    id: 9,
    icon: RiMicroscopeLine,
    title: 'AI Research Excellence',
    desc: 'Outstanding academic or industry research advancing the frontiers of AI with real-world applicability in Sri Lanka.',
    criteria: ['Published research papers', 'Novel AI algorithms', 'Applied AI research', 'Open source contributions'],
    gradient: 'from-sky-500/25 to-indigo-600/15',
    border: 'border-sky-500/40',
    iconColor: 'text-sky-400',
    iconBg: 'bg-sky-500/15 border-sky-500/30',
    badge: 'Research',
  },
  {
    id: 10,
    icon: RiLightbulbLine,
    title: 'AI Startup of the Year',
    desc: 'Sri Lanka\'s most promising AI-first startup demonstrating exceptional growth, product-market fit, and innovation potential.',
    criteria: ['Revenue or user growth', 'AI-core business model', 'Market disruption potential', 'Team & execution'],
    gradient: 'from-gold-400/25 to-orange-600/15',
    border: 'border-gold-500/40',
    iconColor: 'text-gold-400',
    iconBg: 'bg-gold-500/15 border-gold-500/30',
    badge: '⭐ Flagship',
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
          10 Award Tracks
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
