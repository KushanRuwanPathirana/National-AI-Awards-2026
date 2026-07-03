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
  RiUserLine, RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiCheckDoubleLine, RiFileList3Line, RiSettings4Line, RiTeamLine,
  RiDashboardLine, RiFileChartLine, RiShieldUserLine, RiMailSendLine,
  RiArrowRightLine, RiFolderShield2Line, RiRefreshLine, RiPulseLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import adminService from '../../services/admin.service';
import applicationService from '../../services/application.service';
import categoryService from '../../services/category.service';

const COLORS = ['#0072ff', '#00ff87', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c'];

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & listings
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Assign Judge Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedJudges, setSelectedJudges] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  // Change Password form
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError,   setChangeError]   = useState('');
  const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors, isSubmitting: passSubmitting }, watch, reset: resetPassword } = useForm();
  const newPassword = watch('newPassword');

  // Broadcast form
  const { register: regBroadcast, handleSubmit: handleBroadcast, reset: resetBroadcast, formState: { isSubmitting: broadcastSubmitting } } = useForm();

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

  const fetchCategories = async () => {
    try {
      const { data } = await categoryService.getCategories();
      setCategories(data.data.categories);
    } catch { toast.error('Failed to load categories.'); }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data } = await adminService.getAuditLogs({ limit: 30 });
      setAuditLogs(data.data.logs);
    } catch { /* silent */ }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchApps(), fetchUsers(), fetchCategories(), fetchAuditLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [appSearch, appStatusFilter, userRoleFilter]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
    } catch {
      toast.error('Failed to delete user.');
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

  // Broadcast submit
  const onBroadcastSubmit = async (data) => {
    try {
      await adminService.broadcastNotification(data);
      toast.success('Broadcast notification sent successfully.');
      resetBroadcast();
    } catch {
      toast.error('Failed to send broadcast.');
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
    } catch {
      toast.error('Failed to assign judges.');
    }
  };

  const toggleJudgeSelection = (judgeId) => {
    setSelectedJudges(prev =>
      prev.includes(judgeId) ? prev.filter(id => id !== judgeId) : [...prev, judgeId]
    );
  };

  const judgesList = users.filter(u => u.role === 'judge');

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
      {/* Main dashboard content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center !hover:transform-none">
            <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
              {user?.firstName?.charAt(0) || 'A'}
            </div>
            <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
            <span className="badge-gold mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
          </div>

          <div className="glass-card p-2 space-y-1 !hover:transform-none">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: RiDashboardLine },
              { id: 'applications', label: 'Manage Nominations', icon: RiFileList3Line },
              { id: 'users', label: 'User Directory', icon: RiTeamLine },
              { id: 'categories', label: 'Categories CRUD', icon: RiFolderShield2Line },
              { id: 'broadcast', label: 'Broadcast Alerts', icon: RiMailSendLine },
              { id: 'reports', label: 'Reports & Export', icon: RiFileChartLine },
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
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 h-80">
                        <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5"><RiAwardLine className="text-gold-400" /> Category Breakdown</h4>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={stats.categoryBreakdown}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={8} tickFormatter={(val) => val.split(' ').slice(2).join(' ')} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Bar dataKey="count" fill="#00ff87" radius={[4, 4, 0, 0]}>
                              {stats.categoryBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent audit activity */}
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                      <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4">Recent Audit Actions</h4>
                      <div className="space-y-3">
                        {auditLogs.slice(0, 5).map(log => (
                          <div key={log._id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0 text-slate-300">
                            <div>
                              <strong className="text-white">{log.performedBy?.firstName} {log.performedBy?.lastName}</strong> performed{' '}
                              <span className="text-accent-400 font-mono text-[10px]">{log.action.replace('_', ' ')}</span>
                            </div>
                            <span className="text-slate-500 font-mono text-[10px]">{new Date(log.createdAt).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. APPLICATIONS TAB */}
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
                              <td className="p-4 text-center font-bold text-white">{app.averageScore?.toFixed(1) || '-'}</td>
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

                {/* 3. USER DIRECTORY TAB */}
                {activeTab === 'users' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
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
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Award Categories</h3>
                        <p className="text-slate-400 text-xs mt-1">Categories configuration panel.</p>
                      </div>
                      <button onClick={handleSeedCategories} className="btn-primary text-xs">
                        Seed Default Categories
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map(c => (
                        <div key={c._id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-start gap-4">
                          <div>
                            <h4 className="font-display font-bold text-white text-base">{c.name}</h4>
                            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{c.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. BROADCAST TAB */}
                {activeTab === 'broadcast' && (
                  <div>
                    <h3 className="font-display font-bold text-white text-xl mb-2">Send Broadcast Alert</h3>
                    <p className="text-slate-400 text-xs mb-6">Dispatch a system notification alert to users of a selected role or globally.</p>

                    <form onSubmit={handleBroadcast(onBroadcastSubmit)} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Send Alert To</label>
                        <select className="input-field" {...regBroadcast('role')}>
                          <option value="all">All Registered Users</option>
                          <option value="candidate">Candidates Only</option>
                          <option value="judge">Judges Only</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Alert Title</label>
                        <input className="input-field" placeholder="e.g. Submissions Deadline Extended" {...regBroadcast('title', { required: true })} />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Alert Message</label>
                        <textarea className="input-field h-24 resize-none" placeholder="Enter notification message..." {...regBroadcast('message', { required: true })} />
                      </div>

                      <button type="submit" disabled={broadcastSubmitting} className="btn-primary w-full mt-2">
                        {broadcastSubmitting ? 'Sending...' : 'Send Broadcast'}
                      </button>
                    </form>
                  </div>
                )}

                {/* 6. REPORTS TAB */}
                {activeTab === 'reports' && stats && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                      <div>
                        <h3 className="font-display font-bold text-white text-xl">Reports & Exports</h3>
                        <p className="text-slate-400 text-xs mt-1">Aggregated statistics and print leaderboard.</p>
                      </div>
                      <button onClick={() => window.print()} className="btn-gold text-xs">Print Report (PDF)</button>
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
                              <div>
                                <span className="font-bold text-white mr-1">#{idx+1}</span>
                                {app.projectTitle}
                              </div>
                              <span className="font-bold text-accent-400">{app.averageScore?.toFixed(1) || '-'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. CHANGE PASSWORD */}
                {activeTab === 'password' && (
                  <div>
                    <h3 className="font-display font-bold text-white text-xl mb-2">Change Password</h3>
                    <p className="text-slate-400 text-sm mb-6">Ensure your account uses a secure password to keep your administrator portal data safe.</p>

                    {changeError && (
                      <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {changeError}
                      </div>
                    )}

                    {changeSuccess && (
                      <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                        {changeSuccess}
                      </div>
                    )}

                    <form onSubmit={handlePassword(onChangePasswordSubmit)} className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Current Password *</label>
                        <input
                          id="admin-oldpassword"
                          type="password"
                          className="input-field"
                          placeholder="Enter current password"
                          {...regPassword('oldPassword', { required: 'Current password is required' })}
                        />
                        {passErrors.oldPassword && <p className="text-red-400 text-xs mt-1">{passErrors.oldPassword.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">New Password *</label>
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
                        {passErrors.newPassword && <p className="text-red-400 text-xs mt-1">{passErrors.newPassword.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm New Password *</label>
                        <input
                          id="admin-confirm"
                          type="password"
                          className="input-field"
                          placeholder="Re-enter new password"
                          {...regPassword('confirmPassword', {
                            validate: (v) => v === newPassword || 'Passwords do not match',
                          })}
                        />
                        {passErrors.confirmPassword && <p className="text-red-400 text-xs mt-1">{passErrors.confirmPassword.message}</p>}
                      </div>

                      <button
                        id="admin-change-submit"
                        type="submit"
                        disabled={passSubmitting}
                        className="btn-primary w-full mt-2"
                        style={passSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                      >
                        {passSubmitting ? (
                          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                        ) : (
                          <>Update Password <RiCheckDoubleLine /></>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* JUDGES PANEL ASSIGNMENT MODAL */}
      {assignModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card max-w-md w-full p-6 relative !hover:transform-none">
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
