import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  RiUserLine, RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiCheckDoubleLine, RiFileList3Line, RiStarLine, RiTimeLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import evaluationService from '../../services/evaluation.service';

const JudgeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Change Password state
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError,   setChangeError]   = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm();
  const newPassword = watch('newPassword');

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const { data } = await evaluationService.getAssignedApplications();
      setApplications(data.data.applications);
    } catch {
      toast.error('Failed to load assigned applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
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

  const pending = applications.filter(a => !a.myEvaluation || a.myEvaluation.isDraft);
  const completed = applications.filter(a => a.myEvaluation && !a.myEvaluation.isDraft);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col pt-20">
      {/* Main dashboard content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 text-center !hover:transform-none">
            <div className="w-16 h-16 rounded-full bg-accent-500/15 border border-accent-500/30 flex items-center justify-center mx-auto mb-4 font-display font-bold text-accent-300 text-2xl">
              {user?.firstName?.charAt(0) || 'J'}
            </div>
            <h2 className="font-display font-bold text-white text-lg">{user?.fullName}</h2>
            <span className="badge-gold mt-2 text-[10px] uppercase font-mono">{user?.role}</span>
          </div>

          <div className="glass-card p-2 space-y-1 !hover:transform-none">
            {[
              { id: 'profile', label: 'My Profile', icon: RiUserLine },
              { id: 'evaluations', label: 'Assigned Evaluations', icon: RiStarLine },
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
            {/* 1. PROFILE TAB */}
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

            {/* 2. EVALUATIONS TAB */}
            {activeTab === 'evaluations' && (
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-2">Assigned Nominations</h3>
                <p className="text-slate-400 text-xs mb-6">Review, score, and comment on your assigned AI Awards submissions.</p>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                      <RiStarLine className="text-accent-400 text-2xl" />
                    </div>
                    <h4 className="font-display font-semibold text-white text-base mb-1">No Assigned Nominations</h4>
                    <p className="text-slate-500 text-xs max-w-xs mx-auto">Once nominations close, administrators will assign submissions for your evaluation.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Pending Scorecards */}
                    {pending.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white text-sm font-bold flex items-center gap-1.5"><RiTimeLine className="text-gold-400" /> Pending Evaluation ({pending.length})</h4>
                        {pending.map((app) => (
                          <div key={app._id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all">
                            <div>
                              <span className="badge-gold uppercase font-mono text-[9px]">{app.category?.name}</span>
                              <h5 className="font-display font-bold text-white text-base mt-1">{app.projectTitle}</h5>
                              <p className="text-slate-400 text-xs mt-0.5">{app.candidate?.fullName} — {app.candidate?.organization}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {app.myEvaluation?.isDraft ? 'Draft Saved' : 'Not Started'}
                              </span>
                              <Link to={`/judge-dashboard/evaluate/${app._id}`} className="btn-primary text-xs !py-2 !px-4">
                                Evaluate
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Completed Reviews */}
                    {completed.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-white text-sm font-bold flex items-center gap-1.5"><RiCheckDoubleLine className="text-emerald-400" /> Completed Evaluations ({completed.length})</h4>
                        {completed.map((app) => (
                          <div key={app._id} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all">
                            <div>
                              <span className="badge-accent uppercase font-mono text-[9px]">{app.category?.name}</span>
                              <h5 className="font-display font-bold text-white text-base mt-1">{app.projectTitle}</h5>
                              <p className="text-slate-400 text-xs mt-0.5">Score: <strong>{app.myEvaluation?.weightedScore?.toFixed(1)}/100</strong></p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Completed
                              </span>
                              <Link to={`/judge-dashboard/evaluate/${app._id}`} className="btn-ghost text-xs !py-2 !px-4">
                                View Scorecard
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. CHANGE PASSWORD TAB */}
            {activeTab === 'password' && (
              <div>
                <h3 className="font-display font-bold text-white text-xl mb-2">Change Password</h3>
                <p className="text-slate-400 text-sm mb-6">Ensure your account uses a secure password to keep your evaluations data safe.</p>

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
                        validate: (v) => v === newPassword || 'Passwords do not match',
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

export default JudgeDashboard;
