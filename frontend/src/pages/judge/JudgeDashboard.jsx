import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  RiUserLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiCheckDoubleLine, RiStarLine, RiTimeLine,
  RiDashboardLine, RiFileList3Line, RiSearchLine,
  RiArrowRightLine, RiAwardLine, RiNotification3Line,
  RiCheckLine, RiEditLine, RiEyeLine,
  RiTrophyLine, RiBarChartBoxLine, RiCalendarLine,
  RiFilterLine, RiSortAsc, RiArrowUpLine, RiShieldLine,
  RiLightbulbLine, RiFlashlightLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api, { buildAssetUrl } from '../../services/api';
import evaluationService from '../../services/evaluation.service';
import notificationService from '../../services/notification.service';
import StatCard from '../../components/judge/StatCard';
import StatusBadge from '../../components/judge/StatusBadge';
import { SkeletonRow } from '../../components/shared/SkeletonCard';

/* ── helpers ──────────────────────────────────────────────────────────────── */
const formatRelative = (date) => {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const getEvalStatus = (app) => {
  if (!app.myEvaluation) return 'not_started';
  if (app.myEvaluation.isSubmitted) return 'submitted';
  if (app.myEvaluation.isDraft) return 'draft';
  return 'not_started';
};

/* ── sidebar nav items ───────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',    icon: RiDashboardLine },
  { id: 'evaluations', label: 'Evaluations', icon: RiStarLine },
  { id: 'profile',     label: 'My Profile',  icon: RiUserLine },
  { id: 'password',    label: 'Security',    icon: RiLockPasswordLine },
];

/* ══════════════════════════════════════════════════════════════════════════ */
const JudgeDashboard = () => {
  const { user, logout, updateUserLocal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStage, setSelectedStage] = useState('initial');

  /* data */
  const [imageUploading, setImageUploading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [stats, setStats]               = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
    designation: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  /* evaluations filter / search */
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | completed

  /* change password */
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError, setChangeError]     = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm();
  const newPassword = watch('newPassword');
  const passwordRules = [
    { label: 'At least 8 characters', passed: (newPassword || '').length >= 8 },
    { label: 'Includes an uppercase letter', passed: /[A-Z]/.test(newPassword || '') },
    { label: 'Includes a number', passed: /\d/.test(newPassword || '') },
    { label: 'Includes a symbol', passed: /[^A-Za-z0-9]/.test(newPassword || '') },
  ];
  const passwordStrength = passwordRules.filter((rule) => rule.passed).length;

  /* ── fetch ─────────────────────────────────────────────────────────────── */
  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await evaluationService.getAssignedApplications({ stage: selectedStage });
      setApplications(data.data.applications || []);
    } catch {
      toast.error('Failed to load assigned applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const { data } = await evaluationService.getJudgeStats({ stage: selectedStage });
      setStats(data.data);
    } catch {
      /* stats are nice-to-have; silently degrade */
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getNotifications({ limit: 6 });
      setNotifications(data.data.notifications || []);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    fetchAll();
    fetchStats();
  }, [selectedStage]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      organization: user.organization || '',
      designation: user.designation || '',
    });
  }, [user]);

  /* ── computed ──────────────────────────────────────────────────────────── */
  const pending   = useMemo(() => applications.filter(a => !a.myEvaluation || !a.myEvaluation.isSubmitted), [applications]);
  const completed = useMemo(() => applications.filter(a => a.myEvaluation?.isSubmitted), [applications]);

  const displayStats = useMemo(() => {
    if (stats?.stats?.initial && stats?.stats?.f2f) return stats.stats;

    // Fallback if the legacy stats object structure is returned
    if (stats?.stats && typeof stats.stats.total === 'number') {
      const isF2F = selectedStage === 'f2f';
      return {
        initial: {
          total: !isF2F ? stats.stats.total : 0,
          completed: !isF2F ? stats.stats.completed : 0,
          pending: !isF2F ? stats.stats.pending : 0,
          avgScore: !isF2F ? stats.stats.avgScore : 0,
          deadline: null
        },
        f2f: {
          total: isF2F ? stats.stats.total : 0,
          completed: isF2F ? stats.stats.completed : 0,
          pending: isF2F ? stats.stats.pending : 0,
          avgScore: isF2F ? stats.stats.avgScore : 0,
          deadline: null
        }
      };
    }

    return {
      initial: {
        total: selectedStage === 'initial' ? applications.length : 0,
        completed: selectedStage === 'initial' ? completed.length : 0,
        pending: selectedStage === 'initial' ? pending.length : 0,
        avgScore: selectedStage === 'initial' ? (completed.reduce((s, a) => s + (a.myEvaluation?.weightedScore || 0), 0) / (completed.length || 1)) : 0,
        deadline: null
      },
      f2f: {
        total: selectedStage === 'f2f' ? applications.length : 0,
        completed: selectedStage === 'f2f' ? completed.length : 0,
        pending: selectedStage === 'f2f' ? pending.length : 0,
        avgScore: selectedStage === 'f2f' ? (completed.reduce((s, a) => s + (a.myEvaluation?.weightedScore || 0), 0) / (completed.length || 1)) : 0,
        deadline: null
      }
    };
  }, [stats, selectedStage, applications, pending, completed]);

  const activeStats = selectedStage === 'f2f' ? displayStats.f2f : displayStats.initial;
  const progress = activeStats.total > 0 ? Math.round((activeStats.completed / activeStats.total) * 100) : 0;

  const filteredApps = useMemo(() => {
    let base = filter === 'pending' ? pending : filter === 'completed' ? completed : applications;
    if (search.trim()) {
      const q = search.toLowerCase();
      base = base.filter(a =>
        a.projectTitle?.toLowerCase().includes(q) ||
        a.category?.name?.toLowerCase().includes(q) ||
        a.candidate?.fullName?.toLowerCase().includes(q)
      );
    }
    return base;
  }, [applications, pending, completed, filter, search]);

  /* ── handlers ──────────────────────────────────────────────────────────── */
  const handleLogout = () => { logout(); navigate('/'); };

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

  const handleProfileFormChange = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      const { data } = await api.patch('/auth/profile', profileForm);
      updateUserLocal(data.data.user);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── animation variants ────────────────────────────────────────────────── */
  const panelVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-navy-950 pt-20 flex flex-col">

      {/* ── Page Shell ─────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <aside className="lg:col-span-1 space-y-4">

          {/* Judge card */}
          <div
            className="rounded-2xl border border-white/8 p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
          >
            {/* Avatar */}
            <div className="relative w-16 h-16 mx-auto mb-4">
              {user?.profileImage ? (
                <img
                  src={buildAssetUrl(user.profileImage)}
                  alt={user.fullName}
                  className="w-16 h-16 rounded-full object-cover border border-white/20 shadow-glow"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-500 to-gold-500 flex items-center justify-center text-2xl font-display font-bold text-white shadow-glow">
                  {user?.firstName?.charAt(0) || 'J'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 border-2 border-navy-950 rounded-full" />
            </div>
            <h2 className="font-display font-bold text-white text-base leading-tight">{user?.fullName}</h2>
            <p className="text-slate-500 text-xs mt-0.5">{user?.designation || 'Evaluation Panel'}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-accent-500/15 text-accent-300 border border-accent-500/20">
              <RiShieldLine className="text-[10px]" /> Judge
            </span>
          </div>

          {/* Progress mini-card */}
          <div
            className="rounded-2xl border border-white/8 p-4"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-xs font-medium">Completion</span>
              <span className="text-white text-xs font-bold font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #0072ff, #00ff87)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">
              {displayStats.completed}/{displayStats.total} evaluations done
            </p>
          </div>

          {/* Nav */}
          <div
            className="rounded-2xl border border-white/8 p-2 space-y-0.5"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
          >
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-accent-500 text-white shadow-glow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={17} />
                {item.label}
                {item.id === 'evaluations' && pending.length > 0 && (
                  <span className="ml-auto text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                    {pending.length}
                  </span>
                )}
              </motion.button>
            ))}
            <div className="border-t border-white/5 mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/8 transition-all"
              >
                <RiLogoutBoxLine size={17} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ───────────────────────────────────────────────────── */}
        <main className="lg:col-span-1 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={panelVariants} initial="initial" animate="animate" exit="exit">

              {/* ════════════════════════════════════════════════════════════ */}
              {/* OVERVIEW TAB                                                */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div className="space-y-6">

                  {/* Welcome hero */}
                  <div
                    className="rounded-2xl border border-white/8 p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(0,114,255,0.08) 0%, rgba(0,255,135,0.04) 100%)', backdropFilter: 'blur(16px)' }}
                  >
                    <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Welcome back,</p>
                        <h1 className="font-display font-black text-2xl text-white leading-tight">
                          {user?.firstName} {user?.lastName} 👋
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                          SLT Mobitel National AI Awards 2026 · Evaluation Panel
                        </p>
                        {stats?.categories?.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {stats.categories.map(cat => (
                              <span key={cat} className="badge-gold text-[10px] px-2 py-0.5">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setActiveTab('evaluations')}
                          className="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-1.5"
                        >
                          <RiStarLine /> View Evaluations
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Stats cards */}
                  <div className="space-y-6">
                    {/* Initial Stage stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-accent-500 shadow-glow" /> Initial Stage Evaluations
                        </h3>
                        {displayStats.initial?.deadline && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                            Deadline: {new Date(displayStats.initial.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/8 p-5 animate-pulse bg-white/2 h-28" />
                          ))
                        ) : (
                          <>
                            <StatCard icon={RiFileList3Line} label="Total Assigned" value={displayStats.initial?.total || 0} color="accent" delay={0} />
                            <StatCard icon={RiTimeLine}      label="Pending"         value={displayStats.initial?.pending || 0} color="amber" delay={0.05} />
                            <StatCard icon={RiCheckDoubleLine} label="Completed"     value={displayStats.initial?.completed || 0} color="emerald" delay={0.1} />
                            <StatCard
                              icon={RiBarChartBoxLine}
                              label="Avg Score"
                              value={displayStats.initial?.avgScore ? `${displayStats.initial.avgScore.toFixed(1)}%` : '—'}
                              color="violet"
                              delay={0.15}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    {/* Face-to-Face Stage stats */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow" /> Face-to-Face Stage Evaluations
                        </h3>
                        {displayStats.f2f?.deadline && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                            Deadline: {new Date(displayStats.f2f.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsLoading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="rounded-2xl border border-white/8 p-5 animate-pulse bg-white/2 h-28" />
                          ))
                        ) : (
                          <>
                            <StatCard icon={RiFileList3Line} label="Total Assigned" value={displayStats.f2f?.total || 0} color="accent" delay={0} />
                            <StatCard icon={RiTimeLine}      label="Pending"         value={displayStats.f2f?.pending || 0} color="amber" delay={0.05} />
                            <StatCard icon={RiCheckDoubleLine} label="Completed"     value={displayStats.f2f?.completed || 0} color="emerald" delay={0.1} />
                            <StatCard
                              icon={RiBarChartBoxLine}
                              label="Avg Score"
                              value={displayStats.f2f?.avgScore ? `${displayStats.f2f.avgScore.toFixed(1)}%` : '—'}
                              color="emerald"
                              delay={0.15}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Two-column: activity + quick actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Recent Activity */}
                    <div
                      className="rounded-2xl border border-white/8 p-5"
                      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
                    >
                      <h3 className="font-display font-bold text-white text-sm mb-4 flex items-center gap-2">
                        <RiFlashlightLine className="text-accent-400" /> Recent Activity
                      </h3>
                      {loading ? (
                        <div className="space-y-3">
                          {[1,2,3].map(i => <SkeletonRow key={i} cols={3} />)}
                        </div>
                      ) : stats?.recentActivity?.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentActivity.map((act, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                act.status === 'submitted' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                              }`}>
                                {act.status === 'submitted'
                                  ? <RiCheckLine className="text-emerald-400 text-sm" />
                                  : <RiEditLine className="text-amber-400 text-sm" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{act.projectTitle || 'Application'}</p>
                                <p className="text-slate-500 text-[10px] mt-0.5">
                                  {act.status === 'submitted' ? 'Evaluation submitted' : 'Draft saved'} · {formatRelative(act.updatedAt)}
                                </p>
                              </div>
                              {act.score > 0 && (
                                <span className="text-xs font-mono text-accent-400">{act.score.toFixed(0)}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : applications.length > 0 ? (
                        /* Derive from applications if stats not available */
                        <div className="space-y-3">
                          {applications.slice(0, 5).map((app) => (
                            <div key={app._id} className="flex items-start gap-3">
                              <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                app.myEvaluation?.isSubmitted ? 'bg-emerald-500/15' : 'bg-accent-500/15'
                              }`}>
                                {app.myEvaluation?.isSubmitted
                                  ? <RiCheckLine className="text-emerald-400 text-sm" />
                                  : <RiFileList3Line className="text-accent-400 text-sm" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-xs font-medium truncate">{app.projectTitle}</p>
                                <p className="text-slate-500 text-[10px] mt-0.5">
                                  {app.myEvaluation?.isSubmitted ? 'Submitted' : app.myEvaluation?.isDraft ? 'Draft' : 'Assigned'} · {formatRelative(app.updatedAt)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-500 text-xs">No activity yet.</p>
                      )}
                    </div>

                    {/* Notifications + Quick Actions */}
                    <div className="space-y-4">
                      {/* Notifications */}
                      <div
                        className="rounded-2xl border border-white/8 p-5"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
                      >
                        <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <RiNotification3Line className="text-gold-400" /> Notifications
                          {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="ml-auto text-[9px] font-bold bg-accent-500/20 text-accent-300 border border-accent-500/30 px-1.5 py-0.5 rounded-full">
                              {notifications.filter(n => !n.isRead).length} new
                            </span>
                          )}
                        </h3>
                        {notifications.length === 0 ? (
                          <p className="text-slate-500 text-xs">No notifications.</p>
                        ) : (
                          <div className="space-y-2.5">
                            {notifications.slice(0, 4).map(n => (
                              <div key={n._id} className={`flex items-start gap-2.5 ${!n.isRead ? 'opacity-100' : 'opacity-60'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-accent-400' : 'bg-slate-600'}`} />
                                <div>
                                  <p className="text-white text-xs font-medium">{n.title}</p>
                                  <p className="text-slate-500 text-[10px]">{formatRelative(n.createdAt)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div
                        className="rounded-2xl border border-white/8 p-5"
                        style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
                      >
                        <h3 className="font-display font-bold text-white text-sm mb-3 flex items-center gap-2">
                          <RiLightbulbLine className="text-amber-400" /> Quick Actions
                        </h3>
                        <div className="space-y-2">
                          {[
                            { label: 'View Assigned Evaluations', icon: RiStarLine,       tab: 'evaluations' },
                            { label: 'My Profile',                icon: RiUserLine,        tab: 'profile' },
                            { label: 'Change Password',           icon: RiLockPasswordLine, tab: 'password' },
                          ].map(a => (
                            <motion.button
                              key={a.tab}
                              whileHover={{ x: 3 }}
                              onClick={() => setActiveTab(a.tab)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-medium"
                            >
                              <a.icon className="text-accent-400 text-sm" />
                              {a.label}
                              <RiArrowRightLine className="ml-auto text-slate-600 text-sm" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation deadline info */}
                  <div
                    className="rounded-2xl border border-gold-500/20 p-5"
                    style={{ background: 'rgba(0,255,135,0.03)', backdropFilter: 'blur(16px)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                        <RiCalendarLine className="text-gold-400 text-lg" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-white text-sm">Evaluation Period Active</h4>
                        <p className="text-slate-400 text-xs mt-0.5 max-w-xl">
                          You are currently in the active evaluation window for SLT Mobitel National AI Awards 2026.
                          Please complete all assigned evaluations before the deadline. Contact the awards committee for deadline-specific information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* EVALUATIONS TAB                                             */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'evaluations' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display font-bold text-white text-xl">Assigned Evaluations</h2>
                      <p className="text-slate-400 text-xs mt-0.5">Review, score, and comment on assigned AI Awards submissions.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono">{filteredApps.length} entries</span>
                    </div>
                  </div>

                  {/* Search + Filter bar */}
                  <div
                    className="rounded-2xl border border-white/8 p-4 flex flex-col sm:flex-row gap-3"
                    style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
                  >
                    {/* Stage Selection */}
                    <div className="flex-shrink-0">
                      <select
                        className="bg-navy-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white"
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                      >
                        <option value="initial">Initial Stage</option>
                        <option value="f2f">Face-to-Face Stage</option>
                      </select>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                      <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                      <input
                        id="eval-search"
                        type="text"
                        placeholder="Search by project, category or applicant…"
                        className="input-field pl-9 !py-2.5 text-xs"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                    </div>
                    {/* Filter tabs */}
                    <div className="flex rounded-xl overflow-hidden border border-white/8">
                      {[
                        { key: 'all',       label: 'All',       count: applications.length },
                        { key: 'pending',   label: 'Pending',   count: pending.length },
                        { key: 'completed', label: 'Completed', count: completed.length },
                      ].map(f => (
                        <button
                          key={f.key}
                          onClick={() => setFilter(f.key)}
                          className={`px-3 py-2 text-xs font-medium transition-all flex items-center gap-1.5 ${
                            filter === f.key
                              ? 'bg-accent-500 text-white'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {f.label}
                          <span className={`text-[9px] px-1 rounded ${filter === f.key ? 'bg-white/20' : 'bg-white/5'}`}>{f.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Applications list */}
                  {loading ? (
                    <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} className="border-b border-white/5 last:border-0">
                          <SkeletonRow cols={4} />
                        </div>
                      ))}
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl border border-dashed border-white/10 p-16 text-center"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto mb-5">
                        <RiTrophyLine className="text-accent-400 text-2xl" />
                      </div>
                      <h4 className="font-display font-bold text-white text-lg mb-2">
                        {search ? 'No Matches Found' : 'No Assignments Yet'}
                      </h4>
                      <p className="text-slate-500 text-sm max-w-sm mx-auto">
                        {search
                          ? 'Try adjusting your search term or filter.'
                          : 'Once nominations close, administrators will assign submissions for your evaluation.'}
                      </p>
                      {search && (
                        <button onClick={() => setSearch('')} className="btn-ghost text-xs !py-2 !px-4 mt-4">
                          Clear Search
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <div
                      className="rounded-2xl border border-white/8 overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}
                    >
                      {/* Table header */}
                      <div className="hidden sm:grid grid-cols-[2fr_140px_140px_100px_120px] gap-4 px-5 py-3 border-b border-white/5 bg-white/2">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
                          <RiSortAsc className="text-xs" /> Project
                        </span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Category</span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Deadline</span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Status</span>
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Actions</span>
                      </div>

                      {/* Rows */}
                      <AnimatePresence>
                        {filteredApps.map((app, i) => {
                          const status = getEvalStatus(app);
                          const isSubmitted = app.myEvaluation?.isSubmitted;
                          const activeDeadline = selectedStage === 'f2f' ? app.deadlineF2F : app.deadline;
                          return (
                            <motion.div
                              key={app._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="grid grid-cols-1 sm:grid-cols-[2fr_140px_140px_100px_120px] gap-3 sm:gap-4 px-5 py-4 border-b border-white/5 last:border-0 hover:bg-white/2 transition-all group items-center"
                            >
                              {/* Project info */}
                              <div className="min-w-0">
                                <h5 className="font-display font-bold text-white text-sm truncate group-hover:text-accent-300 transition-colors">
                                  {app.projectTitle}
                                </h5>
                                <p className="text-slate-500 text-xs mt-0.5 truncate">
                                  {app.candidate?.fullName}{app.candidate?.organization ? ` · ${app.candidate.organization}` : ''}
                                </p>
                                {isSubmitted && (
                                  <p className="text-slate-500 text-xs mt-0.5">
                                    Score: <span className="text-accent-300 font-mono">{app.myEvaluation.weightedScore?.toFixed(1)}/100</span>
                                  </p>
                                )}
                              </div>

                              {/* Category */}
                              <div className="hidden sm:block">
                                <span className="badge-gold text-[9px] px-2 py-0.5 whitespace-nowrap">
                                  {app.category?.name || '—'}
                                </span>
                              </div>

                              {/* Deadline */}
                              <div className="hidden sm:block">
                                {activeDeadline && new Date(activeDeadline) < new Date() ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                    <span className="text-[10px] font-mono text-red-400 font-semibold">
                                      Overdue
                                    </span>
                                  </div>
                                ) : (
                                  <span className={`text-[10px] font-mono ${activeDeadline ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {activeDeadline ? new Date(activeDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not set'}
                                  </span>
                                )}
                              </div>

                              {/* Status */}
                              <div>
                                <StatusBadge status={status} />
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {activeDeadline && new Date(activeDeadline) < new Date() && !isSubmitted ? (
                                  <button
                                    disabled
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/50 border border-slate-600/50 text-slate-400 cursor-not-allowed"
                                    title="Evaluation deadline has passed"
                                  >
                                    <RiTimeLine /> Closed
                                  </button>
                                ) : (
                                  <Link
                                    to={`/judge-dashboard/evaluate/${app._id}?stage=${selectedStage}`}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                      isSubmitted
                                        ? 'bg-white/5 border border-white/10 text-slate-300 hover:border-accent-500/40 hover:text-white'
                                        : 'btn-primary !py-1.5 !px-3 !text-xs'
                                    }`}
                                  >
                                    {isSubmitted
                                      ? <><RiEyeLine /> View</>
                                      : status === 'draft'
                                        ? <><RiEditLine /> Continue</>
                                        : <><RiStarLine /> Evaluate</>
                                    }
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* PROFILE TAB                                                 */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'profile' && (
                <div
                  className="rounded-2xl border border-white/8 p-7"
                  style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)' }}
                >
                  <div className="flex items-center gap-3 mb-7">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/15 border border-accent-500/20 flex items-center justify-center">
                      <RiUserLine className="text-accent-400 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-lg">Profile Details</h3>
                      <p className="text-slate-500 text-xs">Your account information on record.</p>
                    </div>
                  </div>

                  {/* Profile Picture Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 mb-6">
                    <div className="relative">
                      {user?.profileImage ? (
                        <img
                          src={buildAssetUrl(user.profileImage)}
                          alt={user.fullName}
                          className="w-24 h-24 rounded-full object-cover border border-white/10 shadow-glow"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-500 to-gold-500 flex items-center justify-center text-3xl font-display font-bold text-white shadow-glow">
                          {user?.firstName?.charAt(0) || 'J'}
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

                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">Email Address</span>
                        <p className="text-white text-sm font-medium bg-white/4 px-4 py-3 rounded-xl border border-white/6 truncate">
                          {user?.email}
                        </p>
                      </div>
                      {[
                        { label: 'First Name', field: 'firstName', required: true },
                        { label: 'Last Name', field: 'lastName', required: true },
                        { label: 'Phone Number', field: 'phone' },
                        { label: 'Organisation', field: 'organization' },
                        { label: 'Designation', field: 'designation' },
                      ].map((field) => (
                        <div key={field.field}>
                          <label className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">{field.label}</label>
                          <input
                            className="input-field"
                            value={profileForm[field.field]}
                            onChange={(e) => handleProfileFormChange(field.field, e.target.value)}
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                    <button type="submit" disabled={profileSaving} className="btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-60">
                      {profileSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════ */}
              {/* CHANGE PASSWORD TAB                                         */}
              {/* ════════════════════════════════════════════════════════════ */}
              {activeTab === 'password' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Account Security</p>
                      <h3 className="mt-1 font-display text-2xl font-black text-white">Change Password</h3>
                      <p className="mt-1 max-w-2xl text-sm text-slate-400">Update your judge portal credentials and keep evaluation access protected.</p>
                    </div>
                    <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Signed In As</div>
                      <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email}</div>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <form onSubmit={handleSubmit(onChangePasswordSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6 space-y-4">
                      {(changeError || changeSuccess) && (
                        <div className={`p-4 rounded-xl border text-sm ${
                          changeError
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {changeError || changeSuccess}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Current Password *</label>
                        <input
                          id="judge-oldpassword"
                          type="password"
                          className="input-field"
                          placeholder="Enter current password"
                          {...register('oldPassword', { required: 'Current password is required' })}
                        />
                        {errors.oldPassword && <p className="text-red-400 text-xs mt-1">{errors.oldPassword.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">New Password *</label>
                        <input
                          id="judge-newpassword"
                          type="password"
                          className="input-field"
                          placeholder="At least 8 characters"
                          {...register('newPassword', {
                            required: 'New password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          })}
                        />
                        {errors.newPassword && <p className="text-red-400 text-xs mt-1">{errors.newPassword.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm New Password *</label>
                        <input
                          id="judge-confirm"
                          type="password"
                          className="input-field"
                          placeholder="Re-enter new password"
                          {...register('confirmPassword', {
                            validate: v => v === newPassword || 'Passwords do not match',
                          })}
                        />
                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                      </div>
                      <button
                        id="judge-change-submit"
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full mt-2"
                        style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                      >
                        {isSubmitting
                          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                          : <><RiCheckDoubleLine /> Update Password</>
                        }
                      </button>
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
                          <div className="rounded-xl bg-navy-950/40 px-3 py-3">Keep your evaluation portal access private and secure.</div>
                          <div className="rounded-xl bg-navy-950/40 px-3 py-3">After updating, use the new password on your next sign-in.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default JudgeDashboard;
