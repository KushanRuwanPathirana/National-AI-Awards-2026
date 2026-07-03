import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  RiUserLine, RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiSendPlane2Line, RiCheckDoubleLine, RiFileList3Line, RiInformationLine,
  RiArrowRightLine, RiAddLine, RiCalendarLine, RiFolderOpenLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import applicationService from '../../services/application.service';
import Button from '../../components/shared/Button';

const CandidateDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Change Password state
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError,   setChangeError]   = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm();
  const newPassword = watch('newPassword');

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

  useEffect(() => {
    fetchApps();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
      reset();
    } catch (err) {
      setChangeError(err.response?.data?.message || 'Failed to update password.');
      toast.error('Password change failed.');
    }
  };

  const drafts = applications.filter(a => a.status === 'draft');
  const submitted = applications.filter(a => a.status !== 'draft');

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
      {/* Main dashboard content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center !hover:transform-none">
            <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
              {user?.firstName?.charAt(0) || 'C'}
            </div>
            <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
            <span className="badge-accent mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
          </div>

          <div className="glass-card p-2 space-y-1 !hover:transform-none">
            {[
              { id: 'overview', label: 'Overview', icon: RiInformationLine },
              { id: 'nominations', label: 'My Applications', icon: RiFileList3Line },
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
            className="glass-card p-8 !hover:transform-none h-full min-h-[400px]"
          >
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-display font-bold text-white text-xl">Candidate Overview</h3>
                  <Link to="/dashboard/apply" className="btn-primary text-xs flex items-center gap-1.5">
                    <RiAddLine /> Start Application
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Draft Entries</h4>
                    <p className="text-white text-3xl font-black mt-2 font-display">{drafts.length}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Submitted Applications</h4>
                    <p className="text-white text-3xl font-black mt-2 font-display">{submitted.length}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Categories</h4>
                    <p className="text-white text-3xl font-black mt-2 font-display">10</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Active Deadlines */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <h4 className="text-white text-sm font-bold flex items-center gap-2 mb-4">
                      <RiCalendarLine className="text-accent-400" /> Key Timeline Milestones
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Applications Open</span>
                        <span className="text-white font-medium">May 15, 2026</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400 font-bold text-accent-400">Submission Deadline</span>
                        <span className="text-white font-medium font-bold text-accent-400">July 31, 2026</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Judge Evaluation Phase</span>
                        <span className="text-white font-medium">Aug 1 - Aug 25, 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Grand Awards Ceremony</span>
                        <span className="text-white font-medium">Sept 10, 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Guide note */}
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-white text-sm font-bold mb-2">Important Instructions</h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        You can save draft applications and complete them at any time. Once submitted, applications enter the verification screening phase and cannot be modified.
                      </p>
                    </div>
                    <Link to="/about" className="text-accent-400 hover:text-accent-300 text-xs font-semibold flex items-center gap-1 mt-4">
                      Learn more about judging process <RiArrowRightLine />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 2. APPLICATIONS TAB */}
            {activeTab === 'nominations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-xl">My Nominations</h3>
                    <p className="text-slate-400 text-xs mt-1">Manage and track your innovations submissions.</p>
                  </div>
                  <Link to="/dashboard/apply" className="btn-primary text-xs flex items-center gap-1.5">
                    <RiAddLine /> Start New Application
                  </Link>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                      <RiFolderOpenLine className="text-accent-400 text-2xl" />
                    </div>
                    <h4 className="font-display font-semibold text-white text-base mb-1">No Nominations Found</h4>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto mb-6">Start building your application draft to submit your tech innovation.</p>
                    <Link to="/dashboard/apply" className="btn-gold text-xs">
                      Start New Nomination <RiSendPlane2Line />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app._id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all">
                        <div>
                          <span className="badge-accent uppercase font-mono text-[9px]">{app.category?.name}</span>
                          <h4 className="font-display font-bold text-white text-base mt-1">{app.projectTitle}</h4>
                          <span className="text-slate-500 text-xs font-mono">{app.referenceNumber || 'Draft'}</span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'winner' ? 'bg-emerald-500/10 text-emerald-400' :
                            app.status === 'ineligible' ? 'bg-red-500/10 text-red-400' :
                            'bg-accent-500/10 text-accent-400'
                          }`}>
                            {app.statusLabel}
                          </span>
                          <Link to={`/dashboard/applications/${app._id}`} className="btn-ghost !py-2 !px-4 text-xs">
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-6">Profile Details</h3>
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

            {/* 4. CHANGE PASSWORD TAB */}
            {activeTab === 'password' && (
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-2">Change Password</h3>
                <p className="text-slate-400 text-sm mb-6">Ensure your account uses a secure password to keep your application data safe.</p>

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

                <form onSubmit={handleSubmit(onChangePasswordSubmit)} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Current Password *</label>
                    <input
                      id="change-oldpassword"
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
                      id="change-newpassword"
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
                      id="change-confirm"
                      type="password"
                      className="input-field"
                      placeholder="Re-enter new password"
                      {...register('confirmPassword', {
                        validate: (v) => v === newPassword || 'Passwords do not match',
                      })}
                    />
                    {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                  </div>

                  <button
                    id="change-submit"
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full mt-2"
                    style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                  >
                    {isSubmitting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                    ) : (
                      <>Update Password <RiCheckDoubleLine /></>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
