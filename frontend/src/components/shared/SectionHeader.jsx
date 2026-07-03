import { motion } from 'framer-motion';

const SectionHeader = ({
  badge,
  title,
  highlight,
  subtitle,
  centered = true,
  light = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className={`mb-14 ${centered ? 'text-center max-w-2xl mx-auto' : 'max-w-xl'}`}
  >
    {badge && (
      <span className="badge-accent mb-4 inline-flex">
        {badge}
      </span>
    )}
    <h2 className={`font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 ${light ? 'text-white' : 'text-white'}`}>
      {title}{' '}
      {highlight && <span className="gradient-text">{highlight}</span>}
    </h2>
    {subtitle && (
      <p className="text-slate-400 text-base sm:text-lg leading-relaxed">{subtitle}</p>
    )}
  </motion.div>
);

export default SectionHeader;
