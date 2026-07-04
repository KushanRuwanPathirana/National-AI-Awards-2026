import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  RiSearchLine, RiFilterLine, RiLinkedinBoxFill, RiGlobalLine,
  RiCloseLine, RiArrowRightLine, RiUserLine, RiStarLine,
  RiBuildingLine, RiMapPinLine, RiBriefcaseLine, RiGraduationCapLine,
  RiTeamLine, RiAwardLine, RiShieldUserLine, RiArrowDownSLine
} from 'react-icons/ri';
import Button from '../components/shared/Button';

// Judges Mock Data
const judgesData = [
  {
    id: 'indika-de-zoysa',
    name: 'Mr. Indika De Zoysa',
    designation: 'Strategic Advisor / Vice President',
    organization: 'Huawei Technologies Sri Lanka / FITIS Chairman',
    bio: 'A seasoned ICT professional and industry leader with over 25 years of experience driving national-level digital initiatives and telecommunications growth in Sri Lanka. Served as the Chairman of FITIS and spearheaded numerous key digitalization initiatives.',
    expertise: ['Government', 'Industry', 'Telecom', 'Digital Policy'],
    country: 'Sri Lanka',
    experience: 25,
    awardsJudged: 3,
    isGrandJury: true,
    avatarGradient: 'from-blue-600 to-cyan-500',
    category: 'Core National Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://fitis.lk'
  },
  {
    id: 'ruvan-weerasinghe',
    name: 'Dr. Ruvan Weerasinghe',
    designation: 'Academic Dean & Former Senior Lecturer',
    organization: 'IIT & UCSC (University of Colombo)',
    bio: 'A pioneer of Natural Language Processing and computational linguistics in Sri Lanka. He led the University of Colombo School of Computing (UCSC) for years and continues to drive academic research and high-performance language technology engines.',
    expertise: ['Academia', 'AI Research', 'NLP', 'Government'],
    country: 'Sri Lanka',
    experience: 30,
    awardsJudged: 4,
    isGrandJury: true,
    avatarGradient: 'from-violet-600 to-fuchsia-500',
    category: 'Core National Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://ucsc.cmb.ac.lk'
  },
  {
    id: 'dharmasri-kumaratunge',
    name: 'Dr. Dharmasri Kumaratunge',
    designation: 'Senior Advisor on Technology',
    organization: 'Ministry of Technology / ICTA',
    bio: 'A key visionary behind Sri Lanka\'s national AI policies and digital public infrastructure. Dr. Kumaratunge has spent decades advising government entities, setting technological standards, and scaling digital governance solutions.',
    expertise: ['Government', 'Standards', 'Digital Infrastructure', 'Policy'],
    country: 'Sri Lanka',
    experience: 28,
    awardsJudged: 5,
    isGrandJury: true,
    avatarGradient: 'from-cyan-500 to-emerald-500',
    category: 'Core National Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://mot.gov.lk'
  },
  {
    id: 'lakmini-wijesundara',
    name: 'Ms. Lakmini Wijesundara',
    designation: 'Co-Founder & Executive Director',
    organization: 'IronOne Technologies & BoardPAC',
    bio: 'An internationally acclaimed tech entrepreneur and corporate governance pioneer. She has expanded Sri Lankan software products globally and advises multi-national boards on enterprise software deployment and cyber governance.',
    expertise: ['Startup', 'Industry', 'Entrepreneurship', 'Tech Governance'],
    country: 'Sri Lanka',
    experience: 22,
    awardsJudged: 3,
    isGrandJury: true,
    avatarGradient: 'from-amber-500 to-orange-500',
    category: 'Core National Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://boardpac.co'
  },
  {
    id: 'sarah-jenkins',
    name: 'Dr. Sarah Jenkins',
    designation: 'Professor of AI & Robotics (International)',
    organization: 'Stanford University',
    bio: 'Dr. Jenkins is an international leader in computer vision and reinforcement learning. Her research revolves around neural networks in edge-computing robotics. She acts as a senior technical evaluator for global startup funds.',
    expertise: ['Academia', 'AI Research', 'Venture Capital', 'Robotics'],
    country: 'United States',
    experience: 20,
    awardsJudged: 2,
    isGrandJury: true,
    avatarGradient: 'from-pink-500 to-rose-500',
    category: 'Core National Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://stanford.edu'
  },
  {
    id: 'ranjith-gayan',
    name: 'Mr. Ranjith Gayan',
    designation: 'Head of Innovation & Digital Products',
    organization: 'SLTMobitel Member',
    bio: 'Ranjith leads research and development of 5G edge applications and AI integrations at SLTMobitel. He is highly focused on expanding high-speed connectivity solutions and digital services infrastructure.',
    expertise: ['Telecom', 'Industry', 'AI Solutions', '5G Edge'],
    country: 'Sri Lanka',
    experience: 18,
    awardsJudged: 3,
    isGrandJury: true,
    avatarGradient: 'from-blue-600 to-indigo-600',
    category: 'Core National Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://sltmobitel.lk'
  },
  {
    id: 'chalinda-abeykoon',
    name: 'Mr. Chalinda Abeykoon',
    designation: 'Managing Partner',
    organization: 'nVentures',
    bio: 'A seasoned venture capitalist and startup strategist. Chalinda manages nVentures, investing in early-stage B2B software-as-a-service (SaaS) and AI startups across South and Southeast Asia.',
    expertise: ['Venture Capital', 'Startup', 'Finance', 'Investment'],
    country: 'Sri Lanka',
    experience: 16,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-purple-600 to-indigo-500',
    category: 'Innovation & Future-Focused Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://nventures.sg'
  },
  {
    id: 'asela-gunawardana',
    name: 'Mr. Asela Gunawardana',
    designation: 'Country Manager',
    organization: 'Microsoft Sri Lanka & Maldives',
    bio: 'Leads Microsoft\'s commercial partner and enterprise strategy in the region. Asela focuses on cloud adoption, enterprise generative AI integrations, and digital upskilling across public and private sectors.',
    expertise: ['Industry', 'AI Solutions', 'Cloud Platforms', 'Enterprise'],
    country: 'Sri Lanka',
    experience: 19,
    awardsJudged: 2,
    isGrandJury: false,
    avatarGradient: 'from-blue-500 to-violet-500',
    category: 'Innovation & Future-Focused Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://microsoft.com'
  },
  {
    id: 'madu-ratnayake',
    name: 'Mr. Madu Ratnayake',
    designation: 'CIO & Executive Vice President',
    organization: 'Virtusa',
    bio: 'A global IT leader responsible for digital engineering operations, tech innovation initiatives, and business development across Virtusa\'s worldwide delivery centers. Former member of SLASSCOM and ICTA boards.',
    expertise: ['Industry', 'Telecom', 'Tech Strategy', 'Engineering'],
    country: 'Sri Lanka',
    experience: 26,
    awardsJudged: 4,
    isGrandJury: false,
    avatarGradient: 'from-cyan-600 to-blue-500',
    category: 'Innovation & Future-Focused Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://virtusa.com'
  },
  {
    id: 'irfan-ahamed',
    name: 'Mr. Irfan Ahamed',
    designation: 'Director of AI Engineering',
    organization: 'Sysco LABS',
    bio: 'Irfan oversees the design of next-generation enterprise logistics platforms, demand forecasting, and machine learning models supporting one of the world\'s largest food services providers.',
    expertise: ['Industry', 'AI Research', 'AI Solutions', 'Logistics'],
    country: 'Sri Lanka',
    experience: 15,
    awardsJudged: 2,
    isGrandJury: false,
    avatarGradient: 'from-teal-500 to-emerald-500',
    category: 'Innovation & Future-Focused Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://syscolabs.com'
  },
  {
    id: 'jiffry-zulfer',
    name: 'Mr. Jiffry Zulfer',
    designation: 'Founder & CEO',
    organization: 'PickMe (Digital Mobility Solutions)',
    bio: 'Pioneered the on-demand mobility sector in Sri Lanka by building PickMe. Jiffry integrates predictive demand-supply algorithms, geofencing, and route-optimization AI models into regional ride-hailing networks.',
    expertise: ['Startup', 'Industry', 'Telecom', 'AI Solutions'],
    country: 'Sri Lanka',
    experience: 20,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-yellow-500 to-amber-500',
    category: 'Innovation & Future-Focused Awards',
    linkedin: 'https://linkedin.com',
    website: 'https://pickme.lk'
  },
  {
    id: 'harsha-purasinghe',
    name: 'Mr. Harsha Purasinghe',
    designation: 'Founder & CEO',
    organization: 'Microimage',
    bio: 'A software industry veteran who founded Microimage, creating agricultural technologies (such as smart farming sensors and market analytics portals) to support farming systems and supply chain visibility.',
    expertise: ['Startup', 'Agriculture', 'Industry', 'AI Research'],
    country: 'Sri Lanka',
    experience: 24,
    awardsJudged: 4,
    isGrandJury: false,
    avatarGradient: 'from-green-500 to-emerald-500',
    category: 'AI in Agriculture',
    linkedin: 'https://linkedin.com',
    website: 'https://microimage.com'
  },
  {
    id: 'heminda-jayaweera',
    name: 'Mr. Heminda Jayaweera',
    designation: 'Co-Founder',
    organization: 'SLINTEC Startup Incubator',
    bio: 'Coordinates advanced engineering research and nano-agricultural startups. Heminda focuses on IoT soil monitoring devices, precision pesticide spraying drone systems, and nanotechnology-based agricultural innovations.',
    expertise: ['Startup', 'Academia', 'Agriculture', 'AI Solutions'],
    country: 'Sri Lanka',
    experience: 18,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-emerald-500 to-teal-500',
    category: 'AI in Agriculture',
    linkedin: 'https://linkedin.com',
    website: 'https://slintec.lk'
  },
  {
    id: 'buddhi-marambe',
    name: 'Prof. Buddhi Marambe',
    designation: 'Senior Professor of Crop Science',
    organization: 'University of Peradeniya',
    bio: 'One of the country\'s most decorated agricultural experts. Advises the government on climate change impact models and weed science. Focuses on integrating predictive data models in crop cultivation cycle management.',
    expertise: ['Academia', 'Agriculture', 'Government', 'AI Research'],
    country: 'Sri Lanka',
    experience: 32,
    awardsJudged: 5,
    isGrandJury: false,
    avatarGradient: 'from-teal-600 to-green-600',
    category: 'AI in Agriculture',
    linkedin: 'https://linkedin.com',
    website: 'https://pdn.ac.lk'
  },
  {
    id: 'shehani-seneviratne',
    name: 'Ms. Shehani Seneviratne',
    designation: 'Chief Operating Officer',
    organization: '99x',
    bio: 'Responsible for operational excellence and offshore software engineering portfolios. Shehani oversees fintech and payment system innovations built for high-security markets across Europe.',
    expertise: ['Industry', 'Finance', 'AI Solutions', 'Standards'],
    country: 'Sri Lanka',
    experience: 21,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-blue-500 to-indigo-500',
    category: 'AI in Banking, Finance & Insurance',
    linkedin: 'https://linkedin.com',
    website: 'https://99x.io'
  },
  {
    id: 'oshada-senanayake',
    name: 'Mr. Oshada Senanayake',
    designation: 'Chief Operating Officer',
    organization: 'Digital Holdings',
    bio: 'Former Director General of TRCSL. Oshada is a prominent regulator and fintech transformation advocate, scaling secure mobile banking APIs, digital wallets, and blockchain verification nodes in the local market.',
    expertise: ['Government', 'Industry', 'Finance', 'Telecom'],
    country: 'Sri Lanka',
    experience: 18,
    awardsJudged: 4,
    isGrandJury: false,
    avatarGradient: 'from-indigo-500 to-violet-500',
    category: 'AI in Banking, Finance & Insurance',
    linkedin: 'https://linkedin.com',
    website: 'https://digitalholdings.lk'
  },
  {
    id: 'channa-de-silva',
    name: 'Mr. Channa De Silva',
    designation: 'CEO',
    organization: 'LankaPay',
    bio: 'Heads the national clearing house of Sri Lanka. Channa is at the forefront of digital finance, promoting real-time settlement rails, digital signatures, and machine learning models for payment fraud prevention.',
    expertise: ['Industry', 'Finance', 'Standards', 'AI Research'],
    country: 'Sri Lanka',
    experience: 25,
    awardsJudged: 4,
    isGrandJury: false,
    avatarGradient: 'from-sky-500 to-blue-500',
    category: 'AI in Banking, Finance & Insurance',
    linkedin: 'https://linkedin.com',
    website: 'https://lankapay.net'
  },
  {
    id: 'vajira-dissanayake',
    name: 'Prof. Vajira H.W. Dissanayake',
    designation: 'Dean & Senior Professor of Anatomy',
    organization: 'Faculty of Medicine, University of Colombo',
    bio: 'A world-renowned leader in medical genetics and bioinformatics. Prof. Vajira spearheads biomedical AI programs, clinical genomics, and mobile health registry integrations in the South Asian region.',
    expertise: ['Academia', 'Healthcare', 'AI Research', 'Standards'],
    country: 'Sri Lanka',
    experience: 28,
    awardsJudged: 5,
    isGrandJury: false,
    avatarGradient: 'from-red-500 to-pink-500',
    category: 'AI in Healthcare & Life Sciences',
    linkedin: 'https://linkedin.com',
    website: 'https://med.cmb.ac.lk'
  },
  {
    id: 'nishan-siriwardhana',
    name: 'Dr. Nishan Siriwardhana',
    designation: 'Director of Health Information Systems',
    organization: 'Ministry of Health Sri Lanka',
    bio: 'Dr. Nishan coordinates medical health data architecture, telemedicine portals, and electronic health databases to integrate diagnostics assist systems across all national medical wards.',
    expertise: ['Healthcare', 'Government', 'Standards', 'Telecom'],
    country: 'Sri Lanka',
    experience: 17,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-rose-500 to-orange-500',
    category: 'AI in Healthcare & Life Sciences',
    linkedin: 'https://linkedin.com',
    website: 'https://health.gov.lk'
  },
  {
    id: 'chitranganie-mubarak',
    name: 'Mrs. Chitranganie Mubarak',
    designation: 'Former Chairperson',
    organization: 'ICTA Sri Lanka',
    bio: 'A public officer who led digital community and health accessibility portals under the e-Sri Lanka initiative. Former Chair of ICTA, promoting digital equity, digital health access, and regional e-government portals.',
    expertise: ['Government', 'Standards', 'Legal', 'Healthcare'],
    country: 'Sri Lanka',
    experience: 30,
    awardsJudged: 4,
    isGrandJury: false,
    avatarGradient: 'from-purple-500 to-fuchsia-500',
    category: 'AI in Healthcare & Life Sciences',
    linkedin: 'https://linkedin.com',
    website: 'https://icta.lk'
  },
  {
    id: 'dhananath-fernando',
    name: 'Mr. Dhananath Fernando',
    designation: 'CEO',
    organization: 'Advocata Institute',
    bio: 'An economist who monitors commercial competitiveness and trade dynamics. Dhananath advises trade bodies on trade compliance digitization, customs automated clearances, and global market export dynamics.',
    expertise: ['Startup', 'Industry', 'Legal', 'Finance'],
    country: 'Sri Lanka',
    experience: 14,
    awardsJudged: 2,
    isGrandJury: false,
    avatarGradient: 'from-indigo-600 to-cyan-500',
    category: 'AI in Export Development',
    linkedin: 'https://linkedin.com',
    website: 'https://advocata.org'
  },
  {
    id: 'ajith-madurapperuma',
    name: 'Dr. Ajith P. Madurapperuma',
    designation: 'Board Member & Senior Lecturer',
    organization: 'ICTA / OUSL',
    bio: 'Research veteran in machine learning and hardware-software architectures. He advises regional export committees on supply chain optimization, automated quality inspections, and port shipping scheduling AI.',
    expertise: ['Government', 'Academia', 'AI Research', 'Telecom'],
    country: 'Sri Lanka',
    experience: 26,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-emerald-500 to-cyan-500',
    category: 'AI in Export Development',
    linkedin: 'https://linkedin.com',
    website: 'https://ou.ac.lk'
  },
  {
    id: 'roshan-ragel',
    name: 'Prof. Roshan Ragel',
    designation: 'Professor of Computer Engineering',
    organization: 'University of Peradeniya',
    bio: 'Specializes in secure hardware and machine learning optimizations. Leading academic driving high-performance computing centers in Sri Lanka. Researching AI-powered personalized tutoring frameworks.',
    expertise: ['Academia', 'AI Research', 'Standards', 'Industry'],
    country: 'Sri Lanka',
    experience: 23,
    awardsJudged: 4,
    isGrandJury: false,
    avatarGradient: 'from-violet-600 to-indigo-600',
    category: 'AI in Education',
    linkedin: 'https://linkedin.com',
    website: 'https://eng.pdn.ac.lk'
  },
  {
    id: 'sampath-jayasundara',
    name: 'Mr. Sampath Jayasundara',
    designation: 'CEO',
    organization: 'hSenid Business Solutions',
    bio: 'Leads a premier HR software provider. Sampath develops educational partnerships and implements digital skills certification curricula to close regional software engineering capability gaps.',
    expertise: ['Industry', 'Startup', 'Finance', 'Standards'],
    country: 'Sri Lanka',
    experience: 20,
    awardsJudged: 3,
    isGrandJury: false,
    avatarGradient: 'from-amber-600 to-rose-500',
    category: 'AI in Education',
    linkedin: 'https://linkedin.com',
    website: 'https://hsenidbiz.com'
  }
];

// All available expertise options
const expertiseOptions = [
  'Government', 'Academia', 'Industry', 'Startup', 'Healthcare',
  'Agriculture', 'Finance', 'AI Research', 'Venture Capital',
  'Standards', 'Legal', 'Telecom'
];

// Available categories matching structure
const categoryMap = [
  'All',
  'Core National Awards',
  'Innovation & Future-Focused Awards',
  'AI in Agriculture',
  'AI in Banking, Finance & Insurance',
  'AI in Healthcare & Life Sciences',
  'AI in Export Development',
  'AI in Education'
];

const JudgePortal = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [sortBy, setSortBy] = useState('Alphabetical');
  const [activeModalJudge, setActiveModalJudge] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter & Sort Logic
  const filteredJudges = useMemo(() => {
    let result = [...judgesData];

    // Filter by Search Query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(judge =>
        judge.name.toLowerCase().includes(query) ||
        judge.organization.toLowerCase().includes(query) ||
        judge.designation.toLowerCase().includes(query) ||
        judge.category.toLowerCase().includes(query) ||
        judge.expertise.some(exp => exp.toLowerCase().includes(query))
      );
    }

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter(judge => judge.category === selectedCategory);
    }

    // Filter by Expertise
    if (selectedExpertise !== 'All') {
      result = result.filter(judge => judge.expertise.includes(selectedExpertise));
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
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'Experience') {
      result.sort((a, b) => b.experience - a.experience);
    } else if (sortBy === 'Category') {
      result.sort((a, b) => a.category.localeCompare(b.category));
    }

    return result;
  }, [searchQuery, selectedCategory, selectedExpertise, selectedCountry, sortBy]);

  // Separate Grand Jury for display
  const grandJuryJudges = useMemo(() => {
    return judgesData.filter(judge => judge.isGrandJury);
  }, []);

  // Helper to extract initials
  const getInitials = (name) => {
    const clean = name.replace(/^(Mr\.|Dr\.|Ms\.|Mrs\.|Prof\.)\s+/i, '');
    const parts = clean.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0] ? parts[0][0].toUpperCase() : 'AI';
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 overflow-x-hidden font-sans relative selection:bg-accent-500/30 selection:text-white">
      {/* ── Background Mesh ── */}
      <div className="absolute top-0 inset-x-0 h-[1000px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-accent-500/10 to-transparent blur-[150px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-[150px]" />
        <div className="absolute inset-0 bg-noise opacity-[0.02]" />
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-36 pb-20 overflow-hidden z-10 border-b border-white/5 bg-gradient-hero">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-left space-y-6">
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold uppercase tracking-wider"
              >
                <RiShieldUserLine className="text-sm" /> Expert Jury Panel
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]"
              >
                Meet the Experts <br />
                Shaping Sri Lanka's <br />
                <span className="gradient-text">
                  AI Future
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-slate-300 text-lg sm:text-xl max-w-xl font-normal leading-relaxed"
              >
                Our distinguished judging panel consists of nationally and internationally recognized leaders from academia, government, industry, research, venture capital, and innovation.
              </motion.p>

              {/* Statistics Grid */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5"
              >
                <div className="space-y-1">
                  <p className="font-display font-black text-3xl text-accent-400">40+</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Judges Joined</p>
                </div>
                <div className="space-y-1">
                  <p className="font-display font-black text-3xl text-purple-400">6</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Categories</p>
                </div>
                <div className="space-y-1">
                  <p className="font-display font-black text-3xl text-cyan-400">Global</p>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Representation</p>
                </div>
                <div className="space-y-1">
                  <p className="font-display font-bold text-xs text-white leading-tight">Gov • Academia • Industry</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Ecosystem Sectors</p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 pt-4"
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

            {/* Right Collage Graphic */}
            <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center">
              <div className="absolute inset-0 bg-radial-gradient from-accent-500/10 via-transparent to-transparent blur-2xl z-0" />
              <div className="relative w-full max-w-[420px] h-[400px] z-10 flex items-center justify-center">
                {/* Float Collage profile 1 */}
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-4 left-6 p-4 bg-surface-100/70 backdrop-blur-md rounded-[24px] shadow-xl border border-white/10 w-44 flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-accent-500 to-cyan-400 flex items-center justify-center font-display font-bold text-white text-sm shadow-inner">
                    RW
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Dr. Ruvan Weerasinghe</h4>
                    <p className="text-[10px] text-slate-400">Academic Dean • IIT</p>
                  </div>
                </motion.div>

                {/* Float Collage profile 2 */}
                <motion.div
                  animate={{ y: [0, 16, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute bottom-6 right-2 p-4 bg-surface-100/70 backdrop-blur-md rounded-[24px] shadow-xl border border-white/10 w-48 flex flex-col items-center text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center font-display font-bold text-white text-sm shadow-inner">
                    LW
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Ms. Lakmini Wijesundara</h4>
                    <p className="text-[10px] text-slate-400">Founder & ED • BoardPAC</p>
                  </div>
                </motion.div>

                {/* Float Collage profile 3 */}
                <motion.div
                  animate={{ x: [0, 12, 0], y: [0, -8, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-36 right-8 p-4 bg-surface-100/80 backdrop-blur-md rounded-[28px] shadow-2xl border border-white/20 w-52 flex flex-col items-center text-center space-y-3 z-20"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-accent-500 to-violet-600 flex items-center justify-center font-display font-black text-white text-lg shadow-inner">
                    ID
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Mr. Indika De Zoysa</h4>
                    <p className="text-xs text-accent-400 font-semibold mt-0.5">FITIS Chairman</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Grand Jury Chair</p>
                  </div>
                </motion.div>

                {/* Center abstract shape representing connection networks */}
                <svg className="absolute inset-0 w-full h-full text-accent-500/20 z-0" fill="none" viewBox="0 0 400 400">
                  <path d="M100 100 L250 250 M250 250 L320 150 M100 100 L320 150" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                  <circle cx="100" cy="100" r="4" fill="currentColor" />
                  <circle cx="250" cy="250" r="4" fill="currentColor" />
                  <circle cx="320" cy="150" r="4" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Grand Jury Section ── */}
      <section className="py-24 border-b border-white/5 relative bg-surface-300/40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider">
              Grand Jury Panel
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Distinguished Grand Jury
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              These eminent industry and academic veterans preside over the main selections, ensuring the absolute integrity, merit, and high standards of the National AI Awards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {grandJuryJudges.map((judge, idx) => (
              <motion.div
                key={judge.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => setActiveModalJudge(judge)}
                className="glass-card p-8 flex flex-col items-center text-center cursor-pointer hover:border-gold-500/50 hover:shadow-glow-gold transition-all duration-300 group"
              >
                <div className="space-y-5 flex flex-col items-center w-full">
                  {/* Circular Portrait with Glowing Border */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center font-display font-black text-white text-2xl shadow-inner border-2 border-gold-500 shadow-[0_0_15px_rgba(0,255,135,0.4)] group-hover:scale-105 transition-transform duration-300">
                      {getInitials(judge.name)}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="font-display font-bold text-white text-lg group-hover:text-gold-400 transition-colors duration-300 leading-tight">
                    {judge.name}
                  </h3>

                  {/* Designation */}
                  <p className="text-gold-400 text-xs font-semibold">
                    {judge.designation}
                  </p>

                  {/* Company */}
                  <p className="text-slate-400 text-xs truncate max-w-full">
                    {judge.organization}
                  </p>

                  {/* Bio brief */}
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 text-center mt-2">
                    {judge.bio}
                  </p>
                </div>

                {/* Pill Badge at the Bottom */}
                <div className="mt-6">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full border border-gold-500/30 text-gold-400 bg-gold-500/10">
                    Grand Jury
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                showFilters || selectedExpertise !== 'All' || selectedCountry !== 'All'
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
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gradient-accent text-white shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'All' ? 'All Award Categories' : cat}
            </button>
          ))}
        </div>

        {/* Judges Grid Layout */}
        <div className="relative">
          <motion.div
            layout
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredJudges.map((judge) => (
                <motion.div
                  layout
                  key={judge.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setActiveModalJudge(judge)}
                  className="glass-card p-6 flex flex-col items-center text-center cursor-pointer border border-white/10 hover:border-accent-500/50 hover:shadow-glow transition-all duration-300 group"
                >
                  {/* Circular Portrait with Glowing Border */}
                  <div className="relative">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center font-display font-black text-white text-2xl shadow-inner border-2 ${
                      judge.isGrandJury 
                        ? 'border-gold-400 shadow-[0_0_15px_rgba(0,255,135,0.4)]' 
                        : 'border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                    } group-hover:scale-105 transition-transform duration-300`}>
                      {getInitials(judge.name)}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="font-display font-bold text-white text-lg mt-5 group-hover:text-accent-400 transition-colors duration-300 leading-tight">
                    {judge.name}
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
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full border ${
                      judge.isGrandJury 
                        ? 'border-gold-500/30 text-gold-400 bg-gold-500/10' 
                        : 'border-accent-500/30 text-accent-400 bg-accent-500/10'
                    }`}>
                      {judge.isGrandJury ? 'Grand Jury' : 'Panelist'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

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
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-surface-50 to-surface-100 flex items-center justify-center font-display font-black text-white text-3xl shadow-inner border-2 ${
                  activeModalJudge.isGrandJury ? 'border-gold-500 shadow-[0_0_15px_rgba(0,255,135,0.4)]' : 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                } flex-shrink-0`}>
                  {getInitials(activeModalJudge.name)}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display font-extrabold text-2xl text-white leading-tight">
                      {activeModalJudge.name}
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
