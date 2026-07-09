import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { RiMailCheckLine, RiRefreshLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import Button from '../components/shared/Button';
import sltMobitelLogo from '../assets/slt-mobitel-logo.png';

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmailOTP, resendVerificationOTP } = useAuth();

  const [email]       = useState(() => location.state?.email || '');
  const [serverError, setServerError] = useState('');
  const [successMsg,  setSuccessMsg]  = useState('');
  const [timer,       setTimer]       = useState(60);
  const [canResend,   setCanResend]   = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // Timer countdown for resending code
  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccessMsg('');
      const verifiedUser = await verifyEmailOTP(data.otp, email);

      // Redirect based on role
      setSuccessMsg('Email verified successfully! Redirecting...');
      setTimeout(() => {
        if (verifiedUser.role === 'admin')     navigate('/admin');
        else if (verifiedUser.role === 'judge') navigate('/judge-dashboard');
        else navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Verification failed. Please check the code.');
    }
  };

  const handleResend = async () => {
    try {
      setServerError('');
      setSuccessMsg('');
      await resendVerificationOTP(email);
      setSuccessMsg('Verification code resent. Please check your inbox.');
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to resend verification code.');
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
          <Link to="/" className="inline-flex items-center justify-center mb-4">
            <img
              src={sltMobitelLogo}
              alt="SLT Mobitel"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <h1 className="font-display font-black text-2xl text-white">Verify Your Email</h1>
          <p className="text-slate-400 text-sm mt-1">
            We sent a 6-digit verification code to <strong className="text-slate-200">{email || 'your email'}</strong>
          </p>
        </div>

        {/* Form Card */}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-xs text-slate-400 mb-2 font-medium text-center uppercase tracking-wider">
                Verification Code
              </label>
              <input
                id="otp-code"
                type="text"
                maxLength={6}
                autoFocus
                className="input-field text-center text-2xl font-bold tracking-[8px] max-w-[200px] mx-auto block"
                placeholder="000000"
                {...register('otp', {
                  required: 'Verification code is required',
                  pattern: { value: /^\d{6}$/, message: 'Must be exactly 6 digits' },
                })}
              />
              {errors.otp && <p className="text-red-400 text-xs mt-2 text-center">{errors.otp.message}</p>}
            </div>

            <button
              id="otp-submit"
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
              style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
              ) : (
                <>Verify & Proceed <RiMailCheckLine /></>
              )}
            </button>
          </form>

          <div className="divider-glow my-6" />

          {/* Resend Controls */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-xs text-accent-400 hover:text-accent-300 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <RiRefreshLine /> Resend Code
              </button>
            ) : (
              <p className="text-xs text-slate-500">
                Resend code in <strong className="text-slate-400">{timer}s</strong>
              </p>
            )}
          </div>
        </motion.div>

        {/* Back Link */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Incorrect email address?{' '}
          <Link to="/login" className="text-accent-500 hover:underline">
            Register again
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
