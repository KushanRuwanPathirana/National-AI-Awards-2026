import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { RiAwardLine, RiMailSendLine, RiArrowLeftLine } from 'react-icons/ri';
import api from '../services/api';
import Button from '../components/shared/Button';

const ForgotPassword = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccessMsg('');
      const res = await api.post('/auth/forgot-password', data);
      setSuccessMsg(res.data.message || 'If an account matches, a reset link has been sent.');
      reset();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
          <h1 className="font-display font-black text-2xl text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your email to receive a password reset link
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <button
              id="forgot-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
              style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
              ) : (
                <>Send Reset Link <RiMailSendLine /></>
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

export default ForgotPassword;
