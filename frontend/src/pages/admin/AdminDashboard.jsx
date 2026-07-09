// import { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { motion } from 'framer-motion';
// import { toast } from 'react-hot-toast';
// import {
//   ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import {
//   RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
//   RiCheckDoubleLine, RiFileList3Line, RiTeamLine,
//   RiDashboardLine, RiFileChartLine, RiMailSendLine,
//   RiArrowRightLine, RiFolderShield2Line, RiRefreshLine, RiPulseLine, RiStarLine,
// } from 'react-icons/ri';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import adminService from '../../services/admin.service';
// import applicationService from '../../services/application.service';
// import categoryService from '../../services/category.service';
// import evaluationCriteriaService from '../../services/evaluationCriteria.service';
import evaluationService from '../../services/evaluation.service';

// const COLORS = ['#0072ff', '#00ff87', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c'];

// const STATUS_LABELS = {
//   draft: 'Draft',
//   submitted: 'Submitted',
//   under_review: 'Under Review',
//   eligible: 'Eligible',
//   ineligible: 'Ineligible',
//   shortlisted: 'Shortlisted',
//   finalist: 'Finalist',
//   winner: 'Winner',
//   runner_up: 'Runner-up',
// };

// const STATUS_TRANSITIONS = {
//   draft: ['submitted'],
//   submitted: ['under_review', 'draft'],
//   under_review: ['eligible', 'ineligible'],
//   eligible: ['shortlisted', 'under_review'],
//   ineligible: ['under_review'],
//   shortlisted: ['finalist', 'eligible'],
//   finalist: ['winner', 'runner_up', 'shortlisted'],
//   winner: [],
//   runner_up: [],
// };

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState('overview');

//   // Stats & listings
//   const [stats, setStats] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [admins, setAdmins] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [monitoring, setMonitoring] = useState(null);
//   const [judgeProgress, setJudgeProgress] = useState([]);
//   const [criteria, setCriteria] = useState([]);
//   const [editingCriteriaId, setEditingCriteriaId] = useState(null);
//   const [criteriaForm, setCriteriaForm] = useState({
//     name: '',
//     description: '',
//     weight: 10,
//     maxScore: 10,
//     criteriaType: 'organizational',
//     order: 0,
//     isActive: true,
//   });
//   const [loading, setLoading] = useState(true);

//   // Search & Filters
//   const [appSearch, setAppSearch] = useState('');
//   const [appStatusFilter, setAppStatusFilter] = useState('');
//   const [userRoleFilter, setUserRoleFilter] = useState('');

//   // Assign Judge Modal
//   const [selectedApp, setSelectedApp] = useState(null);
//   const [selectedJudges, setSelectedJudges] = useState([]);
//   const [assignModalOpen, setAssignModalOpen] = useState(false);
//   const [selectedReportIds, setSelectedReportIds] = useState([]);
//   const [reportActionBusy, setReportActionBusy] = useState(false);

//   // Change Password form
//   const [changeSuccess, setChangeSuccess] = useState('');
//   const [changeError,   setChangeError]   = useState('');
//   const [eligibilityReview, setEligibilityReview] = useState({ appId: null, isEligible: true, note: '' });
//   const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors, isSubmitting: passSubmitting }, watch, reset: resetPassword } = useForm();
//   const newPassword = watch('newPassword');
//   const passwordRules = [
//     { label: 'At least 8 characters', passed: (newPassword || '').length >= 8 },
//     { label: 'Includes an uppercase letter', passed: /[A-Z]/.test(newPassword || '') },
//     { label: 'Includes a number', passed: /\d/.test(newPassword || '') },
//     { label: 'Includes a symbol', passed: /[^A-Za-z0-9]/.test(newPassword || '') },
//   ];
//   const passwordStrength = passwordRules.filter((rule) => rule.passed).length;

//   // Broadcast form
//   const { register: regBroadcast, handleSubmit: handleBroadcast, reset: resetBroadcast, watch: watchBroadcast, formState: { isSubmitting: broadcastSubmitting } } = useForm({
//     defaultValues: { role: 'all', title: '', message: '' },
//   });

//   const fetchStats = async () => {
//     try {
//       const { data } = await adminService.getDashboardStats();
//       setStats(data.data);
//     } catch { toast.error('Failed to load dashboard statistics.'); }
//   };

//   const fetchApps = async () => {
//     try {
//       const params = {
//         search: appSearch || undefined,
//         status: appStatusFilter || undefined,
//         limit: 100,
//       };
//       const { data } = await applicationService.getAllApplications(params);
//       setApplications(data.data.applications);
//     } catch { toast.error('Failed to load applications.'); }
//   };

//   const fetchUsers = async () => {
//     try {
//       const params = { role: userRoleFilter || undefined, limit: 100 };
//       const { data } = await adminService.getUsers(params);
//       setUsers(data.data.users);
//     } catch { toast.error('Failed to load users.'); }
//   };

//   const fetchAdmins = async () => {
//     try {
//       const { data } = await adminService.getUsers({ role: 'admin', limit: 100 });
//       setAdmins(data.data.users);
//     } catch { toast.error('Failed to load admins.'); }
//   };

//   const fetchCategories = async () => {
//     try {
//       const { data } = await categoryService.getCategories();
//       setCategories(data.data.categories);
//     } catch { toast.error('Failed to load categories.'); }
//   };

//   const fetchMonitoring = async () => {
//     try {
//       const [{ data: monitoringData }, { data: judgeProgressData }] = await Promise.all([
//         applicationService.getMonitoringOverview(),
//         applicationService.getJudgeProgress(),
//       ]);
//       setMonitoring(monitoringData.data.overview);
//       setJudgeProgress(judgeProgressData.data.progress || []);
//     } catch {
//       toast.error('Failed to load monitoring metrics.');
//     }
//   };

//   const fetchCriteria = async () => {
//     try {
//       const { data } = await evaluationCriteriaService.getAllCriteria();
//       setCriteria(data.data.criteria);
//     } catch { toast.error('Failed to load evaluation criteria.'); }
//   };

//   const loadAll = async () => {
//     setLoading(true);
//     await Promise.all([
//       fetchStats(),
//       fetchApps(),
//       fetchUsers(),
//       fetchAdmins(),
//       fetchCategories(),
//       fetchMonitoring(),
//       fetchCriteria(),
//     ]);
//     setLoading(false);
//   };

//   useEffect(() => {
//     loadAll();
//   }, [appSearch, appStatusFilter, userRoleFilter]);

//   const handleLogout = () => {
//     logout();
//     navigate('/');
//   };

//   const judgesList = users.filter((userItem) => userItem.role === 'judge');
//   const candidatesList = users.filter((userItem) => userItem.role === 'candidate');
//   const broadcastRole = watchBroadcast('role') || 'all';
//   const broadcastTitle = watchBroadcast('title') || '';
//   const broadcastMessage = watchBroadcast('message') || '';
//   const broadcastAudienceCount = broadcastRole === 'judge'
//     ? judgesList.length
//     : broadcastRole === 'candidate'
//       ? candidatesList.length
//       : users.length;

//   // Change Password submit
//   const onChangePasswordSubmit = async (data) => {
//     try {
//       setChangeError('');
//       setChangeSuccess('');
//       await api.post('/auth/change-password', {
//         oldPassword: data.oldPassword,
//         newPassword: data.newPassword,
//       });
//       setChangeSuccess('Password updated successfully!');
//       toast.success('Password changed successfully.');
//       resetPassword();
//     } catch (err) {
//       setChangeError(err.response?.data?.message || 'Failed to update password.');
//       toast.error('Password change failed.');
//     }
//   };

//   // Status transitions
//   const handleStatusChange = async (appId, newStatus) => {
//     const app = applications.find((item) => item._id === appId);
//     if (!app || app.status === newStatus) return;

//     try {
//       await applicationService.changeStatus(appId, { status: newStatus });
//       toast.success('Application status updated.');
//       fetchApps();
//       fetchStats();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update status.');
//     }
//   };

//   const handleDeleteApplication = async (app) => {
//     const title = app.projectTitle || app.referenceNumber || 'this application';
//     if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return;

//     try {
//       await applicationService.deleteApplicationAsAdmin(app._id);
//       toast.success('Application deleted.');
//       fetchApps();
//       fetchStats();
//       fetchMonitoring();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to delete application.');
//     }
//   };

//   // User Activation Toggle
//   const handleToggleUser = async (userId) => {
//     try {
//       await adminService.toggleUserStatus(userId);
//       toast.success('User status updated.');
//       fetchUsers();
//       fetchAdmins();
//     } catch {
//       toast.error('Failed to toggle user status.');
//     }
//   };

//   // User Delete
//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
//     try {
//       await adminService.deleteUser(userId);
//       toast.success('User deleted.');
//       fetchUsers();
//       fetchAdmins();
//     } catch {
//       toast.error('Failed to delete user.');
//     }
//   };

//   const handleDeleteCategory = async (id) => {
//     if (!window.confirm('Delete this category?')) return;
//     try {
//       await categoryService.deleteCategory(id);
//       toast.success('Category deleted.');
//       fetchCategories();
//     } catch {
//       toast.error('Failed to delete category.');
//     }
//   };

//   // Seed default categories
//   const handleSeedCategories = async () => {
//     try {
//       const { data } = await categoryService.seedDefaults();
//       toast.success(data.message);
//       fetchCategories();
//     } catch {
//       toast.error('Failed to seed default categories.');
//     }
//   };

//   // ── Criteria Management Handlers ──
//   const handleSubmitCriteria = async (e) => {
//     e.preventDefault();
//     try {
//       const payload = {
//         ...criteriaForm,
//         weight: Number(criteriaForm.weight || 0),
//         maxScore: Number(criteriaForm.maxScore || 0),
//         order: Number(criteriaForm.order || 0),
//       };
//       if (editingCriteriaId) {
//         await evaluationCriteriaService.updateCriteria(editingCriteriaId, payload);
//         toast.success('Evaluation criteria updated.');
//       } else {
//         await evaluationCriteriaService.createCriteria(payload);
//         toast.success('Evaluation criteria created.');
//       }
//       setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', order: 0, isActive: true });
//       setEditingCriteriaId(null);
//       fetchCriteria();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to save evaluation criteria.');
//     }
//   };

//   const handleEditCriteria = (c) => {
//     setEditingCriteriaId(c._id);
//     setCriteriaForm({
//       name: c.name || '',
//       description: c.description || '',
//       weight: c.weight || 10,
//       maxScore: c.maxScore || 10,
//       criteriaType: c.criteriaType || 'organizational',
//       order: c.order || 0,
//       isActive: c.isActive !== false,
//     });
//   };

//   const handleDeleteCriteria = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this evaluation criterion?')) return;
//     try {
//       await evaluationCriteriaService.deleteCriteria(id);
//       toast.success('Evaluation criteria deleted.');
//       fetchCriteria();
//     } catch {
//       toast.error('Failed to delete criteria.');
//     }
//   };

//   const handleSeedCriteria = async () => {
//     try {
//       const { data } = await evaluationCriteriaService.seedDefaults();
//       toast.success(data.message);
//       fetchCriteria();
//     } catch {
//       toast.error('Failed to seed default evaluation criteria.');
//     }
//   };

//   // Broadcast submit
//   const onBroadcastSubmit = async (data) => {
//     try {
//       await adminService.broadcastNotification(data);
//       toast.success('Broadcast notification sent successfully.');
//       resetBroadcast();
//     } catch {
//       toast.error('Failed to send broadcast.');
//     }
//   };

//   // Open Judge Assignment
//   const openAssignModal = (app) => {
//     setSelectedApp(app);
//     setSelectedJudges(app.assignedJudges?.map(j => j._id || j) || []);
//     setAssignModalOpen(true);
//   };

//   const handleAssignSubmit = async () => {
//     try {
//       await applicationService.assignJudges(selectedApp._id, selectedJudges);
//       toast.success('Judges assigned successfully.');
//       setAssignModalOpen(false);
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to assign judges.');
//     }
//   };

//   const handleEligibilityReview = async (e) => {
//     e.preventDefault();
//     try {
//       await applicationService.reviewEligibility(eligibilityReview.appId, {
//         isEligible: eligibilityReview.isEligible,
//         note: eligibilityReview.note,
//       });
//       toast.success('Eligibility review saved.');
//       setEligibilityReview({ appId: null, isEligible: true, note: '' });
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to save eligibility review.');
//     }
//   };

//   const toggleJudgeSelection = (judgeId) => {
//     setSelectedJudges(prev =>
//       prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
//     );
//   };

//   const toggleReportSelection = (appId) => {
//     setSelectedReportIds((prev) => prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]);
//   };

//   const handleExportReport = async (format = 'csv') => {
//     try {
//       const { data } = await applicationService.exportApplications(format);
//       const fileName = `ai-awards-report.${format}`;
//       const blob = new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = fileName;
//       link.click();
//       window.URL.revokeObjectURL(url);
//       toast.success(`Exported ${fileName}.`);
//     } catch {
//       toast.error('Report export failed.');
//     }
//   };

//   const handlePublishFinalists = async () => {
//     if (!selectedReportIds.length) {
//       toast.error('Select at least one application first.');
//       return;
//     }

//     setReportActionBusy(true);
//     try {
//       await applicationService.publishFinalists(selectedReportIds);
//       toast.success('Finalists published.');
//       setSelectedReportIds([]);
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to publish finalists.');
//     } finally {
//       setReportActionBusy(false);
//     }
//   };

//   const handlePublishWinners = async () => {
//     if (!selectedReportIds.length) {
//       toast.error('Select at least one application first.');
//       return;
//     }

//     setReportActionBusy(true);
//     try {
//       await applicationService.publishWinners(selectedReportIds);
//       toast.success('Winners published.');
//       setSelectedReportIds([]);
//       fetchApps();
//       fetchMonitoring();
//     } catch {
//       toast.error('Failed to publish winners.');
//     } finally {
//       setReportActionBusy(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
//       {/* Main dashboard content */}
//       <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
//         {/* Sidebar Nav */}
//         <div className="lg:col-span-1 space-y-4">
//           <div className="glass-card p-6 text-center !hover:transform-none">
//             <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
//               {user?.firstName?.charAt(0) || 'A'}
//             </div>
//             <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
//             <span className="badge-gold mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
//           </div>

//           <div className="glass-card p-2 space-y-1 !hover:transform-none">
//             {[
//               { id: 'overview', label: 'Dashboard Overview', icon: RiDashboardLine },
//               { id: 'applications', label: 'Manage Nominations', icon: RiFileList3Line },
//               { id: 'monitoring', label: 'Application Monitoring', icon: RiFileChartLine },
//               { id: 'users', label: 'User Directory', icon: RiTeamLine },
//               { id: 'categories', label: 'Categories', icon: RiFolderShield2Line },
//               { id: 'criteria', label: 'Evaluation Criteria', icon: RiStarLine },
//               { id: 'broadcast', label: 'Broadcast Alerts', icon: RiMailSendLine },
//               { id: 'reports', label: 'Reports & Export', icon: RiFileChartLine },
//               { id: 'password', label: 'Change Password', icon: RiLockPasswordLine },
//             ].map((tab) => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
//                   activeTab === tab.id
//                     ? 'bg-accent-500 text-white shadow-glow'
//                     : 'text-slate-400 hover:bg-white/5 hover:text-white'
//                 }`}
//               >
//                 <tab.icon size={18} />
//                 {tab.label}
//               </button>
//             ))}
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
//             >
//               <RiLogoutBoxLine size={18} />
//               Sign Out
//             </button>
//           </div>
//         </div>

//         {/* Tab Panel */}
//         <div className="lg:col-span-3">
//           <motion.div
//             key={activeTab}
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="glass-card p-8 !hover:transform-none h-full min-h-[500px]"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center h-96">
//                 <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
//               </div>
//             ) : (
//               <>
//                 {/* 1. OVERVIEW TAB */}
//                 {activeTab === 'overview' && stats && (
//                   <div className="space-y-8">
//                     <h3 className="font-display font-bold text-white text-xl flex justify-between items-center">
//                       Dashboard Statistics
//                       <button onClick={loadAll} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
//                         <RiRefreshLine size={16} />
//                       </button>
//                     </h3>

//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
//                         <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Applications</span>
//                         <p className="text-white text-3xl font-black mt-2 font-display">{stats.stats.totalApplications}</p>
//                       </div>
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
//                         <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Submitted</span>
//                         <p className="text-white text-3xl font-black mt-2 font-display text-accent-400">{stats.stats.submittedApps}</p>
//                       </div>
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
//                         <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Finalists</span>
//                         <p className="text-white text-3xl font-black mt-2 font-display text-gold-400">{stats.stats.finalistApps}</p>
//                       </div>
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
//                         <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Judges</span>
//                         <p className="text-white text-3xl font-black mt-2 font-display">{stats.stats.totalJudges}</p>
//                       </div>
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
//                         <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Evaluations</span>
//                         <p className="text-white text-3xl font-black mt-2 font-display text-amber-400">{stats.stats.pendingEvaluations}</p>
//                       </div>
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
//                         <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed Evaluations</span>
//                         <p className="text-white text-3xl font-black mt-2 font-display text-emerald-400">{stats.stats.completedEvaluations}</p>
//                       </div>
//                     </div>

//                     <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
//                       <div className="flex items-center justify-between mb-4">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider">Judges</h4>
//                         <span className="text-[11px] text-slate-400">{judgesList.length} available</span>
//                       </div>
//                       {judgesList.length > 0 ? (
//                         <div className="grid gap-3 md:grid-cols-2">
//                           {judgesList.map((judge) => (
//                             <div key={judge._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
//                               <div className="flex items-center justify-between gap-3">
//                                 <div>
//                                   <div className="text-sm font-semibold text-white">{judge.firstName} {judge.lastName}</div>
//                                   <div className="text-[11px] text-slate-400">{judge.email}</div>
//                                 </div>
//                                 <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                   Judge
//                                 </span>
//                               </div>
//                               {(judge.organization || judge.designation) && (
//                                 <div className="mt-2 text-[11px] text-slate-500">
//                                   {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       ) : (
//                         <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-400">
//                           No judges have been added yet.
//                         </div>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       {/* Trend chart */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiPulseLine className="text-accent-400" /> Submission Trend</h4>
//                         <ResponsiveContainer width="100%" height="85%">
//                           <LineChart data={stats.submissionTrend}>
//                             <XAxis dataKey="date" stroke="#475569" fontSize={10} />
//                             <YAxis stroke="#475569" fontSize={10} />
//                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
//                             <Line type="monotone" dataKey="count" stroke="#0072ff" strokeWidth={3} dot={{ fill: '#00ff87' }} />
//                           </LineChart>
//                         </ResponsiveContainer>
//                       </div>

//                       {/* Category Breakdown chart */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiAwardLine className="text-gold-400" /> Category Breakdown</h4>
//                         <ResponsiveContainer width="100%" height="85%">
//                           <BarChart data={stats.categoryBreakdown}>
//                             <XAxis dataKey="name" stroke="#475569" fontSize={8} tickFormatter={(val) => val.split(' ').slice(2).join(' ')} />
//                             <YAxis stroke="#475569" fontSize={10} />
//                             <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
//                             <Bar dataKey="count" fill="#00ff87" radius={[4, 4, 0, 0]}>
//                               {stats.categoryBreakdown.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Bar>
//                           </BarChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiMailSendLine className="text-accent-400" /> Notifications</h4>
//                         <div className="space-y-3">
//                           {(stats.notifications || []).slice(0, 5).map((notification) => (
//                             <div key={notification._id} className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <div className="text-white text-xs font-semibold">{notification.title}</div>
//                                   <div className="text-[11px] text-slate-400 mt-1">{notification.message}</div>
//                                 </div>
//                                 <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{new Date(notification.createdAt).toLocaleTimeString()}</span>
//                               </div>
//                             </div>
//                           ))}
//                           {(!stats.notifications || stats.notifications.length === 0) && (
//                             <div className="text-sm text-slate-500">No notifications yet.</div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 2. ADMINS TAB */}
//                 {activeTab === 'admins' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Registered Admins</h3>
//                         <p className="text-slate-400 text-xs mt-1">View all administrators currently registered in the system.</p>
//                       </div>
//                       <div className="text-sm text-slate-400">{admins.length} admin{admins.length === 1 ? '' : 's'}</div>
//                     </div>

//                     {admins.length > 0 ? (
//                       <div className="grid gap-4 md:grid-cols-2">
//                         {admins.map((admin) => (
//                           <div key={admin._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="text-white font-semibold">{admin.firstName} {admin.lastName}</div>
//                                 <div className="text-[11px] text-slate-400 mt-1">{admin.email}</div>
//                               </div>
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                 Admin
//                               </span>
//                             </div>
//                             {(admin.organization || admin.designation) && (
//                               <div className="mt-3 text-sm text-slate-400">
//                                 {admin.organization}{admin.organization && admin.designation ? ' • ' : ''}{admin.designation}
//                               </div>
//                             )}
//                             <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {admin.phone || 'Not provided'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {admin.role}</span>
//                               <span className={`rounded-full px-2.5 py-1 ${admin.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
//                                 {admin.isActive ? 'Active' : 'Suspended'}
//                               </span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
//                         No admins have been registered yet.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* 2. CANDIDATES TAB */}
//                 {activeTab === 'candidates' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Registered Candidates</h3>
//                         <p className="text-slate-400 text-xs mt-1">View all candidates currently registered in the system.</p>
//                       </div>
//                       <div className="text-sm text-slate-400">{users.filter((userItem) => userItem.role === 'candidate').length} candidate{users.filter((userItem) => userItem.role === 'candidate').length === 1 ? '' : 's'}</div>
//                     </div>

//                     {users.filter((userItem) => userItem.role === 'candidate').length > 0 ? (
//                       <div className="grid gap-4 md:grid-cols-2">
//                         {users.filter((userItem) => userItem.role === 'candidate').map((candidate) => (
//                           <div key={candidate._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="text-white font-semibold">{candidate.firstName} {candidate.lastName}</div>
//                                 <div className="text-[11px] text-slate-400 mt-1">{candidate.email}</div>
//                               </div>
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                 Candidate
//                               </span>
//                             </div>
//                             {(candidate.organization || candidate.designation) && (
//                               <div className="mt-3 text-sm text-slate-400">
//                                 {candidate.organization}{candidate.organization && candidate.designation ? ' • ' : ''}{candidate.designation}
//                               </div>
//                             )}
//                             <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-accent-300">{candidate.registrationNumber || 'Registration pending'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {candidate.phone || 'Not provided'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {candidate.role}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
//                         No candidates have been registered yet.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* 3. JUDGES TAB */}
//                 {activeTab === 'judges' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Registered Judges</h3>
//                         <p className="text-slate-400 text-xs mt-1">View all judges currently registered in the system.</p>
//                       </div>
//                       <div className="text-sm text-slate-400">{judgesList.length} judge{judgesList.length === 1 ? '' : 's'}</div>
//                     </div>

//                     {judgesList.length > 0 ? (
//                       <div className="grid gap-4 md:grid-cols-2">
//                         {judgesList.map((judge) => (
//                           <div key={judge._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
//                             <div className="flex items-start justify-between gap-3">
//                               <div>
//                                 <div className="text-white font-semibold">{judge.firstName} {judge.lastName}</div>
//                                 <div className="text-[11px] text-slate-400 mt-1">{judge.email}</div>
//                               </div>
//                               <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
//                                 Judge
//                               </span>
//                             </div>
//                             {(judge.organization || judge.designation) && (
//                               <div className="mt-3 text-sm text-slate-400">
//                                 {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
//                               </div>
//                             )}
//                             <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {judge.phone || 'Not provided'}</span>
//                               <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {judge.role}</span>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
//                         No judges have been registered yet.
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* 3. APPLICATIONS TAB */}
//                 {activeTab === 'applications' && (
//                   <div>
//                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Manage Nominations</h3>
//                         <p className="text-slate-400 text-xs mt-1">Audit statuses and assign judges panels.</p>
//                       </div>

//                       <div className="flex gap-3 w-full sm:w-auto">
//                         <input
//                           className="input-field max-w-[200px]"
//                           placeholder="Search title/ref..."
//                           value={appSearch}
//                           onChange={(e) => setAppSearch(e.target.value)}
//                         />
//                         <select
//                           className="input-field max-w-[150px]"
//                           value={appStatusFilter}
//                           onChange={(e) => setAppStatusFilter(e.target.value)}
//                         >
//                           <option value="">All Statuses</option>
//                           <option value="submitted">Submitted</option>
//                           <option value="under_review">Under Review</option>
//                           <option value="eligible">Eligible</option>
//                           <option value="shortlisted">Shortlisted</option>
//                           <option value="finalist">Finalist</option>
//                           <option value="winner">Winner</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="w-full text-xs text-left text-slate-300">
//                         <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
//                           <tr>
//                             <th className="p-4">Ref/Title</th>
//                             <th className="p-4">Category</th>
//                             <th className="p-4">Candidate</th>
//                             <th className="p-4">Status</th>
//                             <th className="p-4">Judges Panel</th>
//                             <th className="p-4 text-center">Score</th>
//                             <th className="p-4">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {applications.map(app => (
//                             <tr key={app._id} className="border-b border-white/5 hover:bg-white/5">
//                               <td className="p-4">
//                                 <div className="font-bold text-white truncate max-w-[150px]">{app.projectTitle}</div>
//                                 <div className="text-[10px] font-mono text-slate-500">{app.referenceNumber || 'Draft'}</div>
//                               </td>
//                               <td className="p-4 truncate max-w-[120px]">{app.category?.name}</td>
//                               <td className="p-4">
//                                 <div>{app.candidate?.firstName} {app.candidate?.lastName}</div>
//                                 <div className="text-[10px] text-slate-500">{app.candidate?.organization}</div>
//                               </td>
//                               <td className="p-4">
//                                 {(() => {
//                                   const nextStatuses = STATUS_TRANSITIONS[app.status] || [];
//                                   return (
//                                 <select
//                                   className="bg-navy-900 border border-white/10 rounded px-2 py-1 text-[10px]"
//                                   value={app.status}
//                                   onChange={(e) => handleStatusChange(app._id, e.target.value)}
//                                   disabled={nextStatuses.length === 0}
//                                 >
//                                   <option value={app.status}>{app.statusLabel || STATUS_LABELS[app.status] || app.status}</option>
//                                   {nextStatuses.map(status => (
//                                     <option key={status} value={status}>
//                                       {STATUS_LABELS[status] || status}
//                                     </option>
//                                   ))}
//                                 </select>
//                                   );
//                                 })()}
//                               </td>
//                               <td className="p-4">
//                                 <div className="space-y-1">
//                                   {app.assignedJudges?.map(j => (
//                                     <div key={j._id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded w-fit">{j.firstName}</div>
//                                   ))}
//                                   <button
//                                     onClick={() => openAssignModal(app)}
//                                     className="text-accent-400 hover:text-accent-300 font-bold block"
//                                   >
//                                     + Assign Panel
//                                   </button>
//                                 </div>
//                               </td>
//                               <td className="p-4 text-center font-bold text-white">{app.averageScore?.toFixed(1) || '-'}</td>
//                               <td className="p-4">
//                                 <div className="flex items-center gap-3">
//                                   <Link to={`/dashboard/applications/${app._id}`} className="text-accent-400 hover:underline">View</Link>
//                                   <button
//                                     type="button"
//                                     onClick={() => handleDeleteApplication(app)}
//                                     className="inline-flex items-center gap-1 text-red-400 hover:text-red-300"
//                                   >
//                                     <RiDeleteBinLine size={14} /> Delete
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* 3. APPLICATION MONITORING TAB */}
//                 {activeTab === 'monitoring' && (
//                   <div className="space-y-8">
//                     <div>
//                       <h3 className="font-display font-bold text-white text-xl">Application Monitoring</h3>
//                       <p className="text-slate-400 text-xs mt-1">Review submissions, screen eligibility, manage judge assignment, and track evaluation progress.</p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                       {monitoring && [
//                         { label: 'Total Applications', value: monitoring.total },
//                         { label: 'Pending Review', value: monitoring.pending },
//                         { label: 'Screened', value: monitoring.screened },
//                         { label: 'Assigned to Judges', value: monitoring.assigned },
//                         { label: 'Completed Evaluations', value: monitoring.completedEvaluation },
//                         { label: 'Pending Evaluations', value: monitoring.pendingEvaluation },
//                       ].map((item) => (
//                         <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
//                           <div className="text-slate-400 text-[10px] uppercase tracking-wider">{item.label}</div>
//                           <div className="text-white text-2xl font-black mt-2 font-display">{item.value}</div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="font-display font-bold text-white text-base mb-4">Eligibility Screening</h4>
//                         <div className="space-y-3 max-h-[320px] overflow-y-auto">
//                           {applications.filter((app) => app.status === 'submitted' || app.status === 'under_review').map((app) => (
//                             <div key={app._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <div className="text-white text-sm font-semibold">{app.projectTitle}</div>
//                                   <div className="text-[11px] text-slate-400">{app.candidate?.firstName} {app.candidate?.lastName}</div>
//                                 </div>
//                                 <button onClick={() => setEligibilityReview({ appId: app._id, isEligible: app.isEligible ?? true, note: app.adminNotes || '' })} className="text-accent-400 text-xs">Review</button>
//                               </div>
//                               {eligibilityReview.appId === app._id && (
//                                 <form onSubmit={handleEligibilityReview} className="mt-3 space-y-2">
//                                   <textarea className="input-field h-20" placeholder="Review note" value={eligibilityReview.note} onChange={(e) => setEligibilityReview({ ...eligibilityReview, note: e.target.value })} />
//                                   <div className="flex items-center gap-3">
//                                     <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: true })} /> Eligible</label>
//                                     <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={!eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: false })} /> Ineligible</label>
//                                   </div>
//                                   <button type="submit" className="btn-primary text-xs">Save Review</button>
//                                 </form>
//                               )}
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="font-display font-bold text-white text-base mb-4">Judge Evaluation Progress</h4>
//                         <div className="space-y-3 max-h-[320px] overflow-y-auto">
//                           {judgeProgress.map((entry) => (
//                             <div key={entry.judgeId} className="p-3 rounded-xl bg-white/5 border border-white/10">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <div className="text-white text-sm font-semibold">{entry.judgeName}</div>
//                                   <div className="text-[11px] text-slate-400">{entry.email}</div>
//                                 </div>
//                                 <div className="text-right text-[11px] text-slate-400">
//                                   <div>Submitted: {entry.submitted}</div>
//                                   <div>Pending: {entry.pending}</div>
//                                 </div>
//                               </div>
//                               <div className="mt-2 text-[11px] text-accent-400">Average score: {entry.avgScore ?? '—'}</div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 4. USER DIRECTORY TAB */}
//                 {activeTab === 'users' && (
//                   <div className="space-y-8">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">User Directory</h3>
//                         <p className="text-slate-400 text-xs mt-1">Manage system accounts and access credentials.</p>
//                       </div>
//                       <select
//                         className="input-field max-w-[150px]"
//                         value={userRoleFilter}
//                         onChange={(e) => setUserRoleFilter(e.target.value)}
//                       >
//                         <option value="">All Roles</option>
//                         <option value="candidate">Candidate</option>
//                         <option value="judge">Judge</option>
//                         <option value="admin">Admin</option>
//                       </select>
//                     </div>

//                     <div className="overflow-x-auto">
//                       <table className="w-full text-xs text-left text-slate-300">
//                         <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
//                           <tr>
//                             <th className="p-4">Name</th>
//                             <th className="p-4">Registration No.</th>
//                             <th className="p-4">Email</th>
//                             <th className="p-4">Role</th>
//                             <th className="p-4">Status</th>
//                             <th className="p-4">Registered Date</th>
//                             <th className="p-4 text-right">Actions</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {users.map(u => (
//                             <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
//                               <td className="p-4 font-bold text-white">{u.firstName} {u.lastName}</td>
//                               <td className="p-4 font-mono text-accent-300">{u.role === 'candidate' ? (u.registrationNumber || 'Pending') : '—'}</td>
//                               <td className="p-4 font-mono">{u.email}</td>
//                               <td className="p-4 uppercase text-[10px] tracking-wider font-semibold font-mono text-accent-400">{u.role}</td>
//                               <td className="p-4">
//                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
//                                   {u.isActive ? 'Active' : 'Suspended'}
//                                 </span>
//                               </td>
//                               <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
//                               <td className="p-4 text-right space-x-2">
//                                 <button onClick={() => handleToggleUser(u._id)} className="text-slate-400 hover:text-white">
//                                   {u.isActive ? 'Deactivate' : 'Activate'}
//                                 </button>
//                                 <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300">Delete</button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 )}

//                 {/* 4. CATEGORIES TAB */}
//                 {activeTab === 'categories' && (
//                   <div className="space-y-8">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Award Categories</h3>
//                         <p className="text-slate-400 text-xs mt-1">Manage award categories available for nominations.</p>
//                       </div>
//                       <button onClick={handleSeedCategories} className="btn-primary text-xs">
//                         Seed Default Categories
//                       </button>
//                     </div>

//                     <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
//                         <h4 className="font-display font-bold text-white text-base">Existing Categories</h4>
//                         <div className="space-y-3 max-h-[420px] overflow-y-auto">
//                           {categories.map(c => (
//                             <div key={c._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div>
//                                   <h5 className="font-semibold text-white text-sm">{c.name}</h5>
//                                   <p className="text-slate-400 text-[11px] mt-1">{c.description}</p>
//                                 </div>
//                                 <div className="flex gap-2">
//                                   <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400 text-xs">Delete</button>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                   </div>
//                 )}

//                 {/* EVALUATION CRITERIA TAB */}
//                 {activeTab === 'criteria' && (
//                   <div className="space-y-8">
//                     <div className="flex justify-between items-center">
//                       <div>
//                         <h3 className="font-display font-bold text-white text-xl">Evaluation Criteria</h3>
//                         <p className="text-slate-400 text-xs mt-1">Manage criteria sets and weight distributions for evaluation scorecards.</p>
//                       </div>
//                       <button onClick={handleSeedCriteria} className="btn-primary text-xs">
//                         Seed Default Criteria
//                       </button>
//                     </div>

//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
//                         <h4 className="font-display font-bold text-white text-base">
//                           {editingCriteriaId ? 'Edit Evaluation Criterion' : 'Create Evaluation Criterion'}
//                         </h4>
//                         <form onSubmit={handleSubmitCriteria} className="space-y-3">
//                           <div>
//                             <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Name</label>
//                             <input
//                               className="input-field"
//                               placeholder="Criterion name"
//                               value={criteriaForm.name}
//                               onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })}
//                               required
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Description</label>
//                             <textarea
//                               className="input-field h-24 resize-none"
//                               placeholder="Description / judging focus"
//                               value={criteriaForm.description}
//                               onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
//                               required
//                             />
//                           </div>
//                           <div className="grid grid-cols-2 gap-3">
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Weight (%)</label>
//                               <input
//                                 type="number"
//                                 className="input-field"
//                                 placeholder="Weight"
//                                 value={criteriaForm.weight}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value, maxScore: e.target.value })}
//                                 required
//                               />
//                             </div>
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Max Score</label>
//                               <input
//                                 type="number"
//                                 className="input-field"
//                                 placeholder="Max Score (equal to weight)"
//                                 value={criteriaForm.maxScore}
//                                 disabled
//                               />
//                             </div>
//                           </div>
//                           <div className="grid grid-cols-2 gap-3">
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Category Type</label>
//                               <select
//                                 className="input-field"
//                                 value={criteriaForm.criteriaType}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, criteriaType: e.target.value })}
//                               >
//                                 <option value="organizational" className="bg-navy-950">🏢 Organizational Award</option>
//                                 <option value="individual" className="bg-navy-950">👤 Individual Award</option>
//                               </select>
//                             </div>
//                             <div>
//                               <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Sort Order</label>
//                               <input
//                                 type="number"
//                                 className="input-field"
//                                 placeholder="Sort Order"
//                                 value={criteriaForm.order}
//                                 onChange={(e) => setCriteriaForm({ ...criteriaForm, order: e.target.value })}
//                               />
//                             </div>
//                           </div>
//                           <label className="flex items-center gap-2 text-sm text-slate-300 select-none">
//                             <input
//                               type="checkbox"
//                               checked={criteriaForm.isActive}
//                               onChange={(e) => setCriteriaForm({ ...criteriaForm, isActive: e.target.checked })}
//                             />
//                             Active & enabled for evaluation
//                           </label>
//                           <div className="flex gap-3 pt-2">
//                             <button type="submit" className="btn-primary text-xs">
//                               {editingCriteriaId ? 'Save Changes' : 'Create Criterion'}
//                             </button>
//                             {editingCriteriaId && (
//                               <button
//                                 type="button"
//                                 onClick={() => {
//                                   setEditingCriteriaId(null);
//                                   setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', order: 0, isActive: true });
//                                 }}
//                                 className="btn-ghost text-xs"
//                               >
//                                 Cancel
//                               </button>
//                             )}
//                           </div>
//                         </form>
//                       </div>

//                       <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
//                         <h4 className="font-display font-bold text-white text-base">Criteria Definitions</h4>
//                         <div className="space-y-3 max-h-[500px] overflow-y-auto">
//                           {criteria.map((c) => (
//                             <div key={c._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
//                               <div className="flex justify-between items-start gap-3">
//                                 <div className="min-w-0">
//                                   <div className="flex items-center gap-1.5 flex-wrap">
//                                     <h5 className="font-semibold text-white text-sm truncate">{c.name}</h5>
//                                     <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
//                                       c.criteriaType === 'individual'
//                                         ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
//                                         : 'bg-accent-500/10 text-accent-300 border-accent-500/20'
//                                     }`}>
//                                       {c.criteriaType === 'individual' ? '👤 Individual' : '🏢 Org'}
//                                     </span>
//                                   </div>
//                                   <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.description}</p>
//                                 </div>
//                                 <div className="flex gap-2 shrink-0">
//                                   <button onClick={() => handleEditCriteria(c)} className="text-accent-400 text-xs hover:text-accent-300 font-medium">Edit</button>
//                                   <button onClick={() => handleDeleteCriteria(c._id)} className="text-red-400 text-xs hover:text-red-300 font-medium">Delete</button>
//                                 </div>
//                               </div>
//                               <div className="flex gap-4 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
//                                 <span>Max score: <strong className="text-white">{c.maxScore}</strong></span>
//                                 <span>Weight: <strong className="text-white">{c.weight}%</strong></span>
//                                 <span>Order: <strong className="text-white">{c.order}</strong></span>
//                                 <span className={c.isActive ? 'text-emerald-400' : 'text-red-400'}>{c.isActive ? 'Active' : 'Inactive'}</span>
//                               </div>
//                             </div>
//                           ))}
//                           {criteria.length === 0 && (
//                             <p className="text-slate-500 text-xs text-center py-8">No criteria definitions found.</p>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 5. BROADCAST TAB */}
//                 {activeTab === 'broadcast' && (
//                   <div className="space-y-6">
//                     <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Communication Center</p>
//                         <h3 className="mt-1 font-display text-2xl font-black text-white">Send Broadcast Alert</h3>
//                         <p className="mt-1 max-w-2xl text-sm text-slate-400">Dispatch a targeted system notification to candidates, judges, or every registered user.</p>
//                       </div>
//                       <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
//                         <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Estimated Reach</div>
//                         <div className="mt-1 font-display text-2xl font-black text-white">{broadcastAudienceCount}</div>
//                       </div>
//                     </div>

//                     <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
//                       <form onSubmit={handleBroadcast(onBroadcastSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
//                         <div className="grid gap-4 sm:grid-cols-3">
//                           {[
//                             { value: 'all', label: 'All Users', count: users.length, helper: 'Full platform notice' },
//                             { value: 'candidate', label: 'Candidates', count: candidatesList.length, helper: 'Applicants only' },
//                             { value: 'judge', label: 'Judges', count: judgesList.length, helper: 'Evaluation panel' },
//                           ].map((audience) => (
//                             <label
//                               key={audience.value}
//                               className={`cursor-pointer rounded-xl border p-4 transition-all ${
//                                 broadcastRole === audience.value
//                                   ? 'border-accent-500 bg-accent-500/10 shadow-glow'
//                                   : 'border-white/10 bg-navy-950/30 hover:border-white/20 hover:bg-white/5'
//                               }`}
//                             >
//                               <input type="radio" value={audience.value} className="sr-only" {...regBroadcast('role')} />
//                               <div className="flex items-center justify-between gap-3">
//                                 <span className="text-sm font-bold text-white">{audience.label}</span>
//                                 <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-300">{audience.count}</span>
//                               </div>
//                               <p className="mt-2 text-xs text-slate-500">{audience.helper}</p>
//                             </label>
//                           ))}
//                         </div>

//                         <div className="mt-6 space-y-4">
//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Title</label>
//                             <input className="input-field" placeholder="e.g. Submissions Deadline Extended" {...regBroadcast('title', { required: true })} />
//                           </div>

//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Message</label>
//                             <textarea className="input-field min-h-36 resize-none" placeholder="Enter notification message..." {...regBroadcast('message', { required: true })} />
//                             <div className="mt-2 flex justify-between text-[11px] text-slate-500">
//                               <span>Keep the message direct and action-oriented.</span>
//                               <span>{broadcastMessage.length} chars</span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
//                           <p className="text-xs text-slate-500">This sends an in-app notification immediately.</p>
//                           <button type="submit" disabled={broadcastSubmitting} className="btn-primary min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60">
//                             {broadcastSubmitting ? (
//                               <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending...</>
//                             ) : (
//                               <><RiMailSendLine /> Send Broadcast</>
//                             )}
//                           </button>
//                         </div>
//                       </form>

//                       <div className="space-y-5">
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <div className="flex items-center justify-between">
//                             <h4 className="text-sm font-bold text-white">Notification Preview</h4>
//                             <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400">Live</span>
//                           </div>
//                           <div className="mt-4 rounded-2xl border border-white/10 bg-navy-950/60 p-4">
//                             <div className="flex items-start gap-3">
//                               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
//                                 <RiMailSendLine size={18} />
//                               </div>
//                               <div className="min-w-0">
//                                 <p className="truncate text-sm font-bold text-white">{broadcastTitle || 'Alert title preview'}</p>
//                                 <p className="mt-1 text-xs leading-5 text-slate-400">{broadcastMessage || 'Your broadcast message will appear here as users receive the notification.'}</p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <h4 className="text-sm font-bold text-white">Delivery Summary</h4>
//                           <div className="mt-4 space-y-3 text-sm">
//                             <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
//                               <span className="text-slate-400">Audience</span>
//                               <span className="font-semibold text-white">{broadcastRole === 'all' ? 'All users' : broadcastRole === 'candidate' ? 'Candidates' : 'Judges'}</span>
//                             </div>
//                             <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
//                               <span className="text-slate-400">Recipients</span>
//                               <span className="font-semibold text-white">{broadcastAudienceCount}</span>
//                             </div>
//                             <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
//                               <span className="text-slate-400">Channel</span>
//                               <span className="font-semibold text-white">In-app alert</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 6. REPORTS TAB */}
//                 {activeTab === 'reports' && stats && (
//                   <div className="space-y-8">
//                     <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <h3 className="font-display font-bold text-white text-xl">Reports & Exports</h3>
//                           <p className="text-slate-400 text-xs mt-1">Aggregated statistics, export data, and publish finalists/winners.</p>
//                         </div>
//                         <div className="flex gap-2 flex-wrap">
//                           <button onClick={() => handleExportReport('csv')} className="btn-primary text-xs">Export Excel</button>
//                           <button onClick={() => handleExportReport('pdf')} className="btn-gold text-xs">Export PDF</button>
//                           <button onClick={() => window.print()} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10">Print</button>
//                         </div>
//                       </div>
//                       <div className="flex flex-wrap gap-2">
//                         <button onClick={handlePublishFinalists} disabled={reportActionBusy} className="btn-primary text-xs disabled:opacity-50">Publish Finalists</button>
//                         <button onClick={handlePublishWinners} disabled={reportActionBusy} className="btn-gold text-xs disabled:opacity-50">Publish Winners</button>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                       {/* Status Distribution Recharts Pie */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80 flex flex-col items-center">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 self-start">Workflow Status Share</h4>
//                         <ResponsiveContainer width="100%" height="80%">
//                           <PieChart>
//                             <Pie
//                               data={stats.statusBreakdown}
//                               dataKey="count"
//                               nameKey="status"
//                               cx="50%"
//                               cy="50%"
//                               outerRadius={80}
//                               label={({ status, count }) => `${status}: ${count}`}
//                             >
//                               {stats.statusBreakdown.map((entry, index) => (
//                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                               ))}
//                             </Pie>
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>

//                       {/* Top Scored leader board */}
//                       <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
//                         <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Submission Leaderboard</h4>
//                         <div className="space-y-3">
//                           {applications.slice(0, 5).sort((a,b)=>b.averageScore - a.averageScore).map((app, idx) => (
//                             <div key={app._id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
//                               <div className="flex items-center gap-2">
//                                 <input type="checkbox" checked={selectedReportIds.includes(app._id)} onChange={() => toggleReportSelection(app._id)} className="rounded border-white/10 bg-transparent" />
//                                 <span>
//                                   <span className="font-bold text-white mr-1">#{idx+1}</span>
//                                   {app.projectTitle}
//                                 </span>
//                               </div>
//                               <span className="font-bold text-accent-400">{app.averageScore?.toFixed(1) || '-'}</span>
//                             </div>
//                           ))}
//                         </div>
//                         <div className="mt-4 text-[11px] text-slate-400">Selected: {selectedReportIds.length}</div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* 7. CHANGE PASSWORD */}
//                 {activeTab === 'password' && (
//                   <div className="space-y-6">
//                     <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Account Security</p>
//                         <h3 className="mt-1 font-display text-2xl font-black text-white">Change Password</h3>
//                         <p className="mt-1 max-w-2xl text-sm text-slate-400">Update your administrator credentials and keep portal access protected.</p>
//                       </div>
//                       <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
//                         <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Signed In As</div>
//                         <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Administrator'}</div>
//                       </div>
//                     </div>

//                     <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
//                       <form onSubmit={handlePassword(onChangePasswordSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
//                         {(changeError || changeSuccess) && (
//                           <div className={`mb-5 rounded-xl border p-4 text-sm ${
//                             changeError
//                               ? 'border-red-500/30 bg-red-500/10 text-red-400'
//                               : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
//                           }`}>
//                             {changeError || changeSuccess}
//                           </div>
//                         )}

//                         <div className="space-y-4">
//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
//                             <input
//                               id="admin-oldpassword"
//                               type="password"
//                               className="input-field"
//                               placeholder="Enter current password"
//                               {...regPassword('oldPassword', { required: 'Current password is required' })}
//                             />
//                             {passErrors.oldPassword && <p className="mt-1 text-xs text-red-400">{passErrors.oldPassword.message}</p>}
//                           </div>

//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
//                             <input
//                               id="admin-newpassword"
//                               type="password"
//                               className="input-field"
//                               placeholder="At least 8 characters"
//                               {...regPassword('newPassword', {
//                                 required: 'New password is required',
//                                 minLength: { value: 8, message: 'Password must be at least 8 characters' },
//                               })}
//                             />
//                             {passErrors.newPassword && <p className="mt-1 text-xs text-red-400">{passErrors.newPassword.message}</p>}
//                           </div>

//                           <div>
//                             <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
//                             <input
//                               id="admin-confirm"
//                               type="password"
//                               className="input-field"
//                               placeholder="Re-enter new password"
//                               {...regPassword('confirmPassword', {
//                                 validate: (v) => v === newPassword || 'Passwords do not match',
//                               })}
//                             />
//                             {passErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{passErrors.confirmPassword.message}</p>}
//                           </div>
//                         </div>

//                         <div className="mt-6 border-t border-white/10 pt-5">
//                           <button
//                             id="admin-change-submit"
//                             type="submit"
//                             disabled={passSubmitting}
//                             className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
//                           >
//                             {passSubmitting ? (
//                               <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Updating...</>
//                             ) : (
//                               <>Update Password <RiCheckDoubleLine /></>
//                             )}
//                           </button>
//                         </div>
//                       </form>

//                       <div className="space-y-5">
//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <div className="flex items-center gap-3">
//                             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
//                               <RiLockPasswordLine size={20} />
//                             </div>
//                             <div>
//                               <h4 className="text-sm font-bold text-white">Password Strength</h4>
//                               <p className="text-xs text-slate-500">{passwordStrength} of {passwordRules.length} checks passed</p>
//                             </div>
//                           </div>

//                           <div className="mt-4 grid grid-cols-4 gap-2">
//                             {passwordRules.map((rule, index) => (
//                               <div key={rule.label} className={`h-2 rounded-full ${index < passwordStrength ? 'bg-emerald-400' : 'bg-white/10'}`} />
//                             ))}
//                           </div>

//                           <div className="mt-4 space-y-3">
//                             {passwordRules.map((rule) => (
//                               <div key={rule.label} className="flex items-center gap-2 text-sm">
//                                 <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
//                                   rule.passed
//                                     ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
//                                     : 'border-white/10 bg-white/5 text-slate-500'
//                                 }`}>
//                                   {rule.passed ? '✓' : ''}
//                                 </span>
//                                 <span className={rule.passed ? 'text-slate-200' : 'text-slate-500'}>{rule.label}</span>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
//                           <h4 className="text-sm font-bold text-white">Security Notes</h4>
//                           <div className="mt-4 space-y-3 text-sm text-slate-400">
//                             <div className="rounded-xl bg-navy-950/40 px-3 py-3">Use a password that is unique to this admin portal.</div>
//                             <div className="rounded-xl bg-navy-950/40 px-3 py-3">Avoid sharing credentials with other administrators.</div>
//                             <div className="rounded-xl bg-navy-950/40 px-3 py-3">After updating, use the new password on your next sign-in.</div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </motion.div>
//         </div>
//       </div>

//       {/* JUDGES PANEL ASSIGNMENT MODAL */}
//       {assignModalOpen && selectedApp && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
//           <div className="glass-card max-w-md w-full p-6 relative !hover:transform-none">
//             <h3 className="font-display font-bold text-white text-lg mb-2">Assign Evaluators</h3>
//             <p className="text-slate-400 text-xs mb-4">Select judges to assign to <strong>{selectedApp.projectTitle}</strong>.</p>

//             <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
//               {judgesList.map(judge => {
//                 const isSelected = selectedJudges.includes(judge._id);
//                 return (
//                   <div
//                     key={judge._id}
//                     onClick={() => toggleJudgeSelection(judge._id)}
//                     className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
//                       isSelected ? 'bg-accent-500/10 border-accent-500' : 'bg-white/5 border-white/5 hover:bg-white/10'
//                     }`}
//                   >
//                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${
//                       isSelected ? 'border-accent-500 bg-accent-500 text-white' : 'border-slate-500'
//                     }`}>
//                       {isSelected && <RiCheckLine size={12} />}
//                     </div>
//                     <div>
//                       <div className="text-white text-xs font-semibold">{judge.firstName} {judge.lastName}</div>
//                       <div className="text-slate-400 text-[10px]">{judge.organization}</div>
//                     </div>
//                   </div>
//                 );
//               })}
//               {judgesList.length === 0 && (
//                 <p className="text-slate-500 text-xs text-center py-4">No judges registered in directory.</p>
//               )}
//             </div>

//             <div className="flex justify-end gap-3">
//               <button onClick={() => setAssignModalOpen(false)} className="btn-ghost text-xs !py-2 !px-4">Cancel</button>
//               <button onClick={handleAssignSubmit} className="btn-primary text-xs !py-2 !px-4">Save Panel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Check indicator icon proxy
// const RiCheckLine = ({ size }) => (
//   <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
//     <path fill="none" d="M0 0h24v24H0z"></path>
//     <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
//   </svg>
// );

// export default AdminDashboard;






import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
  RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiCheckDoubleLine, RiFileList3Line, RiTeamLine,
  RiDashboardLine, RiFileChartLine, RiMailSendLine,
  RiArrowRightLine, RiFolderShield2Line, RiRefreshLine, RiPulseLine, RiStarLine,
  RiUserLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api, { buildAssetUrl } from '../../services/api';
import adminService from '../../services/admin.service';
import applicationService from '../../services/application.service';
import categoryService from '../../services/category.service';
import evaluationCriteriaService from '../../services/evaluationCriteria.service';

const COLORS = ['#0072ff', '#00ff87', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c'];

const BROADCAST_STATUS_AUDIENCES = [
  { value: 'status:submitted', status: 'submitted', label: 'Submitted' },
  { value: 'status:under_review', status: 'under_review', label: 'Under Review' },
  { value: 'status:eligible', status: 'eligible', label: 'Eligible' },
  { value: 'status:shortlisted', status: 'shortlisted', label: 'Shortlisted' },
  { value: 'status:finalist', status: 'finalist', label: 'Finalist' },
  { value: 'status:winner', status: 'winner', label: 'Winner' },
];

const getIntegerTicks = (values = []) => {
  const maxValue = Math.max(1, ...values.map((value) => Math.ceil(Number(value) || 0)));
  if (maxValue <= 5) return Array.from({ length: maxValue + 1 }, (_, index) => index);

  const step = Math.ceil(maxValue / 5);
  const ticks = Array.from({ length: Math.floor(maxValue / step) + 1 }, (_, index) => index * step);
  return ticks.includes(maxValue) ? ticks : [...ticks, maxValue];
};

const AdminDashboard = () => {
  const { user, logout, updateUserLocal } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [evaluationsModalOpen, setEvaluationsModalOpen] = useState(false);
  const [evaluationsList, setEvaluationsList] = useState([]);
  const [evaluationsApp, setEvaluationsApp] = useState(null);
  const [evalsLoading, setEvalsLoading] = useState(false);

  // Stats & listings
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monitoring, setMonitoring] = useState(null);
  const [judgeProgress, setJudgeProgress] = useState([]);
  const [criteria, setCriteria] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organization: '',
    designation: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [editingCriteriaId, setEditingCriteriaId] = useState(null);
  const [criteriaForm, setCriteriaForm] = useState({
    name: '',
    description: '',
    weight: 10,
    maxScore: 10,
    criteriaType: 'organizational',
    order: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Assign Judge Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [reportActionBusy, setReportActionBusy] = useState(false);

  // Change Password form
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError,   setChangeError]   = useState('');
  const [eligibilityReview, setEligibilityReview] = useState({ appId: null, isEligible: true, note: '' });
  const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors, isSubmitting: passSubmitting }, watch, reset: resetPassword } = useForm();
  const newPassword = watch('newPassword');
  const passwordRules = [
    { label: 'At least 8 characters', passed: (newPassword || '').length >= 8 },
    { label: 'Includes an uppercase letter', passed: /[A-Z]/.test(newPassword || '') },
    { label: 'Includes a number', passed: /\d/.test(newPassword || '') },
    { label: 'Includes a symbol', passed: /[^A-Za-z0-9]/.test(newPassword || '') },
  ];
  const passwordStrength = passwordRules.filter((rule) => rule.passed).length;

  // Broadcast form
  const { register: regBroadcast, handleSubmit: handleBroadcast, reset: resetBroadcast, watch: watchBroadcast, setValue: setBroadcastValue, formState: { isSubmitting: broadcastSubmitting } } = useForm({
    defaultValues: { role: 'all', title: '', message: '' },
  });

  const fetchStats = async () => {
    try {
      const { data } = await adminService.getDashboardStats();
      setStats(data.data);
    } catch { toast.error('Failed to load dashboard statistics.'); }
  };

  const fetchApps = async () => {
    try {
      const params = {
        search: appSearch || undefined,
        status: appStatusFilter || undefined,
        limit: 100,
      };
      const { data } = await applicationService.getAllApplications(params);
      setApplications(data.data.applications);
    } catch { toast.error('Failed to load applications.'); }
  };

  const fetchUsers = async () => {
    try {
      const params = { role: userRoleFilter || undefined, limit: 100 };
      const { data } = await adminService.getUsers(params);
      setUsers(data.data.users);
    } catch { toast.error('Failed to load users.'); }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await adminService.getUsers({ role: 'admin', limit: 100 });
      setAdmins(data.data.users);
    } catch { toast.error('Failed to load admins.'); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch { toast.error('Failed to load categories.'); }
  };

  const fetchMonitoring = async () => {
    try {
      const [{ data: monitoringData }, { data: judgeProgressData }] = await Promise.all([
        applicationService.getMonitoringOverview(),
        applicationService.getJudgeProgress(),
      ]);
      setMonitoring(monitoringData.data.overview);
      setJudgeProgress(judgeProgressData.data.progress || []);
    } catch {
      toast.error('Failed to load monitoring metrics.');
    }
  };

  const fetchCriteria = async () => {
    try {
      const { data } = await evaluationCriteriaService.getAllCriteria();
      setCriteria(data.data.criteria);
    } catch { toast.error('Failed to load evaluation criteria.'); }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchApps(),
      fetchUsers(),
      fetchAdmins(),
      fetchCategories(),
      fetchMonitoring(),
      fetchCriteria(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [appSearch, appStatusFilter, userRoleFilter]);

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

  const handleLogout = () => {
    logout();
    navigate('/');
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
      toast.success('Profile picture updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setImageUploading(false);
      e.target.value = '';
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

  const judgesList = users.filter((userItem) => userItem.role === 'judge');
  const candidatesList = users.filter((userItem) => userItem.role === 'candidate');
  const broadcastRole = watchBroadcast('role') || 'all';
  const broadcastTitle = watchBroadcast('title') || '';
  const broadcastMessage = watchBroadcast('message') || '';
  const getStatusAudienceCount = (status) => {
    const candidateIds = new Set(
      applications
        .filter((app) => app.status === status)
        .map((app) => app.candidate?._id || app.candidate)
        .filter(Boolean)
    );
    return candidateIds.size;
  };
  const broadcastStatusAudience = BROADCAST_STATUS_AUDIENCES.find((audience) => audience.value === broadcastRole);
  const broadcastAudienceLabel = broadcastStatusAudience?.label
    || (broadcastRole === 'all' ? 'All users' : broadcastRole === 'candidate' ? 'Candidates' : 'Judges');
  const broadcastAudienceCount = broadcastStatusAudience
    ? getStatusAudienceCount(broadcastStatusAudience.status)
    : broadcastRole === 'judge'
      ? judgesList.length
      : broadcastRole === 'candidate'
        ? candidatesList.length
        : users.length;

  // Change Password submit
  const onChangePasswordSubmit = async (data) => {
    try {
      setChangeError('');
      setChangeSuccess('');
      await api.post('/auth/change-password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      setChangeSuccess('Password updated successfully!');
      toast.success('Password changed successfully.');
      resetPassword();
    } catch (err) {
      setChangeError(err.response?.data?.message || 'Failed to update password.');
      toast.error('Password change failed.');
    }
  };

  // Status transitions
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await applicationService.changeStatus(appId, { status: newStatus });
      toast.success('Application status updated.');
      fetchApps();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // User Activation Toggle
  const handleToggleUser = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      toast.success('User status updated.');
      fetchUsers();
      fetchAdmins();
    } catch {
      toast.error('Failed to toggle user status.');
    }
  };

  // User Delete
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await adminService.deleteUser(userId);
      toast.success('User deleted.');
      fetchUsers();
      fetchAdmins();
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryService.deleteCategory(id);
      toast.success('Category deleted.');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category.');
    }
  };

  // Seed default categories
  const handleSeedCategories = async () => {
    try {
      const { data } = await categoryService.seedDefaults();
      toast.success(data.message);
      fetchCategories();
    } catch {
      toast.error('Failed to seed default categories.');
    }
  };

  // ── Criteria Management Handlers ──
  const handleSubmitCriteria = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...criteriaForm,
        weight: Number(criteriaForm.weight || 0),
        maxScore: Number(criteriaForm.maxScore || 0),
        order: Number(criteriaForm.order || 0),
      };
      if (editingCriteriaId) {
        await evaluationCriteriaService.updateCriteria(editingCriteriaId, payload);
        toast.success('Evaluation criteria updated.');
      } else {
        await evaluationCriteriaService.createCriteria(payload);
        toast.success('Evaluation criteria created.');
      }
      setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', order: 0, isActive: true });
      setEditingCriteriaId(null);
      fetchCriteria();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save evaluation criteria.');
    }
  };

  const handleEditCriteria = (c) => {
    setEditingCriteriaId(c._id);
    setCriteriaForm({
      name: c.name || '',
      description: c.description || '',
      weight: c.weight || 10,
      maxScore: c.maxScore || 10,
      criteriaType: c.criteriaType || 'organizational',
      order: c.order || 0,
      isActive: c.isActive !== false,
    });
  };

  const handleDeleteCriteria = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evaluation criterion?')) return;
    try {
      await evaluationCriteriaService.deleteCriteria(id);
      toast.success('Evaluation criteria deleted.');
      fetchCriteria();
    } catch {
      toast.error('Failed to delete criteria.');
    }
  };

  const handleSeedCriteria = async () => {
    try {
      const { data } = await evaluationCriteriaService.seedDefaults();
      toast.success(data.message);
      fetchCriteria();
    } catch {
      toast.error('Failed to seed default evaluation criteria.');
    }
  };

  // Broadcast submit
  const onBroadcastSubmit = async (data) => {
    try {
      const statusAudience = BROADCAST_STATUS_AUDIENCES.find((audience) => audience.value === data.role);
      const payload = statusAudience
        ? { ...data, role: 'candidate', status: statusAudience.status }
        : data;

      await adminService.broadcastNotification(payload);
      toast.success('Broadcast notification sent successfully.');
      resetBroadcast();
    } catch {
      toast.error('Failed to send broadcast.');
    }
  };

  // Open Judge Evaluations Modal
  const openEvaluationsModal = async (app) => {
    setEvaluationsApp(app);
    setEvaluationsList([]);
    setEvaluationsModalOpen(true);
    setEvalsLoading(true);
    try {
      const { data } = await evaluationService.getEvaluationsByApplication(app._id);
      setEvaluationsList(data.data.evaluations || []);
    } catch {
      toast.error('Failed to load judge evaluations.');
    } finally {
      setEvalsLoading(false);
    }
  };

  // Open Judge Assignment
  const openAssignModal = (app) => {
    setSelectedApp(app);
    setSelectedJudges(app.assignedJudges?.map(j => j._id || j) || []);
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async () => {
    try {
      await applicationService.assignJudges(selectedApp._id, selectedJudges);
      toast.success('Judges assigned successfully.');
      setAssignModalOpen(false);
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to assign judges.');
    }
  };

  const handleEligibilityReview = async (e) => {
    e.preventDefault();
    try {
      await applicationService.reviewEligibility(eligibilityReview.appId, {
        isEligible: eligibilityReview.isEligible,
        note: eligibilityReview.note,
      });
      toast.success('Eligibility review saved.');
      setEligibilityReview({ appId: null, isEligible: true, note: '' });
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to save eligibility review.');
    }
  };

  const toggleJudgeSelection = (judgeId) => {
    setSelectedJudges(prev =>
      prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
    );
  };

  const toggleReportSelection = (appId) => {
    setSelectedReportIds((prev) => prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]);
  };

  const handleExportReport = async (format = 'csv') => {
    try {
      const { data } = await applicationService.exportApplications(format);
      const fileName = `ai-awards-report.${format}`;
      const blob = new Blob([data], { type: format === 'pdf' ? 'application/pdf' : 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${fileName}.`);
    } catch {
      toast.error('Report export failed.');
    }
  };

  const handlePublishFinalists = async () => {
    if (!selectedReportIds.length) {
      toast.error('Select at least one application first.');
      return;
    }

    setReportActionBusy(true);
    try {
      await applicationService.publishFinalists(selectedReportIds);
      toast.success('Finalists published.');
      setSelectedReportIds([]);
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to publish finalists.');
    } finally {
      setReportActionBusy(false);
    }
  };

  const handlePublishWinners = async () => {
    if (!selectedReportIds.length) {
      toast.error('Select at least one application first.');
      return;
    }

    setReportActionBusy(true);
    try {
      await applicationService.publishWinners(selectedReportIds);
      toast.success('Winners published.');
      setSelectedReportIds([]);
      fetchApps();
      fetchMonitoring();
    } catch {
      toast.error('Failed to publish winners.');
    } finally {
      setReportActionBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
      {/* Main dashboard content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center !hover:transform-none">
            {user?.profileImage ? (
              <img
                src={buildAssetUrl(user.profileImage)}
                alt={user.fullName || user.email}
                className="w-16 h-16 rounded-full object-cover border border-white/20 shadow-glow mx-auto mb-4"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
            )}
            <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
            <span className="badge-gold mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
          </div>

          <div className="glass-card p-2 space-y-1 !hover:transform-none">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: RiDashboardLine },
              { id: 'applications', label: 'Manage Nominations', icon: RiFileList3Line },
              { id: 'monitoring', label: 'Application Monitoring', icon: RiFileChartLine },
              { id: 'users', label: 'User Directory', icon: RiTeamLine },
              { id: 'categories', label: 'Categories', icon: RiFolderShield2Line },
              { id: 'criteria', label: 'Evaluation Criteria', icon: RiStarLine },
              { id: 'broadcast', label: 'Broadcast Alerts', icon: RiMailSendLine },
              { id: 'reports', label: 'Reports & Export', icon: RiFileChartLine },
              { id: 'profile', label: 'My Profile', icon: RiUserLine },
              { id: 'password', label: 'Change Password', icon: RiLockPasswordLine },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-500 text-white shadow-glow'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <RiLogoutBoxLine size={18} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Tab Panel */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 !hover:transform-none h-full min-h-[500px]"
          >
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && stats && (
                  <div className="space-y-8">
                    <h3 className="font-display font-bold text-white text-xl flex justify-between items-center">
                      Dashboard Statistics
                      <button onClick={loadAll} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <RiRefreshLine size={16} />
                      </button>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Applications</span>
                        <p className="text-white text-3xl font-black mt-2 font-display">{stats.stats.totalApplications}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Submitted</span>
                        <p className="text-white text-3xl font-black mt-2 font-display text-accent-400">{stats.stats.submittedApps}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Finalists</span>
                        <p className="text-white text-3xl font-black mt-2 font-display text-gold-400">{stats.stats.finalistApps}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Judges</span>
                        <p className="text-white text-3xl font-black mt-2 font-display">{stats.stats.totalJudges}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Pending Evaluations</span>
                        <p className="text-white text-3xl font-black mt-2 font-display text-amber-400">{stats.stats.pendingEvaluations}</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Completed Evaluations</span>
                        <p className="text-white text-3xl font-black mt-2 font-display text-emerald-400">{stats.stats.completedEvaluations}</p>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider">Judges</h4>
                        <span className="text-[11px] text-slate-400">{judgesList.length} available</span>
                      </div>
                      {judgesList.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {judgesList.map((judge) => (
                            <div key={judge._id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">{judge.firstName} {judge.lastName}</div>
                                  <div className="text-[11px] text-slate-400">{judge.email}</div>
                                </div>
                                <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                  Judge
                                </span>
                              </div>
                              {(judge.organization || judge.designation) && (
                                <div className="mt-2 text-[11px] text-slate-500">
                                  {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-sm text-slate-400">
                          No judges have been added yet.
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Trend chart */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiPulseLine className="text-accent-400" /> Submission Trend</h4>
                        <ResponsiveContainer width="100%" height="85%">
                          <LineChart data={stats.submissionTrend}>
                            <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Line type="monotone" dataKey="count" stroke="#0072ff" strokeWidth={3} dot={{ fill: '#00ff87' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Category Breakdown chart */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 min-h-80">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiAwardLine className="text-gold-400" /> Category Breakdown</h4>
                        <ResponsiveContainer width="100%" height={210}>
                          <BarChart data={stats.categoryBreakdown}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={8} tickFormatter={(val) => val.split(' ').slice(2).join(' ')} />
                            <YAxis
                              stroke="#475569"
                              fontSize={10}
                              allowDecimals={false}
                              domain={[0, 'dataMax']}
                              ticks={getIntegerTicks(stats.categoryBreakdown.map((entry) => entry.count))}
                            />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="count" fill="#00ff87" radius={[4, 4, 0, 0]}>
                              {stats.categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {stats.categoryBreakdown.map((entry, index) => (
                            <div key={entry.name || index} className="flex items-center justify-between gap-3 rounded-lg bg-navy-950/35 px-3 py-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span
                                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                <span className="truncate text-[11px] font-medium text-slate-300">{entry.name}</span>
                              </div>
                              <span className="shrink-0 font-mono text-[11px] font-semibold text-white">{entry.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiMailSendLine className="text-accent-400" /> Notifications</h4>
                        <div className="space-y-3">
                          {(stats.notifications || []).slice(0, 5).map((notification) => (
                            <div key={notification._id} className="border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="text-white text-xs font-semibold">{notification.title}</div>
                                  <div className="text-[11px] text-slate-400 mt-1">{notification.message}</div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{new Date(notification.createdAt).toLocaleTimeString()}</span>
                              </div>
                            </div>
                          ))}
                          {(!stats.notifications || stats.notifications.length === 0) && (
                            <div className="text-sm text-slate-500">No notifications yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ADMINS TAB */}
                {activeTab === 'admins' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Registered Admins</h3>
                        <p className="text-slate-400 text-xs mt-1">View all administrators currently registered in the system.</p>
                      </div>
                      <div className="text-sm text-slate-400">{admins.length} admin{admins.length === 1 ? '' : 's'}</div>
                    </div>

                    {admins.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {admins.map((admin) => (
                          <div key={admin._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-white font-semibold">{admin.firstName} {admin.lastName}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{admin.email}</div>
                              </div>
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                Admin
                              </span>
                            </div>
                            {(admin.organization || admin.designation) && (
                              <div className="mt-3 text-sm text-slate-400">
                                {admin.organization}{admin.organization && admin.designation ? ' • ' : ''}{admin.designation}
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {admin.phone || 'Not provided'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {admin.role}</span>
                              <span className={`rounded-full px-2.5 py-1 ${admin.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {admin.isActive ? 'Active' : 'Suspended'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                        No admins have been registered yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CANDIDATES TAB */}
                {activeTab === 'candidates' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Registered Candidates</h3>
                        <p className="text-slate-400 text-xs mt-1">View all candidates currently registered in the system.</p>
                      </div>
                      <div className="text-sm text-slate-400">{users.filter((userItem) => userItem.role === 'candidate').length} candidate{users.filter((userItem) => userItem.role === 'candidate').length === 1 ? '' : 's'}</div>
                    </div>

                    {users.filter((userItem) => userItem.role === 'candidate').length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {users.filter((userItem) => userItem.role === 'candidate').map((candidate) => (
                          <div key={candidate._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-white font-semibold">{candidate.firstName} {candidate.lastName}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{candidate.email}</div>
                              </div>
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                Candidate
                              </span>
                            </div>
                            {(candidate.organization || candidate.designation) && (
                              <div className="mt-3 text-sm text-slate-400">
                                {candidate.organization}{candidate.organization && candidate.designation ? ' • ' : ''}{candidate.designation}
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-accent-300">{candidate.registrationNumber || 'Registration pending'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {candidate.phone || 'Not provided'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {candidate.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                        No candidates have been registered yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. JUDGES TAB */}
                {activeTab === 'judges' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Registered Judges</h3>
                        <p className="text-slate-400 text-xs mt-1">View all judges currently registered in the system.</p>
                      </div>
                      <div className="text-sm text-slate-400">{judgesList.length} judge{judgesList.length === 1 ? '' : 's'}</div>
                    </div>

                    {judgesList.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {judgesList.map((judge) => (
                          <div key={judge._id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-white font-semibold">{judge.firstName} {judge.lastName}</div>
                                <div className="text-[11px] text-slate-400 mt-1">{judge.email}</div>
                              </div>
                              <span className="rounded-full bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent-300">
                                Judge
                              </span>
                            </div>
                            {(judge.organization || judge.designation) && (
                              <div className="mt-3 text-sm text-slate-400">
                                {judge.organization}{judge.organization && judge.designation ? ' • ' : ''}{judge.designation}
                              </div>
                            )}
                            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Phone: {judge.phone || 'Not provided'}</span>
                              <span className="rounded-full bg-white/5 px-2.5 py-1">Role: {judge.role}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-400">
                        No judges have been registered yet.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. APPLICATIONS TAB */}
                {activeTab === 'applications' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Manage Nominations</h3>
                        <p className="text-slate-400 text-xs mt-1">Audit statuses and assign judges panels.</p>
                      </div>

                      <div className="flex gap-3 w-full sm:w-auto">
                        <input
                          className="input-field max-w-[200px]"
                          placeholder="Search title/ref..."
                          value={appSearch}
                          onChange={(e) => setAppSearch(e.target.value)}
                        />
                        <select
                          className="input-field max-w-[150px]"
                          value={appStatusFilter}
                          onChange={(e) => setAppStatusFilter(e.target.value)}
                        >
                          <option value="">All Statuses</option>
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="eligible">Eligible</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="finalist">Finalist</option>
                          <option value="winner">Winner</option>
                        </select>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-300">
                        <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="p-4">Ref/Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Judges Panel</th>
                            <th className="p-4 text-center">Score</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map(app => (
                            <tr key={app._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-4">
                                <div className="font-bold text-white truncate max-w-[150px]">{app.projectTitle}</div>
                                <div className="text-[10px] font-mono text-slate-500">{app.referenceNumber || 'Draft'}</div>
                              </td>
                              <td className="p-4 truncate max-w-[120px]">{app.category?.name}</td>
                              <td className="p-4">
                                <div>{app.candidate?.firstName} {app.candidate?.lastName}</div>
                                <div className="text-[10px] text-slate-500">{app.candidate?.organization}</div>
                              </td>
                              <td className="p-4">
                                <select
                                  className="bg-navy-900 border border-white/10 rounded px-2 py-1 text-[10px]"
                                  value={app.status}
                                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                                >
                                  <option value={app.status}>{app.statusLabel}</option>
                                  {/* Render other options matching transition engine */}
                                  <option value="under_review">Under Review</option>
                                  <option value="eligible">Eligible</option>
                                  <option value="ineligible">Ineligible</option>
                                  <option value="shortlisted">Shortlisted</option>
                                  <option value="finalist">Finalist</option>
                                  <option value="winner">Winner</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  {app.assignedJudges?.map(j => (
                                    <div key={j._id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded w-fit">{j.firstName}</div>
                                  ))}
                                  <button
                                    onClick={() => openAssignModal(app)}
                                    className="text-accent-400 hover:text-accent-300 font-bold block"
                                  >
                                    + Assign Panel
                                  </button>
                                </div>
                              </td>
                               <td className="p-4 text-center">
                                {app.averageScore !== undefined && app.averageScore !== null ? (
                                  <button
                                    onClick={() => openEvaluationsModal(app)}
                                    className="font-bold text-accent-400 hover:text-accent-300 hover:underline bg-accent-500/10 px-2.5 py-1 rounded border border-accent-500/20 font-mono transition-all"
                                    title="Click to view detailed evaluations"
                                  >
                                    {app.averageScore?.toFixed(1)}
                                  </button>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                              <td className="p-4">
                                <Link to={`/dashboard/applications/${app._id}`} className="text-accent-400 hover:underline">View</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3. APPLICATION MONITORING TAB */}
                {activeTab === 'monitoring' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-display font-bold text-white text-xl">Application Monitoring</h3>
                      <p className="text-slate-400 text-xs mt-1">Review submissions, screen eligibility, manage judge assignment, and track evaluation progress.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {monitoring && [
                        { label: 'Total Applications', value: monitoring.total },
                        { label: 'Pending Review', value: monitoring.pending },
                        { label: 'Screened', value: monitoring.screened },
                        { label: 'Assigned to Judges', value: monitoring.assigned },
                        { label: 'Completed Evaluations', value: monitoring.completedEvaluation },
                        { label: 'Pending Evaluations', value: monitoring.pendingEvaluation },
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="text-slate-400 text-[10px] uppercase tracking-wider">{item.label}</div>
                          <div className="text-white text-2xl font-black mt-2 font-display">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="font-display font-bold text-white text-base mb-4">Eligibility Screening</h4>
                        <div className="space-y-3 max-h-[320px] overflow-y-auto">
                          {applications.filter((app) => app.status === 'submitted' || app.status === 'under_review').map((app) => (
                            <div key={app._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="text-white text-sm font-semibold">{app.projectTitle}</div>
                                  <div className="text-[11px] text-slate-400">{app.candidate?.firstName} {app.candidate?.lastName}</div>
                                </div>
                                <button onClick={() => setEligibilityReview({ appId: app._id, isEligible: app.isEligible ?? true, note: app.adminNotes || '' })} className="text-accent-400 text-xs">Review</button>
                              </div>
                              {eligibilityReview.appId === app._id && (
                                <form onSubmit={handleEligibilityReview} className="mt-3 space-y-2">
                                  <textarea className="input-field h-20" placeholder="Review note" value={eligibilityReview.note} onChange={(e) => setEligibilityReview({ ...eligibilityReview, note: e.target.value })} />
                                  <div className="flex items-center gap-3">
                                    <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: true })} /> Eligible</label>
                                    <label className="text-xs text-slate-300 flex items-center gap-2"><input type="radio" checked={!eligibilityReview.isEligible} onChange={() => setEligibilityReview({ ...eligibilityReview, isEligible: false })} /> Ineligible</label>
                                  </div>
                                  <button type="submit" className="btn-primary text-xs">Save Review</button>
                                </form>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="font-display font-bold text-white text-base mb-4">Judge Evaluation Progress</h4>
                        <div className="space-y-3 max-h-[320px] overflow-y-auto">
                          {judgeProgress.map((entry) => (
                            <div key={entry.judgeId} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <div className="text-white text-sm font-semibold">{entry.judgeName}</div>
                                  <div className="text-[11px] text-slate-400">{entry.email}</div>
                                </div>
                                <div className="text-right text-[11px] text-slate-400">
                                  <div>Submitted: {entry.submitted}</div>
                                  <div>Pending: {entry.pending}</div>
                                </div>
                              </div>
                              <div className="mt-2 text-[11px] text-accent-400">Average score: {entry.avgScore ?? '—'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Evaluations Tracker Section */}
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4 mt-6">
                      <div>
                        <h4 className="font-display font-bold text-white text-base">Evaluations Tracker</h4>
                        <p className="text-slate-400 text-xs mt-0.5">Track live average scores and view judge evaluation sheets for each nominee.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-slate-300">
                          <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
                            <tr>
                              <th className="p-3">Title/Nominee</th>
                              <th className="p-3">Award Category</th>
                              <th className="p-3 text-center">Judges assigned</th>
                              <th className="p-3 text-center">Evaluations Completed</th>
                              <th className="p-3 text-center">Average Score</th>
                              <th className="p-3 text-right">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {applications.filter(app => app.status !== 'draft').map(app => {
                              const completedEvals = app.evaluationCount || 0;
                              const totalAssigned = app.assignedJudges?.length || 0;
                              return (
                                <tr key={app._id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                                  <td className="p-3 font-semibold text-white">{app.projectTitle}</td>
                                  <td className="p-3 text-slate-400">{app.category?.name}</td>
                                  <td className="p-3 text-center font-mono">{totalAssigned}</td>
                                  <td className="p-3 text-center font-mono">
                                    <span className={completedEvals === totalAssigned && totalAssigned > 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                                      {completedEvals} / {totalAssigned}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className="font-mono font-bold text-white bg-white/5 px-2 py-0.5 rounded">
                                      {app.averageScore !== undefined && app.averageScore !== null ? app.averageScore.toFixed(1) : '-'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => openEvaluationsModal(app)}
                                      className="text-accent-400 hover:text-accent-300 font-bold hover:underline"
                                    >
                                      View scorecards
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                            {applications.filter(app => app.status !== 'draft').length === 0 && (
                              <tr>
                                <td colSpan="6" className="p-4 text-center text-slate-500">No nominated applications available for tracking.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. USER DIRECTORY TAB */}
                {activeTab === 'users' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">User Directory</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage system accounts and access credentials.</p>
                      </div>
                      <select
                        className="input-field max-w-[150px]"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                      >
                        <option value="">All Roles</option>
                        <option value="candidate">Candidate</option>
                        <option value="judge">Judge</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-slate-300">
                        <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-400">
                          <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Registration No.</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Registered Date</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(u => (
                            <tr key={u._id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="p-4 font-bold text-white">{u.firstName} {u.lastName}</td>
                              <td className="p-4 font-mono text-accent-300">{u.role === 'candidate' ? (u.registrationNumber || 'Pending') : '—'}</td>
                              <td className="p-4 font-mono">{u.email}</td>
                              <td className="p-4 uppercase text-[10px] tracking-wider font-semibold font-mono text-accent-400">{u.role}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                  {u.isActive ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right space-x-2">
                                <button onClick={() => handleToggleUser(u._id)} className="text-slate-400 hover:text-white">
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button onClick={() => handleDeleteUser(u._id)} className="text-red-400 hover:text-red-300">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. CATEGORIES TAB */}
                {activeTab === 'categories' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Award Categories</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage award categories available for nominations.</p>
                      </div>
                      <button onClick={handleSeedCategories} className="btn-primary text-xs">
                        Seed Default Categories
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h4 className="font-display font-bold text-white text-base">Existing Categories</h4>
                        <div className="space-y-3 max-h-[420px] overflow-y-auto">
                          {categories.map(c => (
                            <div key={c._id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                              <div className="flex justify-between items-start gap-3">
                                <div>
                                  <h5 className="font-semibold text-white text-sm">{c.name}</h5>
                                  <p className="text-slate-400 text-[11px] mt-1">{c.description}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400 text-xs">Delete</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                    </div>
                  </div>
                )}

                {/* EVALUATION CRITERIA TAB */}
                {activeTab === 'criteria' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Evaluation Criteria</h3>
                        <p className="text-slate-400 text-xs mt-1">Manage criteria sets and weight distributions for evaluation scorecards.</p>
                      </div>
                      <button onClick={handleSeedCriteria} className="btn-primary text-xs">
                        Seed Default Criteria
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h4 className="font-display font-bold text-white text-base">
                          {editingCriteriaId ? 'Edit Evaluation Criterion' : 'Create Evaluation Criterion'}
                        </h4>
                        <form onSubmit={handleSubmitCriteria} className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Name</label>
                            <input
                              className="input-field"
                              placeholder="Criterion name"
                              value={criteriaForm.name}
                              onChange={(e) => setCriteriaForm({ ...criteriaForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Description</label>
                            <textarea
                              className="input-field h-24 resize-none"
                              placeholder="Description / judging focus"
                              value={criteriaForm.description}
                              onChange={(e) => setCriteriaForm({ ...criteriaForm, description: e.target.value })}
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Weight (%)</label>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Weight"
                                value={criteriaForm.weight}
                                onChange={(e) => setCriteriaForm({ ...criteriaForm, weight: e.target.value, maxScore: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Max Score</label>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Max Score (equal to weight)"
                                value={criteriaForm.maxScore}
                                disabled
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Category Type</label>
                              <select
                                className="input-field"
                                value={criteriaForm.criteriaType}
                                onChange={(e) => setCriteriaForm({ ...criteriaForm, criteriaType: e.target.value })}
                              >
                                <option value="organizational" className="bg-navy-950">🏢 Organizational Award</option>
                                <option value="individual" className="bg-navy-950">👤 Individual Award</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">Sort Order</label>
                              <input
                                type="number"
                                className="input-field"
                                placeholder="Sort Order"
                                value={criteriaForm.order}
                                onChange={(e) => setCriteriaForm({ ...criteriaForm, order: e.target.value })}
                              />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-sm text-slate-300 select-none">
                            <input
                              type="checkbox"
                              checked={criteriaForm.isActive}
                              onChange={(e) => setCriteriaForm({ ...criteriaForm, isActive: e.target.checked })}
                            />
                            Active & enabled for evaluation
                          </label>
                          <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary text-xs">
                              {editingCriteriaId ? 'Save Changes' : 'Create Criterion'}
                            </button>
                            {editingCriteriaId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCriteriaId(null);
                                  setCriteriaForm({ name: '', description: '', weight: 10, maxScore: 10, criteriaType: 'organizational', order: 0, isActive: true });
                                }}
                                className="btn-ghost text-xs"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                        <h4 className="font-display font-bold text-white text-base">Criteria Definitions</h4>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                          {criteria.map((c) => (
                            <div key={c._id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-2">
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h5 className="font-semibold text-white text-sm truncate">{c.name}</h5>
                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                      c.criteriaType === 'individual'
                                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                                        : 'bg-accent-500/10 text-accent-300 border-accent-500/20'
                                    }`}>
                                      {c.criteriaType === 'individual' ? '👤 Individual' : '🏢 Org'}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{c.description}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <button onClick={() => handleEditCriteria(c)} className="text-accent-400 text-xs hover:text-accent-300 font-medium">Edit</button>
                                  <button onClick={() => handleDeleteCriteria(c._id)} className="text-red-400 text-xs hover:text-red-300 font-medium">Delete</button>
                                </div>
                              </div>
                              <div className="flex gap-4 pt-1 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                                <span>Max score: <strong className="text-white">{c.maxScore}</strong></span>
                                <span>Weight: <strong className="text-white">{c.weight}%</strong></span>
                                <span>Order: <strong className="text-white">{c.order}</strong></span>
                                <span className={c.isActive ? 'text-emerald-400' : 'text-red-400'}>{c.isActive ? 'Active' : 'Inactive'}</span>
                              </div>
                            </div>
                          ))}
                          {criteria.length === 0 && (
                            <p className="text-slate-500 text-xs text-center py-8">No criteria definitions found.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Communication Center</p>
                        <h3 className="mt-1 font-display text-2xl font-black text-white">Send Broadcast Alert</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">Dispatch a targeted system notification to candidates, judges, every user, or a selected application status list.</p>
                      </div>
                      <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Estimated Reach</div>
                        <div className="mt-1 font-display text-2xl font-black text-white">{broadcastAudienceCount}</div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <form onSubmit={handleBroadcast(onBroadcastSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                          {[
                            { value: 'all', label: 'All Users', count: users.length, helper: 'Full platform notice' },
                            { value: 'candidate', label: 'Candidates', count: candidatesList.length, helper: 'Applicants only' },
                            { value: 'judge', label: 'Judges', count: judgesList.length, helper: 'Evaluation panel' },
                          ].map((audience) => (
                            <label
                              key={audience.value}
                              className={`cursor-pointer rounded-xl border p-4 transition-all ${
                                broadcastRole === audience.value
                                  ? 'border-accent-500 bg-accent-500/10 shadow-glow'
                                  : 'border-white/10 bg-navy-950/30 hover:border-white/20 hover:bg-white/5'
                              }`}
                            >
                              <input type="radio" value={audience.value} className="sr-only" {...regBroadcast('role')} />
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-bold text-white">{audience.label}</span>
                                <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-slate-300">{audience.count}</span>
                              </div>
                              <p className="mt-2 text-xs text-slate-500">{audience.helper}</p>
                            </label>
                          ))}
                        </div>

                        <div className="mt-5">
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Application Status List</label>
                          <select
                            className="input-field"
                            value={broadcastStatusAudience?.value || ''}
                            onChange={(event) => setBroadcastValue('role', event.target.value, { shouldDirty: true })}
                          >
                            <option value="" disabled>Select application status...</option>
                            {BROADCAST_STATUS_AUDIENCES.map((audience) => (
                              <option key={audience.value} value={audience.value}>
                                {audience.label} ({getStatusAudienceCount(audience.status)})
                              </option>
                            ))}
                          </select>
                          <p className="mt-2 text-xs text-slate-500">Use this dropdown to message candidates whose applications are currently in that stage.</p>
                        </div>

                        <div className="mt-6 space-y-4">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Title</label>
                            <input className="input-field" placeholder="e.g. Submissions Deadline Extended" {...regBroadcast('title', { required: true })} />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Alert Message</label>
                            <textarea className="input-field min-h-36 resize-none" placeholder="Enter notification message..." {...regBroadcast('message', { required: true })} />
                            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                              <span>Keep the message direct and action-oriented.</span>
                              <span>{broadcastMessage.length} chars</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-slate-500">This sends an in-app notification immediately.</p>
                          <button type="submit" disabled={broadcastSubmitting} className="btn-primary min-w-[180px] disabled:cursor-not-allowed disabled:opacity-60">
                            {broadcastSubmitting ? (
                              <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending...</>
                            ) : (
                              <><RiMailSendLine /> Send Broadcast</>
                            )}
                          </button>
                        </div>
                      </form>

                      <div className="space-y-5">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">Notification Preview</h4>
                            <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-400">Live</span>
                          </div>
                          <div className="mt-4 rounded-2xl border border-white/10 bg-navy-950/60 p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300">
                                <RiMailSendLine size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-white">{broadcastTitle || 'Alert title preview'}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-400">{broadcastMessage || 'Your broadcast message will appear here as users receive the notification.'}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                          <h4 className="text-sm font-bold text-white">Delivery Summary</h4>
                          <div className="mt-4 space-y-3 text-sm">
                            <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
                              <span className="text-slate-400">Audience</span>
                              <span className="font-semibold text-white">{broadcastAudienceLabel}</span>
                            </div>
                            <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
                              <span className="text-slate-400">Recipients</span>
                              <span className="font-semibold text-white">{broadcastAudienceCount}</span>
                            </div>
                            <div className="flex justify-between rounded-xl bg-navy-950/40 px-3 py-2">
                              <span className="text-slate-400">Channel</span>
                              <span className="font-semibold text-white">In-app alert</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. REPORTS TAB */}
                {activeTab === 'reports' && stats && (
                  <div className="space-y-8">
                    <div className="flex flex-col gap-3 border-b border-white/10 pb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-display font-bold text-white text-xl">Reports & Exports</h3>
                          <p className="text-slate-400 text-xs mt-1">Aggregated statistics, export data, and publish finalists/winners.</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => handleExportReport('csv')} className="btn-primary text-xs">Export Excel</button>
                          <button onClick={() => handleExportReport('pdf')} className="btn-gold text-xs">Export PDF</button>
                          <button onClick={() => window.print()} className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10">Print</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={handlePublishFinalists} disabled={reportActionBusy} className="btn-primary text-xs disabled:opacity-50">Publish Finalists</button>
                        <button onClick={handlePublishWinners} disabled={reportActionBusy} className="btn-gold text-xs disabled:opacity-50">Publish Winners</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Status Distribution Recharts Pie */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80 flex flex-col items-center">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 self-start">Workflow Status Share</h4>
                        <ResponsiveContainer width="100%" height="80%">
                          <PieChart>
                            <Pie
                              data={stats.statusBreakdown}
                              dataKey="count"
                              nameKey="status"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ status, count }) => `${status}: ${count}`}
                            >
                              {stats.statusBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Top Scored leader board */}
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Submission Leaderboard</h4>
                        <div className="space-y-3">
                          {applications.slice(0, 5).sort((a,b)=>b.averageScore - a.averageScore).map((app, idx) => (
                            <div key={app._id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
                              <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedReportIds.includes(app._id)} onChange={() => toggleReportSelection(app._id)} className="rounded border-white/10 bg-transparent" />
                                <span>
                                  <span className="font-bold text-white mr-1">#{idx+1}</span>
                                  {app.projectTitle}
                                </span>
                              </div>
                              <span className="font-bold text-accent-400">{app.averageScore?.toFixed(1) || '-'}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-[11px] text-slate-400">Selected: {selectedReportIds.length}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. MY PROFILE */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Admin Profile</p>
                        <h3 className="mt-1 font-display text-2xl font-black text-white">My Profile</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">Manage your administrator identity and profile picture.</p>
                      </div>
                      <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-accent-300">Signed In As</div>
                        <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Administrator'}</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:flex-row sm:items-center">
                      <div className="relative shrink-0">
                        {user?.profileImage ? (
                          <img
                            src={buildAssetUrl(user.profileImage)}
                            alt={user.fullName || user.email}
                            className="h-24 w-24 rounded-full border border-white/10 object-cover shadow-glow"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-accent-500/30 bg-accent-500/15 font-display text-3xl font-bold text-accent-300">
                            {user?.firstName?.charAt(0) || 'A'}
                          </div>
                        )}
                        {imageUploading && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-navy-950/70">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
                          </div>
                        )}
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-sm font-bold text-white">Profile Picture</h4>
                        <p className="mt-1 text-xs text-slate-500">Supports JPEG, PNG or WebP. Max 5MB.</p>
                        <label className="btn-ghost mt-3 inline-flex cursor-pointer items-center gap-2 text-xs !px-3 !py-2">
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
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <span className="mb-1.5 block text-xs font-medium text-slate-500">Email Address</span>
                          <p className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm font-medium text-white">
                            {user?.email}
                          </p>
                        </div>
                        <div>
                          <span className="mb-1.5 block text-xs font-medium text-slate-500">Role</span>
                          <p className="rounded-xl border border-white/5 bg-white/5 p-3 text-sm font-medium text-white">
                            {user?.role}
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
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">{field.label}</label>
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

                {/* 7. CHANGE PASSWORD */}
                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-accent-300">Account Security</p>
                        <h3 className="mt-1 font-display text-2xl font-black text-white">Change Password</h3>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">Update your administrator credentials and keep portal access protected.</p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Signed In As</div>
                        <div className="mt-1 max-w-[220px] truncate text-sm font-semibold text-white">{user?.email || user?.fullName || 'Administrator'}</div>
                      </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <form onSubmit={handlePassword(onChangePasswordSubmit)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6">
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
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
                            <input
                              id="admin-oldpassword"
                              type="password"
                              className="input-field"
                              placeholder="Enter current password"
                              {...regPassword('oldPassword', { required: 'Current password is required' })}
                            />
                            {passErrors.oldPassword && <p className="mt-1 text-xs text-red-400">{passErrors.oldPassword.message}</p>}
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
                            <input
                              id="admin-newpassword"
                              type="password"
                              className="input-field"
                              placeholder="At least 8 characters"
                              {...regPassword('newPassword', {
                                required: 'New password is required',
                                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                              })}
                            />
                            {passErrors.newPassword && <p className="mt-1 text-xs text-red-400">{passErrors.newPassword.message}</p>}
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                            <input
                              id="admin-confirm"
                              type="password"
                              className="input-field"
                              placeholder="Re-enter new password"
                              {...regPassword('confirmPassword', {
                                validate: (v) => v === newPassword || 'Passwords do not match',
                              })}
                            />
                            {passErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{passErrors.confirmPassword.message}</p>}
                          </div>
                        </div>

                        <div className="mt-6 border-t border-white/10 pt-5">
                          <button
                            id="admin-change-submit"
                            type="submit"
                            disabled={passSubmitting}
                            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {passSubmitting ? (
                              <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Updating...</>
                            ) : (
                              <>Update Password <RiCheckDoubleLine /></>
                            )}
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
                            <div className="rounded-xl bg-navy-950/40 px-3 py-3">Use a password that is unique to this admin portal.</div>
                            <div className="rounded-xl bg-navy-950/40 px-3 py-3">Avoid sharing credentials with other administrators.</div>
                            <div className="rounded-xl bg-navy-950/40 px-3 py-3">After updating, use the new password on your next sign-in.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* JUDGES PANEL ASSIGNMENT MODAL */}
      {assignModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-md w-full p-6 bg-surface-200 rounded-[24px] shadow-2xl border border-white/10">
            <h3 className="font-display font-bold text-white text-lg mb-2">Assign Evaluators</h3>
            <p className="text-slate-400 text-xs mb-4">Select judges to assign to <strong>{selectedApp.projectTitle}</strong>.</p>

            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {judgesList.map(judge => {
                const isSelected = selectedJudges.includes(judge._id);
                return (
                  <div
                    key={judge._id}
                    onClick={() => toggleJudgeSelection(judge._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected ? 'bg-accent-500/10 border-accent-500' : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSelected ? 'border-accent-500 bg-accent-500 text-white' : 'border-slate-500'
                    }`}>
                      {isSelected && <RiCheckLine size={12} />}
                    </div>
                    <div>
                      <div className="text-white text-xs font-semibold">{judge.firstName} {judge.lastName}</div>
                      <div className="text-slate-400 text-[10px]">{judge.organization}</div>
                    </div>
                  </div>
                );
              })}
              {judgesList.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-4">No judges registered in directory.</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setAssignModalOpen(false)} className="btn-ghost text-xs !py-2 !px-4">Cancel</button>
              <button onClick={handleAssignSubmit} className="btn-primary text-xs !py-2 !px-4">Save Panel</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED JUDGE EVALUATIONS MODAL */}
      {evaluationsModalOpen && evaluationsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="relative max-w-4xl w-full p-8 bg-surface-200 rounded-[32px] shadow-2xl border border-white/10 max-h-[85vh] overflow-y-auto z-10">
            <button
              onClick={() => setEvaluationsModalOpen(false)}
              className="absolute right-6 top-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="border-b border-white/10 pb-4 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent-400">Scorecard Review</span>
              <h3 className="font-display font-extrabold text-white text-2xl mt-1">{evaluationsApp.projectTitle}</h3>
              <p className="text-slate-400 text-xs mt-1">Submitted by: <strong className="text-white">{evaluationsApp.candidate?.firstName} {evaluationsApp.candidate?.lastName}</strong> ({evaluationsApp.candidate?.organization || 'Individual'})</p>
            </div>

            {evalsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-3 border-accent-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400">Loading judge evaluations...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {evaluationsList.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-slate-400 text-sm">No judge has submitted an evaluation for this nomination yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {evaluationsList.map((evaluationItem) => (
                      <div
                        key={evaluationItem._id}
                        className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-5"
                      >
                        {/* Header: Judge & Score */}
                        <div className="flex justify-between items-start gap-4 flex-wrap border-b border-white/5 pb-4">
                          <div>
                            <h4 className="text-white font-bold text-base">{evaluationItem.judge?.firstName} {evaluationItem.judge?.lastName}</h4>
                            <p className="text-slate-500 text-xs mt-0.5">{evaluationItem.judge?.email}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-3.5 py-1.5 rounded-xl bg-accent-500/10 border border-accent-500/25 font-mono text-base font-black text-accent-400">
                              Score: {evaluationItem.weightedScore?.toFixed(1) || '0'}/100
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">
                              Status: {evaluationItem.isSubmitted ? (
                                <strong className="text-emerald-400">SUBMITTED</strong>
                              ) : (
                                <strong className="text-amber-400">DRAFT</strong>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Category Comments */}
                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Strengths Identified</span>
                            <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">{evaluationItem.strengths || 'None specified'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Weaknesses / Areas of Improvement</span>
                            <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">{evaluationItem.weaknesses || 'None specified'}</p>
                          </div>
                        </div>

                        <div className="text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Comments</span>
                          <p className="text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5 whitespace-pre-line">{evaluationItem.overallComments || 'No overall critique comment provided.'}</p>
                        </div>

                        {/* Score breakdown by criteria */}
                        <div className="space-y-2.5 pt-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Criteria Breakdown</span>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {evaluationItem.scores?.map((s) => {
                              const crit = s.criteria;
                              return (
                                <div key={s._id || crit._id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center text-xs">
                                  <div className="min-w-0 pr-2">
                                    <p className="text-white font-semibold truncate">{crit?.name || 'Criterion score'}</p>
                                    {s.comment && <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed truncate" title={s.comment}>"{s.comment}"</p>}
                                  </div>
                                  <span className="font-mono font-bold text-accent-300 shrink-0 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                    {s.score} / {crit?.weight || 10}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Check indicator icon proxy
const RiCheckLine = ({ size }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
  </svg>
);

export default AdminDashboard;
