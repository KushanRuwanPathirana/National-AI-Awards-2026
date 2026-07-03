import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  RiUserLine, RiAwardLine, RiLockPasswordLine, RiLogoutBoxLine,
  RiCheckDoubleLine, RiFileList3Line, RiStarLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/shared/Button';

const JudgeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  // Change Password state
  const [changeSuccess, setChangeSuccess] = useState('');
  const [changeError,   setChangeError]   = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm();
  const newPassword = watch('newPassword');

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
      reset();
    } catch (err) {
      setChangeError(err.response?.data?.message || 'Failed to update password. Please check current password.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      {/* Navbar shell */}
      <header className="bg-navy-950/80 backdrop-blur-md border-b border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <RiAwardLine className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-base leading-tight">Judge Portal</h1>
              <p className="text-xs text-accent-400 font-medium">Sri Lanka AI Awards 2026</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-1.5 border-red-500/20 text-red-400 hover:bg-red-500/10"
          >
            <RiLogoutBoxLine /> Sign Out
          </button>
        </div>
      </header>

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
                <p className="text-slate-400 text-sm mb-6">Review, score, and comment on your assigned AI Awards submissions.</p>

                {/* Empty State Teaser */}
                <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                    <RiFileList3Line className="text-accent-400 text-2xl" />
                  </div>
                  <h4 className="font-display font-semibold text-white text-base mb-1">No Assigned Nominations</h4>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto">Once nominations close, administrators will assign submissions for your evaluation.</p>
                </div>
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
