import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variantMap = {
  primary: 'btn-primary',
  gold:    'btn-gold',
  ghost:   'btn-ghost',
};

const sizeMap = {
  sm: 'text-xs px-4 py-2',
  md: 'text-sm px-6 py-3',
  lg: 'text-base px-8 py-4',
};

const Button = forwardRef(
  ({ children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props }, ref) => {
    const classes = `${variantMap[variant] || variantMap.primary} ${sizeMap[size]} ${className}`;

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        className={classes}
        disabled={disabled || loading}
        style={disabled || loading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        {...props}
      >
        {loading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
