import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  RiArrowLeftLine,
  RiCheckDoubleLine,
  RiEyeLine,
  RiEyeOffLine,
  RiMailSendLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri';
import api from '../services/api';
import sltMobitelLogo from '../assets/slt-mobitel-logo.png';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [emailAddress, setEmailAddress] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  });
  const password = watch('password');

  const sendOtp = async ({ email }) => {
    try {
      setServerError('');
      setSuccessMsg('');
      const res = await api.post('/auth/forgot-password', { email });
      setEmailAddress(email);
      setStep('reset');
      setSuccessMsg(res.data.message || 'If an account matches, a password reset OTP has been sent.');
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorList = err.response.data.errors.map(e => e.msg).join(', ');
        setServerError(`Validation failed: ${errorList}`);
      } else {
        setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  const resetPassword = async (data) => {
    try {
      setServerError('');
      setSuccessMsg('');
      const email = emailAddress || data.email;

      const res = await api.post('/auth/reset-password', {
        email,
        otp: data.otp,
        password: data.password,
      });

      setSuccessMsg(res.data.message || 'Password reset successful. Redirecting to sign in...');
      reset();
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorList = err.response.data.errors.map(e => e.msg).join(', ');
        setServerError(`Validation failed: ${errorList}`);
      } else {
        setServerError(err.response?.data?.message || 'Failed to reset password. Please check the OTP and try again.');
      }
    }
  };

  const onSubmit = step === 'email' ? sendOtp : resetPassword;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy-950 px-4 py-24">
      {/* Background */}
      <div className="absolute inset-0 dot-pattern opacity-15 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_34%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center mb-5">
            <img src={sltMobitelLogo} alt="SLT MOBITEL" className="h-12 w-auto" />
          </Link>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/30 bg-accent-500/15 text-accent-200 shadow-glow">
            <RiShieldKeyholeLine className="text-2xl" />
          </div>
          <h1 className="font-display font-black text-3xl text-white">Forgot Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 'email'
              ? 'Enter your email address and we will send a secure OTP.'
              : 'Enter the OTP from your email and set a new password.'}
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 !hover:transform-none"
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
            {step === 'email' ? (
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
            ) : (
              <>
                <div className="rounded-xl border border-accent-400/20 bg-accent-500/10 p-3 text-xs text-slate-300">
                  OTP sent to <span className="font-semibold text-white">{emailAddress}</span>. The code expires in 15 minutes.
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Reset OTP</label>
                  <input
                    id="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="input-field tracking-[0.45em]"
                    placeholder="000000"
                    {...register('otp', {
                      required: 'OTP is required',
                      minLength: { value: 6, message: 'OTP must be 6 digits' },
                      maxLength: { value: 6, message: 'OTP must be 6 digits' },
                    })}
                  />
                  {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">New Password</label>
                  <div className="relative">
                    <input
                      id="forgot-new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="input-field pr-11"
                      placeholder="At least 8 characters"
                      {...register('password', {
                        required: 'New password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm New Password</label>
                  <input
                    id="forgot-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Re-enter new password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match',
                    })}
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
              </>
            )}

            <button
              id="forgot-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
              style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {step === 'email' ? 'Sending...' : 'Updating...'}</>
              ) : step === 'email' ? (
                <>Send OTP <RiMailSendLine /></>
              ) : (
                <>Update Password <RiCheckDoubleLine /></>
              )}
            </button>
          </form>

          <div className="divider-glow my-6" />

          {step === 'reset' && (
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setServerError('');
                setSuccessMsg('');
              }}
              className="mb-4 block w-full text-center text-xs font-medium text-accent-300 transition-colors hover:text-accent-200"
            >
              Use a different email
            </button>
          )}

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
