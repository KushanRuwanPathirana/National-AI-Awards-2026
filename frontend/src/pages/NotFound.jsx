import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiHomeLine, RiArrowLeftLine } from 'react-icons/ri';
import Button from '../components/shared/Button';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-navy-950">
    {/* Background */}
    <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />
    <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-accent-600/10 blur-3xl pointer-events-none" />

    <div className="section-container relative z-10 text-center py-20">
      {/* 404 number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="mb-8"
      >
        <span className="font-display font-black text-[10rem] sm:text-[14rem] leading-none gradient-text select-none">
          404
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-md mx-auto mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button variant="primary" size="lg">
              <RiHomeLine /> Go to Home
            </Button>
          </Link>
          <button onClick={() => window.history.back()}>
            <Button variant="ghost" size="lg">
              <RiArrowLeftLine /> Go Back
            </Button>
          </button>
        </div>
      </motion.div>

      {/* Decorative orbit rings */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-accent-500/10 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-accent-500/5 pointer-events-none"
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  </div>
);

export default NotFound;
