import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ApplyLink from '../components/shared/ApplyLink';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  RiAwardLine, RiRocketLine, RiTeamLine, RiGlobalLine,
  RiBrainLine, RiHeartPulseLine, RiBuilding2Line, RiBuilding4Line, RiLeafLine,
  RiShieldLine, RiBarChartLine, RiStarLine, RiArrowRightLine,
  RiCheckLine, RiCalendarLine, RiPhoneLine, RiLightbulbLine,
  RiMicroscopeLine, RiCameraLensLine, RiTranslate2, RiCommunityLine,
  RiUserLine, RiImageLine,
} from 'react-icons/ri';
import { FaQuoteLeft } from 'react-icons/fa';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';
import heroBackground from '../assets/ai-awards-hero-bg.png';
import { awardImageService } from '../services/awardImage.service';
import { buildAssetUrl } from '../services/api';


// ─── Data ──────────────────────────────────────────────────────────────────────

const stats = [
  { value: '10+', label: 'Award Categories' },
  { value: '500+', label: 'Expected Applications' },
  { value: '20+', label: 'Expert Judges' },
];

const categories = [
  // A. National AI Trailblazer Awards
  { icon: RiAwardLine, title: 'National AI Excellence Award', color: 'from-gold-500/20 to-orange-500/10', border: 'border-gold-500/30' },
  { icon: RiUserLine, title: 'National AI Leadership Excellence Award', color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/30' },
  { icon: RiGlobalLine, title: 'National AI Impact Excellence Award', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' },
  { icon: RiGlobalLine, title: 'National AI Export Excellence Award', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/30' },

  // B. Industry & Sector Excellence Awards
  { icon: RiLeafLine, title: 'Best AI Solution in Agriculture', color: 'from-green-500/20 to-lime-500/10', border: 'border-green-500/30' },
  { icon: RiBarChartLine, title: 'Best AI Solution in Banking, Finance & Insurance', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30' },
  { icon: RiHeartPulseLine, title: 'Best AI Solution in Healthcare & Life Sciences', color: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30' },
  { icon: RiBuilding2Line, title: 'Best AI Solution in Manufacturing & Industry 5.0', color: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30' },
  { icon: RiBrainLine, title: 'Best AI Solution in Education', color: 'from-sky-500/20 to-indigo-500/10', border: 'border-sky-500/30' },
  { icon: RiCameraLensLine, title: 'Best AI Solution in Media', color: 'from-rose-500/20 to-orange-500/10', border: 'border-rose-500/30' },

  // C. Innovation & Future-Focused Awards
  { icon: RiRocketLine, title: 'Best AI Startup / MSME Innovation', color: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/30' },
  { icon: RiMicroscopeLine, title: 'Best Agentic AI Solution', color: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30' },
  { icon: RiTranslate2, title: 'Best Sinhala/Tamil AI & Localisation Innovation', color: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30' },
  { icon: RiCommunityLine, title: 'University AI Innovation', color: 'from-indigo-500/20 to-violet-500/10', border: 'border-indigo-500/30' },
  { icon: RiUserLine, title: 'Women in AI Leadership', color: 'from-pink-500/20 to-rose-500/10', border: 'border-pink-500/30' },
];

const whyParticipate = [
  { icon: RiAwardLine, title: 'National Recognition', desc: 'Gain prestigious recognition at Sri Lanka\'s premier AI awards programme.' },
  { icon: RiTeamLine, title: 'Expert Networking', desc: 'Connect with industry leaders, investors, and AI pioneers across the island.' },
  { icon: RiRocketLine, title: 'Scale Your Innovation', desc: 'Receive mentorship, media coverage, and resources to accelerate your growth.' },
  { icon: RiGlobalLine, title: 'Global Spotlight', desc: 'Represent Sri Lanka on the global AI stage and attract international partners.' },
  { icon: RiLightbulbLine, title: 'Inspiration & Insights', desc: 'Learn from world-class keynotes, workshops, and panel discussions.' },
  { icon: RiStarLine, title: 'Cash Prizes & Trophies', desc: 'Win substantial cash awards plus coveted trophies recognising your excellence.' },
];

const eligibility = [
  'Sri Lankan citizen or organisation incorporated in Sri Lanka',
  'AI-driven solution developed within the last 3 years',
  'Demonstrable real-world impact or commercial traction',
  'Submission of a complete application with supporting documentation',
  'Adherence to ethical AI principles and data privacy regulations',
];

const timeline = [
  { date: '15 July 2026', event: 'Application Calling', status: 'active' },
  { date: '15 August 2026', event: 'Application Deadline', status: 'upcoming' },
  { date: 'First Week of August', event: 'Initial Screening', status: 'upcoming' },
  { date: 'Second Week of August', event: 'Face-to-Face Evaluation', status: 'upcoming' },
  { date: 'Last Week of August', event: 'Final Announcements', status: 'upcoming' },
];

const testimonials = [
  {
    quote: 'Winning the AI Awards opened doors we never imagined. The exposure alone was worth a year of marketing efforts.',
    name: 'Kavindi Perera',
    role: 'CEO, MediAI Solutions',
    initial: 'K',
    color: 'from-accent-500 to-purple-600',
  },
  {
    quote: 'The judging process was incredibly thorough and fair. The feedback we received helped us refine our product significantly.',
    name: 'Ruwan Jayawardena',
    role: 'CTO, AgriSense Lanka',
    initial: 'R',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    quote: 'Being part of the AI Awards community gave us access to mentors who accelerated our go-to-market strategy by months.',
    name: 'Thilini Ratnayake',
    role: 'Co-Founder, EduBot LK',
    initial: 'T',
    color: 'from-gold-500 to-orange-500',
  },
];

const faqs = [
  { q: 'Who can apply for the AI Awards?', a: 'Any Sri Lankan individual, startup, SME, corporate, or research institution with an AI-driven solution is eligible to apply.' },
  { q: 'Is there an application fee?', a: 'Yes. The National AI Awards Sri Lanka has an application fee of LKR 25,000. However, submissions under the University AI Innovation Category are completely free of charge.' },
  { q: 'Can I apply in multiple categories?', a: 'Yes, you may apply in up to 2 categories if your solution genuinely qualifies for both.' },
  { q: 'How are winners selected?', a: 'A panel of independent expert judges evaluates each submission based on innovation, impact, scalability, and technical excellence.' },
  { q: 'When will winners be announced?', a: 'Finalists will be announced in June 2026, with winners revealed at the Awards Ceremony on 25 July 2026.' },
];

const sponsors = ['SLT-Mobitel', 'Dialog', 'Bank of Ceylon', 'John Keells', 'Hayleys', 'ICTA'];

// ─── Animation Variants ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ─── Component ─────────────────────────────────────────────────────────────────
const Home = () => {
  const heroRef = useRef(null);
  const [homepageImages, setHomepageImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    fetchHomepageImages();
  }, []);

  const fetchHomepageImages = async () => {
    try {
      setImagesLoading(true);
      const response = await awardImageService.getHomepageImages(12);
      setHomepageImages(response.data.data.images);
    } catch (error) {
      console.error('Error fetching homepage images:', error);
    } finally {
      setImagesLoading(false);
    }
  };

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════ HERO ═══════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Background layers */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBackground})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-950/45 via-navy-950/35 to-navy-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,22,40,0.34)_52%,rgba(10,22,40,0.9)_100%)]" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="section-container relative z-10 pt-32 pb-20 text-center"
        >
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-display font-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[1.05] text-white mb-6 text-balance"
          >
            Celebrating{' '}
            <span className="gradient-text">AI Excellence</span>
            <br />in Sri Lanka
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The National AI Awards recognise groundbreaking innovations that harness the power of
            Artificial Intelligence to transform industries and improve lives across Sri Lanka.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <ApplyLink>
              <Button variant="gold" size="lg" className="shadow-glow-gold">
                Apply Now
                <RiArrowRightLine className="text-lg" />
              </Button>
            </ApplyLink>
            <Link to="/about">
              <Button variant="ghost" size="lg">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass-card p-5 text-center !hover:transform-none">
                <p className="gradient-text-gold font-display font-black text-3xl sm:text-4xl">{s.value}</p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <p className="text-slate-500 text-xs uppercase tracking-widest">Scroll</p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-slate-600 flex items-start justify-center pt-1"
          >
            <div className="w-1 h-2 rounded-full bg-accent-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ INTRO ══════════════════════════════════════════════════ */}
      <section className="section-py relative">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <span className="badge-accent mb-4 inline-flex">About the Programme</span>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-6 leading-tight">
                Powering Sri Lanka's{' '}
                <span className="gradient-text">AI Revolution</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-4">
                The National AI Awards Sri Lanka is the country's most prestigious technology recognition
                programme, dedicated to honouring individuals and organisations that are leveraging
                Artificial Intelligence to solve real-world challenges.
              </p>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                Organised in partnership with leading government bodies, industry associations, and
                academic institutions, this programme serves as a catalyst for innovation and digital
                transformation in Sri Lanka's economy.
              </p>
              <Link to="/about">
                <Button variant="primary">
                  Discover Our Story <RiArrowRightLine />
                </Button>
              </Link>
            </motion.div>

            {/* Feature grid */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: RiBrainLine, label: 'AI Innovation', value: '10+ Categories' },
                { icon: RiTeamLine, label: 'Expert Panel', value: '20+ Judges' },
                { icon: RiAwardLine, label: 'Recognition', value: 'National Level' },
                { icon: RiGlobalLine, label: 'Impact', value: 'Cross-Industry' },
              ].map((item) => (
                <motion.div key={item.label} variants={fadeUp} className="glass-card p-6">
                  <item.icon className="text-accent-400 text-3xl mb-3" />
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-slate-400 text-xs mt-1">{item.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY PARTICIPATE ════════════════════════════════════════ */}
      <section className="section-py relative bg-surface-200/50">
        <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
        <div className="section-container relative">
          <SectionHeader
            badge="Why Participate"
            title="Benefits That Go"
            highlight="Beyond the Trophy"
            subtitle="Winning the National AI Awards is just the beginning. The programme offers transformative value at every stage of the journey."
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {whyParticipate.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className="glass-card p-7 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mb-4 group-hover:bg-accent-500/25 transition-colors">
                  <item.icon className="text-accent-400 text-2xl" />
                </div>
                <h3 className="font-display font-semibold text-white text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ CATEGORIES PREVIEW ════════════════════════════════════ */}
      <section className="section-py">
        <div className="section-container">
          <SectionHeader
            badge="Award Categories"
            title="15 Tracks of"
            highlight="Excellence"
            subtitle="From national strategy to healthcare and education — we celebrate AI innovation across every sector driving Sri Lanka forward."
          />

          <div className="glass-card p-6 sm:p-8 border border-slate-700/60">

            {/* ── Group Headings (A, B, C) ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6 mb-10"
            >
              {[
                {
                  key: 'A',
                  title: 'National AI Trailblazer Awards',
                  icon: RiAwardLine,
                  color: 'from-gold-500/20 to-orange-500/10',
                  border: 'border-gold-500/30',
                },
                {
                  key: 'B',
                  title: 'Industry & Sector Excellence Awards',
                  icon: RiBuilding4Line,
                  color: 'from-emerald-500/20 to-teal-500/10',
                  border: 'border-emerald-500/30',
                },
                {
                  key: 'C',
                  title: 'Innovation & Future-Focused Awards',
                  icon: RiRocketLine,
                  color: 'from-purple-500/20 to-violet-500/10',
                  border: 'border-purple-500/30',
                },
              ].map((group) => (
                <motion.div
                  key={group.key}
                  variants={fadeUp}
                  className={`glass-card p-6 border ${group.border} rounded-2xl`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${group.color} flex items-center justify-center mb-4 border ${group.border}`}
                  >
                    <group.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg leading-snug">
                    {group.key}. {group.title}
                  </h3>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid md:grid-cols-3 gap-10">

              {/* A. National AI Trailblazer Awards */}
              <div>
                <div className="space-y-3">
                  {[
                    'National AI Excellence Award',
                    'National AI Leadership Excellence Award',
                    'National AI Impact Excellence Award',
                    'National AI Export Excellence Award',
                  ].map((title) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-slate-700/60 bg-surface-100/50 px-4 py-3"
                    >
                      <p className="text-slate-200 text-sm leading-snug">{title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* B. Industry & Sector Excellence Awards */}
              <div>
                <div className="space-y-3">
                  {[
                    'Best AI Solution in Agriculture',
                    'Best AI Solution in Banking, Finance & Insurance',
                    'Best AI Solution in Healthcare & Life Sciences',
                    'Best AI Solution in Manufacturing & Industry 5.0',
                    'Best AI Solution in Education',
                    'Best AI Solution in Media',
                  ].map((title) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-slate-700/60 bg-surface-100/50 px-4 py-3"
                    >
                      <p className="text-slate-200 text-sm leading-snug">{title}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* C. Innovation & Future-Focused Awards */}
              <div>
                <div className="space-y-3">
                  {[
                    'Best AI Startup / MSME Innovation',
                    'Best Agentic AI Solution',
                    'Best Sinhala/Tamil AI & Localisation Innovation',
                    'University AI Innovation',
                    'Women in AI Leadership',
                  ].map((title) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-slate-700/60 bg-surface-100/50 px-4 py-3"
                    >
                      <p className="text-slate-200 text-sm leading-snug">{title}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link to="/categories">
                <Button variant="ghost">
                  View All 15 Categories <RiArrowRightLine />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ ELIGIBILITY ════════════════════════════════════════════ */}
      <section className="section-py bg-surface-200/50">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <ul className="space-y-4">
                {eligibility.map((item) => (
                  <motion.li
                    key={item}
                    variants={fadeUp}
                    className="flex items-start gap-4 glass-card p-4 !hover:transform-none"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <RiCheckLine className="text-emerald-400 text-sm" />
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{item}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="badge-accent mb-4 inline-flex">Eligibility Criteria</span>
              <h2 className="font-display font-bold text-4xl lg:text-5xl text-white mb-6 leading-tight">
                Are You{' '}
                <span className="gradient-text">Eligible?</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                The National AI Awards welcomes applications from a diverse range of innovators.
                Review the key eligibility requirements below to see if your AI-driven solution qualifies.
              </p>
              <ApplyLink>
                <Button variant="gold">
                  Start Your Application <RiArrowRightLine />
                </Button>
              </ApplyLink>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TIMELINE ═══════════════════════════════════════════════ */}
      <section className="section-py">
        <div className="section-container">
          <SectionHeader
            badge="Programme Timeline"
            title="Key Dates &"
            highlight="Milestones"
            subtitle="Plan your journey with our structured timeline from application to the grand awards ceremony."
          />
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
                <div className={`absolute left-8 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${item.status === 'done'
                  ? 'bg-emerald-500 border-emerald-400'
                  : item.status === 'active'
                    ? 'bg-accent-500 border-accent-400 shadow-glow'
                    : 'bg-surface-100 border-slate-600'
                  }`} />

                {/* Card */}
                <div className={`ml-16 sm:ml-0 glass-card p-5 sm:w-5/12 !hover:transform-none ${item.status === 'active' ? 'border-accent-500/50' : ''
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <RiCalendarLine className="text-accent-400 text-sm" />
                    <span className="text-accent-400 text-xs font-medium">{item.date}</span>
                  </div>
                  <p className={`font-display font-semibold text-sm ${item.status === 'done' ? 'text-emerald-300' :
                    item.status === 'active' ? 'text-white' : 'text-slate-300'
                    }`}>
                    {item.event}
                  </p>
                  {item.status === 'done' && <span className="badge-green mt-2 text-xs">Completed</span>}
                  {item.status === 'active' && <span className="badge-accent mt-2 text-xs">Current</span>}
                </div>

                {/* Spacer for opposite side */}
                <div className="hidden sm:block sm:w-5/12" />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/timeline">
              <Button variant="ghost">View Full Timeline <RiArrowRightLine /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ SPONSORS ═══════════════════════════════════════════════ */}
      <section className="section-py bg-surface-200/50">
        <div className="section-container">
          <SectionHeader
            badge="Partners & Sponsors"
            title="Backed by"
            highlight="Industry Leaders"
            subtitle="Sri Lanka's foremost organisations stand behind the National AI Awards."
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {sponsors.map((sponsor) => (
              <div
                key={sponsor}
                className="glass-card px-8 py-5 !hover:transform-none"
              >
                <p className="font-display font-bold text-slate-300 text-sm tracking-wide">{sponsor}</p>
              </div>
            ))}
            <div className="glass-card px-8 py-5 border-dashed border-accent-500/30 !hover:transform-none">
              <p className="text-accent-400 text-sm font-medium">+ Become a Sponsor</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ AWARD IMAGES ═══════════════════════════════════════════ */}
      <section className="section-py">
        <div className="section-container">
          <SectionHeader
            badge="Gallery"
            title="Award"
            highlight="Images"
            subtitle="Explore official images from the AI Awards, including launch events, judges, keynote speakers, networking sessions, award ceremony highlights, media coverage, and other memorable moments."
          />
          
          {imagesLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : homepageImages.length === 0 ? (
            <div className="text-center py-20">
              <RiImageLine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No images available yet</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for event highlights</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {homepageImages.slice(0, 8).map((image, index) => (
                  <motion.div
                    key={image._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-square"
                  >
                    <img
                      src={buildAssetUrl(image.imageUrl)}
                      alt={image.altText || image.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-medium text-sm line-clamp-1">{image.title}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/award-images">
                  <Button variant="ghost">
                    View Full Gallery <RiArrowRightLine />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════════════ FAQ ════════════════════════════════════════════════════ */}
      <section className="section-py bg-surface-200/50">
        <div className="section-container">
          <SectionHeader
            badge="FAQs"
            title="Frequently Asked"
            highlight="Questions"
            subtitle="Everything you need to know about the National AI Awards programme."
          />
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={faq.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card overflow-hidden group !hover:transform-none"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-display font-semibold text-white text-sm pr-4">{faq.q}</span>
                  <span className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0 text-accent-400 text-sm transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-6 pb-6">
                  <div className="divider-glow mb-4" />
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </motion.details>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/faqs">
              <Button variant="ghost">View All FAQs <RiArrowRightLine /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA CONTACT ════════════════════════════════════════════ */}
      <section className="section-py">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-600/30 via-surface-100 to-gold-500/10 border border-accent-500/20" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-500/60 to-transparent" />
            <div className="relative z-10 p-12 sm:p-16 text-center">
              <span className="badge-accent mb-6 inline-flex">Ready to Apply?</span>
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
                Your AI Innovation{' '}
                <span className="gradient-text-gold">Deserves Recognition</span>
              </h2>
              <p className="text-slate-300 text-lg max-w-xl mx-auto mb-10">
                Join hundreds of Sri Lanka's brightest minds competing for the most prestigious AI awards in the country.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <ApplyLink>
                  <Button variant="gold" size="lg">
                    Apply Now <RiArrowRightLine />
                  </Button>
                </ApplyLink>
                <Link to="/contact">
                  <Button variant="ghost" size="lg">
                    <RiPhoneLine /> Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
