import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { RiAwardLine, RiEyeLine, RiEyeOffLine, RiCheckDoubleLine, RiArrowLeftLine } from 'react-icons/ri';
import api from '../services/api';
import Button from '../components/shared/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccessMsg('');
      if (!token) {
        setServerError('Reset token is missing from the URL.');
        return;
      }

      const res = await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      setSuccessMsg(res.data.message || 'Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy-950">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-accent-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <RiAwardLine className="text-white text-3xl" />
            </div>
          </Link>
          <h1 className="font-display font-black text-2xl text-white">Create New Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            Choose a strong password containing numbers and letters
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          {serverError && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">New Password</label>
              <div className="relative">
                <input
                  id="reset-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="At least 8 characters"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm New Password</label>
              <input
                id="reset-confirm"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Re-enter your password"
                {...register('confirmPassword', {
                  validate: (v) => v === password || 'Passwords do not match',
                })}
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              id="reset-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
              style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Resetting...</>
              ) : (
                <>Update Password <RiCheckDoubleLine /></>
              )}
            </button>
          </form>

          <div className="divider-glow my-6" />

          <Link
            to="/login"
            className="text-xs text-slate-400 hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors mx-auto w-fit block"
          >
            <RiArrowLeftLine /> Back to Sign In
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
