import { useState } from 'react';
import { judgeImages } from '../../assets/judges';

const getInitials = (name) => {
  const clean = name.replace(/^(Mr\.|Dr\.|Ms\.|Mrs\.|Prof\.)\s+/i, '');
  const parts = clean.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : 'AI';
};

const JudgeAvatar = ({ judge, variant = 'card', className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const imageSrc = judgeImages[judge.id];
  const showImage = imageSrc && !imgError;

  const isGrandJury = judge.isGrandJury;
  const sizeClasses = variant === 'modal' ? 'w-20 h-20 text-3xl' : 'w-24 h-24 text-2xl';
  const borderClasses = isGrandJury
    ? variant === 'modal'
      ? 'border-gold-500 shadow-[0_0_15px_rgba(0,255,135,0.4)]'
      : 'border-gold-400 shadow-[0_0_15px_rgba(0,255,135,0.4)]'
    : variant === 'modal'
      ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
      : 'border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.4)]';

  return (
    <div className="relative">
      <div
        className={`${sizeClasses} rounded-full overflow-hidden flex items-center justify-center font-display font-black text-white border-2 ${borderClasses} group-hover:scale-105 transition-transform duration-300 flex-shrink-0 ${className} ${
          showImage ? '' : 'bg-gradient-to-br from-surface-50 to-surface-100 shadow-inner'
        }`}
      >
        {showImage ? (
          <img
            src={imageSrc}
            alt={judge.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          getInitials(judge.name)
        )}
      </div>
    </div>
  );
};

export default JudgeAvatar;
