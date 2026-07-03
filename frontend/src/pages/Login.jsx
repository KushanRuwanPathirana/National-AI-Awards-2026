import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { RiAwardLine, RiEyeLine, RiEyeOffLine, RiArrowRightLine, RiLockLine, RiMailLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const { login } = useAuth();
  const navigate  = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const res = await api.post(endpoint, data);
      const { token, user } = res.data.data;
      login(user, token);

      // Redirect based on verification status and role
      if (!user.isEmailVerified) {
        navigate('/verify-otp', { state: { email: user.email } });
        return;
      }

      if (user.role === 'admin')     navigate('/admin');
      else if (user.role === 'judge') navigate('/judge-dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setServerError('');
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full bg-accent-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4 py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <RiAwardLine className="text-white text-3xl" />
            </div>
          </Link>
          <h1 className="font-display font-black text-2xl text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login'
              ? 'Sign in to your AI Awards portal'
              : 'Join the National AI Awards Sri Lanka'}
          </p>
        </motion.div>

        {/* Mode toggle tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex rounded-xl p-1 bg-surface-200/80 border border-white/10 mb-8"
        >
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === m
                  ? 'bg-accent-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </motion.div>

        {/* Card */}
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="glass-card p-8"
        >
          {serverError && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Register-only fields */}
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">First Name *</label>
                  <input
                    id="reg-firstname"
                    className="input-field"
                    placeholder="First"
                    {...register('firstName', { required: 'Required' })}
                  />
                  {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Last Name *</label>
                  <input
                    id="reg-lastname"
                    className="input-field"
                    placeholder="Last"
                    {...register('lastName', { required: 'Required' })}
                  />
                  {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address *</label>
              <div className="relative">
                <RiMailLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                  })}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs text-slate-400 font-medium">Password *</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-accent-400 hover:text-accent-300 font-medium transition-colors">
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <RiLockLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-lg" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-11"
                  placeholder={mode === 'register' ? 'Min 8 chars, upper, lower, number' : 'Your password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
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

            {/* Register-only: confirm password + role */}
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Confirm Password *</label>
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Re-enter your password"
                    {...register('confirmPassword', {
                      validate: (v) => v === password || 'Passwords do not match',
                    })}
                  />
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">I am applying as *</label>
                  <select id="reg-role" className="input-field" {...register('role')}>
                    <option value="candidate" className="bg-navy-950">Candidate (Applicant / Innovator)</option>
                    <option value="judge" className="bg-navy-950">Judge (Requires approval)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Organisation</label>
                  <input
                    id="reg-org"
                    className="input-field"
                    placeholder="Your company or institution"
                    {...register('organization')}
                  />
                </div>
              </>
            )}

            {/* Submit */}
            <button
              id={mode === 'login' ? 'login-submit' : 'register-submit'}
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
              style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : mode === 'login' ? (
                <>Sign In <RiArrowRightLine /></>
              ) : (
                <>Create Account <RiArrowRightLine /></>
              )}
            </button>
          </form>

          {/* Switch mode text */}
          <p className="text-center text-slate-500 text-xs mt-6">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button onClick={switchMode} className="text-accent-400 hover:text-accent-300 font-medium transition-colors">
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-slate-600 text-xs mt-6">
          By signing in you agree to our{' '}
          <Link to="#" className="text-accent-500/70 hover:text-accent-400">Privacy Policy</Link>
          {' '}and{' '}
          <Link to="#" className="text-accent-500/70 hover:text-accent-400">Terms of Use</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
