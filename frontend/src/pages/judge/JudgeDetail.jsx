import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiLinkedinBoxFill, RiArrowLeftLine } from 'react-icons/ri';
import Button from '../../components/shared/Button';
import JudgeAvatar from '../../components/judge/JudgeAvatar';
import { judgesData } from '../JudgePortal';

const JudgeDetail = () => {
  const { id } = useParams();
  const judgeData = judgesData.find(judge => judge.id === id) || null;

  if (!judgeData) {
    return (
      <div className="min-h-screen bg-navy-950 text-slate-200 flex items-center justify-center relative">
        <div className="absolute top-0 inset-x-0 h-[800px] pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-accent-500/10 to-transparent blur-[150px]" />
        </div>
        <div className="relative z-10 text-center px-6">
          <h1 className="font-display font-extrabold text-4xl text-accent-400 mb-4">
            Judge Not Found
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            We couldn't find the profile details for the requested panelist.
          </p>
          <Link to="/judge-portal">
            <Button variant="ghost" className="border border-white/10 rounded-2xl mx-auto">
              <RiArrowLeftLine className="mr-2" />
              Back to Judge Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-200 relative">
      {/* Background Mesh */}
      <div className="absolute top-0 inset-x-0 h-[800px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-gradient-to-br from-accent-500/10 to-transparent blur-[150px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-gradient-to-br from-purple-500/10 to-transparent blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 py-16 ">
        {/* Back to Judge Portal - Top Right */}
        <div className="flex justify-end mb-12">
          
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Large Avatar Section - Smaller & Correct */}
<div className="flex justify-center mb-8">
  <div className="
    w-40 h-40
    sm:w-52 sm:h-52
    md:w-60 md:h-60
    lg:w-64 lg:h-64
    xl:w-72 xl:h-72
    rounded-full bg-gradient-to-br from-accent-500 to-purple-500 p-2
  ">
    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
      <JudgeAvatar judge={judgeData} variant="detail" />
    </div>
  </div>
</div>

          {/* Judge Name */}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-accent-400 mb-3">
            {judgeData.name}
          </h1>

          {/* Designation */}
          <p className="text-lg text-slate-300 font-medium mb-1">
            {judgeData.designation}
          </p>

          {/* Organization */}
          <p className="text-base text-slate-400">
            {judgeData.organization}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 mb-6">
            <span className="px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-slate-300">
              Panelist
            </span>
            {judgeData.linkedin && (
              <a
                href={judgeData.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <RiLinkedinBoxFill className="text-[#0A66C2] text-sm" />
                Find on LinkedIn
              </a>
            )}
          </div>

          {/* Judge Description */}
          {judgeData.description && (
            <div className="max-w-3xl mx-auto text-left mb-10">
              <p className="text-slate-300 leading-relaxed text-justify whitespace-pre-line">
                {judgeData.description}
              </p>
            </div>
          )}

          {/* Back Button - Bottom Center */}
          <div className="flex justify-center">
            <Link to="/judge-portal">
              <Button variant="ghost" className="border border-white/10 rounded-2xl">
                <RiArrowLeftLine className="mr-2" />
                Back to Judge Portal
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JudgeDetail;