import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiSearchLine, RiFilterLine, RiLinkedinBoxFill, RiGlobalLine,
  RiCloseLine, RiArrowRightLine, RiUserLine, RiStarLine,
  RiBuildingLine, RiMapPinLine, RiBriefcaseLine, RiGraduationCapLine,
  RiTeamLine, RiAwardLine, RiShieldUserLine, RiArrowDownSLine
} from 'react-icons/ri';
import Button from '../components/shared/Button';
import JudgeAvatar from '../components/judge/JudgeAvatar';
import judgeService from '../services/judge.service';

const judgesData = []; // empty fallback export

// All available expertise options
const expertiseOptions = [
  'Government', 'Academia', 'Industry', 'Startup', 'Healthcare',
  'Agriculture', 'Finance', 'AI Research', 'Venture Capital',
  'Standards', 'Legal', 'Telecom'
];

// Available categories matching structure
const categoryMap = [
  'All',
  'Core National Awards & Women in AI Leadership',
  'Innovation & Future-Focused Awards',
  'AI in Agriculture',
  'AI in Banking, Finance & Insurance',
  'AI in Healthcare & Life Sciences',
  'AI in Manufacturing & Industry 5.0',
  'AI in Education',
  'AI in Media'
];

export { judgesData };

const JudgePortal = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [sortBy, setSortBy] = useState('Alphabetical');
  const [activeModalJudge, setActiveModalJudge] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchJudges = async () => {
      try {
        setLoading(true);
        // Fetch all active judges
        const response = await judgeService.getJudges({ all: 'true', status: 'Active' });
        setJudges(response.data?.data?.judges || []);
      } catch (err) {
        console.error('Error fetching judges:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJudges();
  }, []);

  // Filter & Sort Logic
  const filteredJudges = useMemo(() => {
    let result = [...judges];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(judge =>
        (judge.name || judge.fullName || '').toLowerCase().includes(query) ||
        (judge.organization || '').toLowerCase().includes(query) ||
        (judge.designation || '').toLowerCase().includes(query) ||
        (judge.category || '').toLowerCase().includes(query) ||
        (judge.expertise || []).some(exp => exp.toLowerCase().includes(query))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(judge => judge.category === selectedCategory);
    }

    // Filter by Expertise
    if (selectedExpertise !== 'All') {
      result = result.filter(judge => (judge.expertise || []).includes(selectedExpertise));
    }

    // Filter by Country type (Local / International)
    if (selectedCountry !== 'All') {
      if (selectedCountry === 'International') {
        result = result.filter(judge => judge.country !== 'Sri Lanka');
      } else {
        result = result.filter(judge => judge.country === 'Sri Lanka');
      }
    }

    // Sort Judges
    if (sortBy === 'Alphabetical') {
      result.sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''));
    } else if (sortBy === 'Experience') {
      result.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    } else if (sortBy === 'Category') {
      result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    }

    return result;
  }, [judges, searchQuery, selectedCategory, selectedExpertise, selectedCountry, sortBy]);

  // Separate Grand Jury for display
  const grandJuryJudges = useMemo(() => {
    return judges.filter(judge => judge.isGrandJury);
  }, [judges]);

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 overflow-x-hidden font-sans relative selection:bg-accent-500/30 selection:text-white">
      {/* ── Background Mesh ── */}
      <div className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-accent-500/10 to-transparent blur-[150px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-[150px]" />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-24 pb-16 overflow-hidden z-10 border-b border-white/5 bg-gradient-hero">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center">

          {/* Header Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-4"
          >
            <RiShieldUserLine className="text-sm" /> Expert Jury Panel
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]"
          >
            Meet the Experts <br />
            Shaping Sri Lanka's <br />
            <span className="gradient-text">AI Future</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed mt-6"
          >
            Our distinguished judging panel consists of nationally and internationally recognized leaders from academia, government, industry, research, venture capital, and innovation.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/5 justify-center"
          >
            <div>
              <p className="font-display font-black text-3xl text-accent-400">40+</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Judges Joined</p>
            </div>
            <div>
              <p className="font-display font-black text-3xl text-purple-400">6</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Categories</p>
            </div>
            <div>
              <p className="font-display font-black text-3xl text-cyan-400">Global</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Representation</p>
            </div>
            <div>
              <p className="font-display font-bold text-xs text-white leading-tight">Gov • Academia • Industry</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Ecosystem Sectors</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-8"
          >
            <a href="#judges-grid-section">
              <Button variant="primary" className="hover:shadow-glow text-white font-semibold rounded-2xl px-8 py-3.5">
                Explore Judges
              </Button>
            </a>
            <Link to="/categories">
              <Button variant="ghost" className="border border-white/10 text-slate-300 hover:bg-white/5 rounded-2xl px-6 py-3.5 flex items-center gap-2">
                View Award Categories <RiArrowRightLine />
              </Button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ── Main Interactive Section ── */}
      <span id="judges-grid-section" />
      <section className="py-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider">
            Judges Directory
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Judges Registry & Domain Panels
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Search and filter through our full lineup of panel experts by name, industry expertise, organization, and award categories.
          </p>
        </div>

        {/* Sticky Search and Filters Container */}
        <div className="sticky top-20 bg-surface-200/80 backdrop-blur-md z-30 p-4 border border-white/10 shadow-card rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between transition-all duration-300">
          <div className="relative w-full md:w-96">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
            <input
              type="text"
              placeholder="Search by name, expertise, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 text-sm text-white placeholder-slate-500 bg-surface-100/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            {/* Quick Toggle advanced filter drawer */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${showFilters || selectedExpertise !== 'All' || selectedCountry !== 'All'
                ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                : 'bg-surface-100 border-white/10 text-slate-300 hover:bg-surface-50'
                }`}
            >
              <RiFilterLine className="text-base" /> Advanced Filters
              {(selectedExpertise !== 'All' || selectedCountry !== 'All') && (
                <span className="w-2 h-2 rounded-full bg-accent-500" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center gap-2 bg-surface-100 border border-white/10 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400">
              <span>Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent focus:outline-none text-white cursor-pointer font-bold"
              >
                <option value="Alphabetical">Alphabetical</option>
                <option value="Experience">Years Experience</option>
                <option value="Category">Award Category</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropdown filters tray */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8 p-6 bg-surface-100/40 rounded-2xl border border-white/10 grid sm:grid-cols-2 md:grid-cols-3 gap-6"
            >
              {/* Expertise selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Expertise Area</label>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                >
                  <option value="All">All Expertise Domains</option>
                  {expertiseOptions.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>

              {/* Country Type selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location Type</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-surface-200 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500"
                >
                  <option value="All">All Judges (Sri Lanka + Global)</option>
                  <option value="Local">Sri Lankan Jury Panel</option>
                  <option value="International">International Jury Panel</option>
                </select>
              </div>

              {/* Reset button wrapper */}
              <div className="flex items-end justify-end">
                <button
                  onClick={() => {
                    setSelectedExpertise('All');
                    setSelectedCountry('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-400 hover:text-red-500 font-bold hover:underline mb-2"
                >
                  Clear Active Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Award Categories Navigation Tabs */}
        <div className="mb-12 border-b border-white/10 flex items-center justify-start overflow-x-auto pb-4 gap-2 scrollbar-none">
          {categoryMap.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedCategory === cat
                ? 'bg-gradient-accent text-white shadow-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {cat === 'All' ? 'All Award Categories' : cat}
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {loading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="glass-card p-6 flex flex-col items-center text-center border border-white/5 animate-pulse h-full">
                    <div className="w-24 h-24 rounded-full bg-slate-800 flex-shrink-0" />
                    <div className="h-4 bg-slate-800 rounded w-2/3 mt-5" />
                    <div className="h-3 bg-slate-800 rounded w-1/2 mt-2" />
                    <div className="h-3 bg-slate-800 rounded w-1/3 mt-1" />
                    <div className="h-6 bg-slate-800 rounded-full w-24 mt-6" />
                  </div>
                ))
              ) : (
                filteredJudges.map((judge) => (
                  <Link key={judge._id || judge.id} to={`/judge-portal/${judge._id || judge.id}`}>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="glass-card p-6 flex flex-col items-center text-center cursor-pointer border border-white/10 hover:border-accent-500/50 hover:shadow-glow transition-all duration-300 group h-full"
                    >
                      {/* Circular Portrait with Glowing Border */}
                      <JudgeAvatar judge={judge} variant="card" />

                      {/* Name */}
                      <h3 className="font-display font-bold text-white text-lg mt-5 group-hover:text-accent-400 transition-colors duration-300 leading-tight">
                        {judge.fullName || judge.name}
                      </h3>

                      {/* Designation/Role */}
                      <p className="text-accent-400 text-xs font-semibold mt-2">
                        {judge.designation}
                      </p>

                      {/* Company */}
                      <p className="text-slate-400 text-xs mt-1 truncate max-w-full">
                        {judge.organization}
                      </p>

                      {/* Pill Badge at the Bottom */}
                      <div className="mt-6">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full border ${judge.isGrandJury
                          ? 'border-gold-500/30 text-gold-400 bg-gold-500/10'
                          : 'border-accent-500/30 text-accent-400 bg-accent-500/10'
                          }`}>
                          {judge.isGrandJury ? 'Grand Jury' : 'Panelist'}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Empty Results Placeholder */}
          {filteredJudges.length === 0 && (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-100 border border-white/10 flex items-center justify-center mx-auto text-slate-400 text-2xl">
                <RiUserLine />
              </div>
              <h3 className="font-display font-bold text-slate-300 text-lg">No Judges Found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                We couldn't find any judges matching your current search parameters. Try expanding your search queries or clearing advanced filters.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedExpertise('All');
                  setSelectedCountry('All');
                  setSearchQuery('');
                }}
                className="text-sm text-accent-400 hover:text-accent-300 font-bold hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Judge Profile Details Modal ── */}
      <AnimatePresence>
        {activeModalJudge && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalJudge(null)}
              className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
            />

            {/* Modal Card Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="relative w-full max-w-2xl bg-surface-200 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto z-10 p-8 space-y-6 text-slate-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModalJudge(null)}
                className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-20"
              >
                <RiCloseLine className="text-xl" />
              </button>

              {/* Header profile details */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <JudgeAvatar judge={activeModalJudge} variant="modal" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-extrabold text-2xl text-white leading-tight">
                      {activeModalJudge.fullName || activeModalJudge.name}
                    </h2>
                    {activeModalJudge.isGrandJury && (
                      <span className="bg-gold-500/10 text-gold-400 border border-gold-500/20 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider">
                        Grand Jury
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-accent-400">{activeModalJudge.designation}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1.5"><RiBuildingLine /> {activeModalJudge.organization}</span>
                    <span className="flex items-center gap-1.5"><RiMapPinLine /> {activeModalJudge.country}</span>
                  </div>
                </div>
              </div>

              {/* Separator line */}
              <div className="border-t border-white/10" />

              {/* Profile Body sections */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left col - statistics and info tags */}
                <div className="md:col-span-1 space-y-6">
                  {/* Performance / Judging indicators */}
                  <div className="bg-surface-300 rounded-2xl border border-white/5 p-4 space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Experience</p>
                      <p className="text-lg font-black text-white flex items-center gap-1.5">
                        <RiBriefcaseLine className="text-accent-400 text-sm" /> {activeModalJudge.experience} Years
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Awards Judged</p>
                      <p className="text-lg font-black text-white flex items-center gap-1.5">
                        <RiAwardLine className="text-purple-400 text-sm" /> {activeModalJudge.awardsJudged} Award Cycles
                      </p>
                    </div>
                  </div>

                  {/* Expertise links */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Expertise Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {activeModalJudge.expertise.map(exp => (
                        <span key={exp} className="text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Award Category assignment */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Evaluating Panel</h4>
                    <span className="inline-block text-[10px] font-bold text-accent-400 bg-accent-500/10 px-2.5 py-1.5 rounded-lg border border-accent-500/20">
                      {activeModalJudge.category}
                    </span>
                  </div>
                </div>

                {/* Right col - Biography details */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Executive Biography</h4>
                    <p className="text-slate-300 text-sm leading-relaxed text-justify">
                      {activeModalJudge.bio}
                    </p>
                  </div>

                  {/* Mock Achievements */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">Key Qualifications</h4>
                    <ul className="space-y-2 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                        <span>Advises regional committees on Artificial Intelligence and digital innovation policies.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                        <span>Demonstrated leadership in technical transformations and scaling business solutions.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Social links */}
                  <div className="flex gap-3 pt-4">
                    <a
                      href={activeModalJudge.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs text-slate-300 hover:text-white transition-colors bg-white/5 font-semibold"
                    >
                      <RiLinkedinBoxFill className="text-[#0A66C2] text-sm" /> LinkedIn Profile
                    </a>
                    <a
                      href={activeModalJudge.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs text-slate-300 hover:text-white transition-colors bg-white/5 font-semibold"
                    >
                      <RiGlobalLine className="text-slate-400 text-sm" /> Website
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JudgePortal;
