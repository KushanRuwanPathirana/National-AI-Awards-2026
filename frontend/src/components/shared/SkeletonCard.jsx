/**
 * SkeletonCard — shimmer loading placeholder
 * Usage: <SkeletonCard lines={3} />
 */
const SkeletonCard = ({ lines = 2, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-4 rounded-lg bg-white/8"
        style={{ width: i === 0 ? '60%' : i === lines - 1 ? '40%' : '100%' }}
      />
    ))}
  </div>
);

export const SkeletonRow = ({ cols = 4 }) => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <div
        key={i}
        className="h-4 rounded-lg bg-white/8 flex-1"
        style={{ maxWidth: i === 0 ? '200px' : undefined }}
      />
    ))}
  </div>
);

export default SkeletonCard;
