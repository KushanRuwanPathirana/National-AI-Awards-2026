import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-4 border-accent-500/30 border-t-accent-500 rounded-full animate-spin`} />
      {text && <p className="text-slate-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
