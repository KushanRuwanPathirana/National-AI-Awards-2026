import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  RiUserLine, RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiSendPlane2Line, RiCheckDoubleLine, RiFileList3Line, RiInformationLine,
  RiArrowRightLine, RiAddLine, RiCalendarLine, RiFolderOpenLine,
  RiEditLine, RiCheckboxCircleLine, RiMessageLine, RiTimeLine,
  RiQuestionLine, RiCheckLine, RiNotification3Line, RiDeleteBinLine,
  RiSubtractLine, RiExternalLinkLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import applicationService from '../../services/application.service';
import notificationService from '../../services/notification.service';
import Button from '../../components/shared/Button';

/* ─── Timeline data (mirrors public Timeline page) ─────────────────────── */
const timelinePhases = [
  {
    phase: 'Phase 1', title: 'Applications Open',
    dateRange: '15 May – 31 July 2026', status: 'active', color: 'accent',
    milestones: [
      { date: '15 May 2026', event: 'Application portal goes live', status: 'completed' },
      { date: '01 Jun 2026', event: 'Informational webinar for applicants', status: 'completed' },
      { date: '31 Jul 2026', event: 'Final submission deadline', status: 'active' },
    ],
  },
  {
    phase: 'Phase 2', title: 'Review & Shortlisting',
    dateRange: '1 August – 25 August 2026', status: 'upcoming', color: 'purple',
    milestones: [
      { date: '01 Aug 2026', event: 'Technical review panel convenes', status: 'upcoming' },
      { date: '10 Aug 2026', event: 'Expert judge panels assigned', status: 'upcoming' },
      { date: '25 Aug 2026', event: 'Shortlist announcement', status: 'upcoming' },
    ],
  },
  {
    phase: 'Phase 3', title: 'Judging & Presentations',
    dateRange: '1 Sep – 5 Sep 2026', status: 'upcoming', color: 'gold',
    milestones: [
      { date: '01 Sep 2026', event: 'Finalist presentations begin', status: 'upcoming' },
      { date: '05 Sep 2026', event: 'Final scoring complete', status: 'upcoming' },
    ],
  },
  {
    phase: 'Phase 4', title: 'Awards Ceremony',
    dateRange: '10 September 2026', status: 'upcoming', color: 'emerald',
    milestones: [
      { date: '10 Sep 2026', event: '🏆 Grand Awards Ceremony', status: 'upcoming' },
    ],
  },
];

const colorMap = {
  emerald: { dot: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30', line: 'bg-emerald-500/40' },
  accent:  { dot: 'bg-accent-500',  badge: 'text-accent-400 bg-accent-500/15 border-accent-500/30',   line: 'bg-accent-500/40' },
  purple:  { dot: 'bg-purple-500',  badge: 'text-purple-400 bg-purple-500/15 border-purple-500/30',   line: 'bg-purple-500/40' },
  gold:    { dot: 'bg-gold-500',    badge: 'text-gold-400 bg-gold-500/15 border-gold-500/30',         line: 'bg-gold-500/40' },
};
const statusLabel = { completed: 'Completed', active: 'In Progress', upcoming: 'Upcoming' };

/* ─── FAQ data (mirrors public FAQs page) ───────────────────────────────── */
const faqData = [
  {
    category: 'Eligibility',
    faqs: [
      { q: 'Who can apply for the National AI Awards?', a: 'Any Sri Lankan citizen, permanent resident, or organisation legally incorporated in Sri Lanka with an AI-driven solution is eligible. This includes startups, SMEs, large corporations, research institutions, and academic groups.' },
      { q: 'Do I need to be a technology company to apply?', a: 'No. Organisations from any industry — healthcare, agriculture, finance, education, manufacturing — are welcome. What matters is that your solution meaningfully incorporates Artificial Intelligence.' },
      { q: 'Can individuals apply, or only organisations?', a: 'Both individuals and organisations can apply. Individuals must be Sri Lankan citizens or residents.' },
    ],
  },
  {
    category: 'Application Process',
    faqs: [
      { q: 'Is there an application fee?', a: 'No. Applying to the National AI Awards Sri Lanka is completely free of charge.' },
      { q: 'How do I submit my application?', a: 'Complete your profile, choose up to 2 award categories, fill in the application form, upload supporting documents, and click Submit. You can save drafts and return before the deadline.' },
      { q: 'Can I apply in more than one category?', a: 'Yes, you may apply in up to 2 award categories. A separate application form must be submitted for each category.' },
      { q: 'Can I edit my application after submission?', a: 'Applications can be edited any time before the submission deadline (31 July 2026). After the deadline, submissions are locked for the review process.' },
    ],
  },
  {
    category: 'Judging & Selection',
    faqs: [
      { q: 'How are applications evaluated?', a: 'Scoring is based on Innovation & Novelty (30%), Real-World Impact (25%), Technical Excellence (20%), Scalability (15%), and Ethical AI Practices (10%).' },
      { q: 'Will shortlisted applicants be notified?', a: 'Yes. All shortlisted applicants will be notified via email and through their portal dashboard by 25 August 2026.' },
    ],
  },
  {
    category: 'Awards & Prizes',
    faqs: [
      { q: 'What prizes are awarded?', a: 'Each category winner receives: a cash prize, a prestigious trophy and certificate, media coverage worth LKR 500,000+, a one-year mentorship package, and access to exclusive investor networking events.' },
      { q: 'Where and when is the Awards Ceremony?', a: 'The Grand Awards Ceremony will be held on 10 September 2026 at a prestigious venue in Colombo.' },
    ],
  },
];

/* ─── Sidebar nav items ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'overview',      label: 'Dashboard',              icon: RiInformationLine },
  { id: 'applications',  label: 'My Applications',        icon: RiFileList3Line },
  { id: 'new',           label: 'Start New Application',  icon: RiAddLine },
  { id: 'drafts',        label: 'Edit Draft',             icon: RiEditLine },
  { id: 'submitted',     label: 'Submitted Applications', icon: RiCheckboxCircleLine },
  { id: 'messages',      label: 'Messages',               icon: RiMessageLine },
  { id: 'timeline',      label: 'Timeline',               icon: RiTimeLine },
  { id: 'faqs',          label: 'FAQs',                   icon: RiQuestionLine },
];

const DIVIDER_AFTER = ['submitted']; // visual divider after these IDs

/* ─── Inline FAQ accordion ───────────────────────────────────────────────── */
const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className={`rounded-xl border overflow-hidden transition-colors duration-200 ${isOpen ? 'border-accent-500/40 bg-accent-500/5' : 'border-white/8 bg-white/3'}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 p-5 text-left"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-white text-sm leading-snug pr-2">{faq.q}</span>
      <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${isOpen ? 'bg-accent-500/30 text-accent-300' : 'bg-white/5 text-slate-400'}`}>
        {isOpen ? <RiSubtractLine size={14} /> : <RiAddLine size={14} />}
      </span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5">
            <div className="divider-glow mb-3" />
            <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const CandidateDashboard = () => {
  const { user, logout, updateUserLocal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [imageUploading, setImageUploading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [openFAQs, setOpenFAQs] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Change Password state
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError, setChangeError]   = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm();
  const newPassword = watch('newPassword');
  const passwordRules = [
    { label: 'At least 8 characters', passed: (newPassword || '').length >= 8 },
    { label: 'Includes an uppercase letter', passed: /[A-Z]/.test(newPassword || '') },
    { label: 'Includes a number', passed: /\d/.test(newPassword || '') },
    { label: 'Includes a symbol', passed: /[^A-Za-z0-9]/.test(newPassword || '') },
  ];
  const passwordStrength = passwordRules.filter((rule) => rule.passed).length;

  /* ── Fetch applications ─────────────────────────────────────────────── */
  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data } = await applicationService.getMyApplications();
      setApplications(data.data.applications);
    } catch {
      toast.error('Failed to load your applications.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch notifications / messages ─────────────────────────────────── */
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const { data } = await notificationService.getNotifications();
      setNotifications(data.data?.notifications || data.data || []);
    } catch {
      // Silently fail — backend may not have this route yet
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') fetchNotifications();
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleDelete = async (id, title) => {
    const ok = window.confirm(`Are you sure you want to delete the draft "${title || 'Untitled'}"? This action cannot be undone.`);
    if (!ok) return;

    try {
      await applicationService.deleteApplication(id);
      toast.success('Application draft deleted successfully.');
      fetchApps();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete application.');
    }
  };

  const onChangePasswordSubmit = async (data) => {
    try {
      setChangeError(''); setChangeSuccess('');
      await api.post('/auth/change-password', { oldPassword: data.oldPassword, newPassword: data.newPassword });
      setChangeSuccess('Password updated successfully!');
      toast.success('Password changed successfully.');
      reset();
    } catch (err) {
      setChangeError(err.response?.data?.message || 'Failed to update password.');
      toast.error('Password change failed.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      setImageUploading(true);
      const { data } = await api.post('/auth/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUserLocal(data.data.user);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setImageUploading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  const toggleFAQ = (catIdx, faqIdx) => {
    const key = `${catIdx}-${faqIdx}`;
    setOpenFAQs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const drafts    = applications.filter(a => a.status === 'draft');
  const submitted = applications.filter(a => a.status !== 'draft');
  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* ── Tab switch helper ───────────────────────────────────────────────── */
  const switchTab = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  /* ── Status badge helper ─────────────────────────────────────────────── */
  const StatusBadge = ({ status, label }) => {
    const cls =
      status === 'winner'     ? 'bg-emerald-500/10 text-emerald-400' :
      status === 'ineligible' ? 'bg-red-500/10 text-red-400' :
      status === 'draft'      ? 'bg-slate-500/10 text-slate-400' :
      'bg-accent-500/10 text-accent-400';
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
  };

  /* ── Application card ────────────────────────────────────────────────── */
  const AppCard = ({ app, showEdit = false }) => (
    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all">
      <div>
        <span className="badge-accent uppercase font-mono text-[9px]">{app.category?.name}</span>
        <h4 className="font-display font-bold text-white text-base mt-1">{app.projectTitle}</h4>
        <span className="text-slate-500 text-xs font-mono">{app.referenceNumber || 'Draft'}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <StatusBadge status={app.status} label={app.statusLabel || app.status} />
        {app.status === 'draft' ? (
          <>
            <Link to={`/dashboard/apply?draft=${app._id}`} className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-1.5">
              <RiEditLine size={14} /> Edit
            </Link>
            <button
              onClick={() => handleDelete(app._id, app.projectTitle)}
              className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-1.5 text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 animate-fade-in"
            >
              <RiDeleteBinLine size={14} /> Delete
            </button>
          </>
        ) : (
          <Link to={`/dashboard/applications/${app._id}`} className="btn-ghost !py-2 !px-4 text-xs">
            View
          </Link>
        )}
      </div>
    </div>
  );

  /* ── Empty state ─────────────────────────────────────────────────────── */
  const EmptyState = ({ icon: Icon, title, subtitle, cta, ctaTo }) => (
    <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
      <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="text-accent-400 text-2xl" />
      </div>
      <h4 className="font-display font-semibold text-white text-base mb-1">{title}</h4>
      <p className="text-slate-500 text-xs max-w-xs mx-auto mb-6">{subtitle}</p>
      {cta && <Link to={ctaTo} className="btn-gold text-xs">{cta} <RiSendPlane2Line /></Link>}
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-display font-bold text-white text-sm">
          {NAV_ITEMS.find(n => n.id === activeTab)?.label}
        </span>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 lg:py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className={`lg:col-span-1 space-y-4 lg:block ${sidebarOpen ? 'block' : 'hidden'} lg:sticky lg:top-24`}>
          {/* Avatar card */}
          <div className="glass-card p-6 text-center !hover:transform-none">
            {user?.profileImage ? (
              <img
                src={`http://localhost:5000/${user.profileImage}`}
                alt={user.fullName}
                className="w-16 h-16 rounded-full object-cover border border-white/20 shadow-glow mx-auto mb-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
                {user?.firstName?.charAt(0) || 'C'}
              </div>
            )}
            <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
            <span className="badge-accent mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
            {user?.registrationNumber && (
              <div className="mt-4 rounded-xl border border-accent-500/20 bg-accent-500/10 px-3 py-2">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Registration No.</span>
                <span className="mt-1 block font-mono text-xs font-semibold text-accent-300">{user.registrationNumber}</span>
              </div>
            )}
          </div>

          {/* Nav links */}
          <div className="glass-card p-2 space-y-0.5 !hover:transform-none">
            {NAV_ITEMS.map((tab) => (
              <div key={tab.id}>
                <button
                  onClick={() => switchTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-accent-500 text-white shadow-glow'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.id === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  {tab.id === 'drafts' && drafts.length > 0 && (
                    <span className="ml-auto bg-slate-600 text-slate-200 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {drafts.length}
                    </span>
                  )}
                </button>
                {DIVIDER_AFTER.includes(tab.id) && (
                  <div className="my-1 mx-4 h-px bg-white/5" />
                )}
              </div>
            ))}

            {/* Extra items */}
            <div className="my-1 mx-4 h-px bg-white/5" />
            <button
              onClick={() => switchTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'profile' ? 'bg-accent-500 text-white shadow-glow' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <RiUserLine size={16} /> My Profile
            </button>
            <button
              onClick={() => switchTab('password')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'password' ? 'bg-accent-500 text-white shadow-glow' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <RiLockPasswordLine size={16} /> Change Password
            </button>
            <div className="my-1 mx-4 h-px bg-white/5" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <RiLogoutBoxLine size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Tab Panel ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="glass-card p-6 sm:p-8 !hover:transform-none min-h-[420px]"
          >

            {/* ══ 1. DASHBOARD OVERVIEW ══════════════════════════════════════ */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-bold text-white text-xl">Welcome back, {user?.firstName}!</h3>
                    <p className="text-slate-400 text-sm mt-1">Here's a snapshot of your award journey.</p>
                  </div>
                  <button
                    onClick={() => switchTab('new')}
                    className="btn-primary text-xs flex items-center gap-1.5"
                  >
                    <RiAddLine /> New Application
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Applications', value: applications.length, color: 'from-accent-500/20 to-accent-500/5' },
                    { label: 'Drafts',              value: drafts.length,       color: 'from-slate-500/20 to-slate-500/5' },
                    { label: 'Submitted',           value: submitted.length,    color: 'from-emerald-500/20 to-emerald-500/5' },
                    { label: 'Unread Messages',     value: unreadCount,         color: 'from-red-500/20 to-red-500/5' },
                  ].map(s => (
                    <div key={s.label} className={`p-5 rounded-2xl bg-gradient-to-br ${s.color} border border-white/5 text-center`}>
                      <p className="text-white text-3xl font-black font-display">{s.value}</p>
                      <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-white text-sm font-bold flex items-center gap-2 mb-4">
                      <RiCalendarLine className="text-accent-400" /> Key Deadlines
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Applications Open</span>
                        <span className="text-white font-medium">May 15, 2026</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-accent-400 font-bold">Submission Deadline</span>
                        <span className="text-accent-400 font-bold">July 31, 2026</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Judge Evaluation</span>
                        <span className="text-white font-medium">Aug 1 – Aug 25, 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Grand Ceremony</span>
                        <span className="text-white font-medium">Sep 10, 2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-sm font-bold mb-2">Quick Links</h4>
                      <div className="space-y-2 mt-3">
                        {[
                          { label: 'My Applications',  tab: 'applications', icon: RiFileList3Line },
                          { label: 'Edit Draft',        tab: 'drafts',       icon: RiEditLine },
                          { label: 'Messages',          tab: 'messages',     icon: RiMessageLine },
                          { label: 'View Timeline',     tab: 'timeline',     icon: RiTimeLine },
                        ].map(ql => (
                          <button
                            key={ql.tab}
                            onClick={() => switchTab(ql.tab)}
                            className="w-full flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-1"
                          >
                            <ql.icon size={14} className="text-accent-400" />
                            {ql.label}
                            <RiArrowRightLine size={12} className="ml-auto" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-4 leading-relaxed">
                      Once submitted, applications enter the verification phase and cannot be modified.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ══ 2. MY APPLICATIONS ════════════════════════════════════════ */}
            {activeTab === 'applications' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-xl">My Applications</h3>
                    <p className="text-slate-400 text-xs mt-1">All your nominations in one place.</p>
                  </div>
                  <button onClick={() => switchTab('new')} className="btn-primary text-xs flex items-center gap-1.5">
                    <RiAddLine /> Start New
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : applications.length === 0 ? (
                  <EmptyState icon={RiFolderOpenLine} title="No Applications Yet" subtitle="Start building your first application draft." cta="Start New Application" ctaTo="/dashboard/apply" />
                ) : (
                  <div className="space-y-4">
                    {applications.map(app => <AppCard key={app._id} app={app} />)}
                  </div>
                )}
              </div>
            )}

            {/* ══ 3. START NEW APPLICATION ══════════════════════════════════ */}
            {activeTab === 'new' && (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500/25 to-gold-500/15 border border-accent-500/30 flex items-center justify-center">
                  <RiAwardLine size={36} className="text-accent-400" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-2xl mb-2">Start a New Application</h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                    Submit your AI innovation to the National AI Awards 2026. You can save your progress as a draft at any time.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl text-left mt-2">
                  {[
                    { step: '01', title: 'Choose a Category', desc: 'Select up to 2 award categories that best match your innovation.' },
                    { step: '02', title: 'Fill the Form',     desc: 'Describe your project, impact, team, and technical details.' },
                    { step: '03', title: 'Submit',            desc: 'Review and submit before 31 July 2026.' },
                  ].map(s => (
                    <div key={s.step} className="p-4 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-accent-400 font-black font-display text-lg">{s.step}</span>
                      <h4 className="text-white text-xs font-bold mt-1 mb-1">{s.title}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <Link to="/dashboard/apply" className="btn-gold mt-2">
                  Begin Application <RiArrowRightLine />
                </Link>
              </div>
            )}

            {/* ══ 4. EDIT DRAFT ══════════════════════════════════════════════ */}
            {activeTab === 'drafts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-xl">Edit Draft</h3>
                    <p className="text-slate-400 text-xs mt-1">Continue working on your saved drafts.</p>
                  </div>
                  <button onClick={() => switchTab('new')} className="btn-primary text-xs flex items-center gap-1.5">
                    <RiAddLine /> New Draft
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : drafts.length === 0 ? (
                  <EmptyState
                    icon={RiEditLine}
                    title="No Draft Applications"
                    subtitle="You don't have any drafts to edit. Start a new application and save it as draft."
                    cta="Start New Application"
                    ctaTo="/dashboard/apply"
                  />
                ) : (
                  <>
                    <div className="mb-4 p-4 rounded-xl bg-accent-500/8 border border-accent-500/20">
                      <p className="text-accent-300 text-xs flex items-center gap-2">
                        <RiInformationLine size={14} />
                        Drafts are not submitted. Click <strong>Edit</strong> to continue filling in your application before the July 31 deadline.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {drafts.map(app => <AppCard key={app._id} app={app} showEdit />)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ 5. SUBMITTED APPLICATIONS ═════════════════════════════════ */}
            {activeTab === 'submitted' && (
              <div>
                <div className="mb-6">
                  <h3 className="font-display font-bold text-white text-xl">Submitted Applications</h3>
                  <p className="text-slate-400 text-xs mt-1">Track the review status of your submissions.</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : submitted.length === 0 ? (
                  <EmptyState
                    icon={RiCheckboxCircleLine}
                    title="No Submitted Applications"
                    subtitle="You haven't submitted any applications yet. Complete a draft and submit it."
                    cta="Start an Application"
                    ctaTo="/dashboard/apply"
                  />
                ) : (
                  <>
                    {/* Status pipeline legend */}
                    <div className="mb-5 p-4 rounded-xl bg-white/3 border border-white/8">
                      <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-3">Review Pipeline</p>
                      <div className="flex flex-wrap gap-2">
                        {['submitted', 'under_review', 'eligible', 'shortlisted', 'finalist', 'winner'].map((s, i) => (
                          <div key={s} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-accent-500/60" />
                            <span className="text-slate-400 text-[10px] capitalize">{s.replace('_', ' ')}</span>
                            {i < 5 && <RiArrowRightLine size={10} className="text-slate-700" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {submitted.map(app => <AppCard key={app._id} app={app} />)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══ 6. MESSAGES ═══════════════════════════════════════════════ */}
            {activeTab === 'messages' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-xl">Messages</h3>
                    <p className="text-slate-400 text-xs mt-1">Notifications and updates from the awards team.</p>
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={markAllRead} className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-1.5">
                      <RiCheckDoubleLine size={14} /> Mark all read
                    </button>
                  )}
                </div>

                {notifLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                      <RiNotification3Line className="text-accent-400 text-2xl" />
                    </div>
                    <h4 className="font-display font-semibold text-white text-base mb-1">No Messages Yet</h4>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto">
                      You'll receive notifications here when there are updates about your application, review status, or announcements from the awards team.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div
                        key={n._id}
                        className={`p-4 rounded-xl border transition-all ${
                          n.isRead
                            ? 'bg-white/3 border-white/5'
                            : 'bg-accent-500/6 border-accent-500/25'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-700' : 'bg-accent-400'}`} />
                            <div>
                              <p className={`text-sm font-medium ${n.isRead ? 'text-slate-400' : 'text-white'}`}>{n.message || n.title}</p>
                              {n.body && <p className="text-slate-500 text-xs mt-1">{n.body}</p>}
                              <p className="text-slate-600 text-[10px] mt-2">
                                {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </div>
                          </div>
                          {!n.isRead && (
                            <button onClick={() => markRead(n._id)} className="text-xs text-accent-400 hover:text-accent-300 shrink-0 mt-0.5">
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ 7. TIMELINE ═══════════════════════════════════════════════ */}
            {activeTab === 'timeline' && (
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-6">Profile Details</h3>
                
                {/* Profile Picture Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 mb-6">
                  <div className="relative">
                    {user?.profileImage ? (
                      <img
                        src={`http://localhost:5000/${user.profileImage}`}
                        alt={user.fullName}
                        className="w-24 h-24 rounded-full object-cover border border-white/10 shadow-glow"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center text-3xl font-display font-bold text-accent-300">
                        {user?.firstName?.charAt(0) || 'C'}
                      </div>
                    )}
                    {imageUploading && (
                      <div className="absolute inset-0 bg-navy-950/70 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-white text-sm font-bold">Profile Picture</h4>
                    <p className="text-slate-500 text-xs mt-1">Supports JPEG, PNG or WebP. Max 5MB.</p>
                    <label className="mt-3 inline-flex items-center gap-2 btn-ghost text-xs !py-2 !px-3 cursor-pointer">
                      <RiUserLine className="text-sm" />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">First Name</span>
                    <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">{user?.firstName}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Last Name</span>
                    <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">{user?.lastName}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Email Address</span>
                    <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">{user?.email}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Phone Number</span>
                    <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Organisation / Institution</span>
                    <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">{user?.organization || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Designation</span>
                    <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">{user?.designation || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ══ 8. FAQs ═══════════════════════════════════════════════════ */}
            {activeTab === 'faqs' && (
              <div>
                <div className="mb-6">
                  <h3 className="font-display font-bold text-white text-xl">Frequently Asked Questions</h3>
                  <p className="text-slate-400 text-xs mt-1">Everything you need to know about the awards process.</p>
                </div>

                <div className="space-y-8">
                  {faqData.map((section, catIdx) => (
                    <div key={section.category}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-5 rounded-full bg-gradient-to-b from-accent-400 to-gold-400" />
                        <h4 className="font-display font-bold text-white text-base">{section.category}</h4>
                      </div>
                      <div className="space-y-2">
                        {section.faqs.map((faq, faqIdx) => {
                          const key = `${catIdx}-${faqIdx}`;
                          return (
                            <FAQItem
                              key={faq.q}
                              faq={faq}
                              isOpen={!!openFAQs[key]}
                              onToggle={() => toggleFAQ(catIdx, faqIdx)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-5 rounded-2xl bg-white/3 border border-white/8 text-center">
                  <p className="text-white text-sm font-semibold mb-1">Still have questions?</p>
                  <p className="text-slate-500 text-xs mb-4">Our team is happy to help. Reach out via the contact form.</p>
                  <Link to="/contact" className="btn-primary text-xs inline-flex items-center gap-1.5">
                    Contact Us <RiArrowRightLine />
                  </Link>
                </div>
              </div>
            )}

            {/* ══ 9. MY PROFILE ═════════════════════════════════════════════ */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-6">Profile Details</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Registration Number',   value: user?.registrationNumber },
                    { label: 'First Name',             value: user?.firstName },
                    { label: 'Last Name',              value: user?.lastName },
                    { label: 'Email Address',          value: user?.email },
                    { label: 'Phone Number',           value: user?.phone },
                    { label: 'Organisation / Institution', value: user?.organization },
                    { label: 'Designation',            value: user?.designation },
                  ].map(f => (
                    <div key={f.label}>
                      <span className="block text-xs text-slate-500 mb-1.5 font-medium">{f.label}</span>
                      <p className="text-white text-sm font-medium bg-white/5 p-3 rounded-xl border border-white/5">
                        {f.value || <span className="text-slate-600 italic">Not provided</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ 10. CHANGE PASSWORD ════════════════════════════════════════ */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Account Security</p>
                    <h3 className="mt-1 font-display text-2xl font-black text-white">Change Password</h3>
                    <p className="mt-1 max-w-2xl text-sm text-slate-400">Update your candidate portal credentials and keep nomination access protected.</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Signed In As</div>
                    <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Candidate'}</div>
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <form onSubmit={handleSubmit(onChangePasswordSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                    {(changeError || changeSuccess) && (
                      <div className={`mb-5 rounded-xl border p-4 text-sm ${
                        changeError
                          ? 'border-red-500/30 bg-red-500/10 text-red-400'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {changeError || changeSuccess}
                      </div>
                    )}

                    <div className="space-y-4">
                      {[
                        { id: 'change-old', label: 'Current Password', field: 'oldPassword', rules: { required: 'Current password is required' }, placeholder: 'Enter current password' },
                        { id: 'change-new', label: 'New Password', field: 'newPassword', rules: { required: 'New password is required', minLength: { value: 8, message: 'At least 8 characters' } }, placeholder: 'At least 8 characters' },
                      ].map(f => (
                        <div key={f.field}>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{f.label}</label>
                          <input id={f.id} type="password" className="input-field" placeholder={f.placeholder} {...register(f.field, f.rules)} />
                          {errors[f.field] && <p className="mt-1 text-xs text-red-400">{errors[f.field].message}</p>}
                        </div>
                      ))}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                        <input id="change-confirm" type="password" className="input-field" placeholder="Re-enter new password"
                          {...register('confirmPassword', { validate: v => v === newPassword || 'Passwords do not match' })} />
                        {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <button id="change-submit" type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
                        {isSubmitting
                          ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Updating...</>
                          : <>Update Password <RiCheckDoubleLine /></>}
                      </button>
                    </div>
                  </form>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
                          <RiLockPasswordLine size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Password Strength</h4>
                          <p className="text-xs text-slate-500">{passwordStrength} of {passwordRules.length} checks passed</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {passwordRules.map((rule, index) => (
                          <div key={rule.label} className={`h-2 rounded-full ${index < passwordStrength ? 'bg-emerald-400' : 'bg-white/10'}`} />
                        ))}
                      </div>

                      <div className="mt-4 space-y-3">
                        {passwordRules.map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2 text-sm">
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                              rule.passed
                                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
                                : 'border-white/10 bg-white/5 text-slate-500'
                            }`}>
                              {rule.passed ? '✓' : ''}
                            </span>
                            <span className={rule.passed ? 'text-slate-200' : 'text-slate-500'}>{rule.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                      <h4 className="text-sm font-bold text-white">Security Notes</h4>
                      <div className="mt-4 space-y-3 text-sm text-slate-400">
                        <div className="rounded-xl bg-navy-950/40 px-3 py-3">Use a password that is unique to this awards portal.</div>
                        <div className="rounded-xl bg-navy-950/40 px-3 py-3">Keep your nomination access private and secure.</div>
                        <div className="rounded-xl bg-navy-950/40 px-3 py-3">After updating, use the new password on your next sign-in.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
