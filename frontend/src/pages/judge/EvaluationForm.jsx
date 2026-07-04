import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiArrowLeftLine, RiAwardLine, RiShieldLine, RiCheckLine,
  RiStarLine, RiFileTextLine, RiFileWordLine, RiFileList3Line,
  RiInformationLine, RiCpuLine, RiTeamLine, RiCalendarLine,
  RiDownload2Line, RiExternalLinkLine, RiCheckboxCircleLine,
  RiErrorWarningLine,
} from 'react-icons/ri';
import evaluationService from '../../services/evaluation.service';
import { buildAssetUrl } from '../../services/api';

const EvaluationForm = () => {
  const { id } = useParams(); // applicationId
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const { data } = await evaluationService.getOrCreateEvaluation(id);
        setApp(data.data.application);
        setCriteria(data.data.criteria);
        setEvaluation(data.data.evaluation);

        // Prepopulate scores & forms
        const ev = data.data.evaluation;
        if (ev) {
          setValue('overallComments', ev.overallComments || '');
          setValue('strengths', ev.strengths || '');
          setValue('weaknesses', ev.weaknesses || '');
          setValue('recommendation', ev.recommendation || 'recommend');
          setValue('confidentialityAccepted', ev.confidentialityAccepted || false);

          // Prepopulate score inputs
          ev.scores?.forEach(s => {
            setValue(`score-${s.criteria._id || s.criteria}`, s.score);
            setValue(`comment-${s.criteria._id || s.criteria}`, s.comment || '');
          });
        }
      } catch {
        toast.error('Failed to load evaluation form.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [id, setValue]);

  // Watch scores to calculate real-time totals
  const watchedValues = watch();
  const totals = useMemo(() => {
    if (!criteria.length) return { raw: 0, weighted: 0, completedCount: 0 };
    let rawSum = 0;
    let completedCount = 0;

    criteria.forEach(c => {
      const val = watchedValues[`score-${c._id}`];
      if (val !== undefined && val !== '') {
        rawSum += parseInt(val || 0);
        completedCount++;
      }
    });

    const maxPossible = criteria.length * 10;
    const weighted = maxPossible > 0 ? (rawSum / maxPossible) * 100 : 0;

    return {
      raw: rawSum,
      weighted: Math.round(weighted * 10) / 10,
      completedCount,
    };
  }, [criteria, watchedValues]);

  const onSubmitForm = async (formData, submit) => {
    try {
      const scoresPayload = criteria.map(c => ({
        criteria: c._id,
        score: parseInt(formData[`score-${c._id}`] || 0),
        comment: formData[`comment-${c._id}`] || '',
      }));

      // Validation check for submit
      if (submit) {
        // Must accept confidentiality
        if (!formData.confidentialityAccepted) {
          toast.error('Please accept the confidentiality declaration.');
          return;
        }
        // Check if all criteria are scored
        const unanswered = criteria.filter(c => formData[`score-${c._id}`] === undefined || formData[`score-${c._id}`] === '');
        if (unanswered.length > 0) {
          toast.error(`Please score all criteria before submitting. (${unanswered.length} remaining)`);
          return;
        }
      }

      const payload = {
        scores: scoresPayload,
        overallComments: formData.overallComments,
        strengths: formData.strengths,
        weaknesses: formData.weaknesses,
        recommendation: formData.recommendation,
        confidentialityAccepted: formData.confidentialityAccepted,
        submit, // boolean to finalize
      };

      await evaluationService.saveEvaluation(id, payload);
      toast.success(submit ? 'Evaluation submitted successfully!' : 'Evaluation saved as draft.');
      navigate('/judge-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save evaluation.');
    } finally {
      setShowConfirmSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="w-12 h-12 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-white font-display text-xl font-bold mb-2">Assignment Not Found</h2>
        <Link to="/judge-dashboard" className="text-accent-400 hover:text-accent-300 flex items-center gap-1">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const isSubmitted = evaluation?.isSubmitted;

  return (
    <div className="min-h-screen bg-navy-950 pt-24 pb-20">
      <div className="section-container max-w-7xl">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link
            to="/judge-dashboard"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors w-fit"
          >
            <RiArrowLeftLine /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            {isSubmitted ? (
              <span className="badge-green uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                <RiCheckLine /> Submitted & Locked
              </span>
            ) : (
              <span className="badge-accent uppercase tracking-wider text-[10px] px-3 py-1 font-bold">
                Active Evaluation Draft
              </span>
            )}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Nomination Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div
              className="rounded-2xl border border-white/8 p-6 space-y-6"
              style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}
            >
              <div>
                <span className="badge-gold uppercase font-mono text-[9px]">{app.category?.name}</span>
                <h1 className="font-display font-black text-2xl text-white mt-2 leading-tight">{app.projectTitle}</h1>
                <p className="text-slate-400 text-xs mt-1 italic">"{app.tagline || 'No tagline provided'}"</p>
              </div>

              <div className="divider-glow" />

              {/* Sections */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 text-accent-400">
                    <RiInformationLine /> Problem Statement
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-white/3 p-3 rounded-xl border border-white/5">
                    {app.problemStatement || 'Not provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 text-accent-400">
                    <RiCpuLine /> Solution & AI Technologies
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-white/3 p-3 rounded-xl border border-white/5">
                    {app.solution || 'Not provided'}
                  </p>
                  {app.aiTechnologies && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {app.aiTechnologies.split(',').map((tech) => (
                        <span key={tech} className="bg-accent-500/10 text-accent-300 text-[9px] px-2 py-0.5 rounded border border-accent-500/20">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {app.innovationDetails && (
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 text-accent-400">
                      Innovation & Uniqueness
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-white/3 p-3 rounded-xl border border-white/5">
                      {app.innovationDetails}
                    </p>
                  </div>
                )}

                {app.impactDetails && (
                  <div>
                    <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5 text-accent-400">
                      Business & Social Impact
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-white/3 p-3 rounded-xl border border-white/5">
                      {app.impactDetails}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Team Size</span>
                    <p className="text-white text-xs font-semibold flex items-center gap-1.5 mt-1">
                      <RiTeamLine /> {app.teamSize || 1} Member(s)
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Submitted On</span>
                    <p className="text-white text-xs font-semibold flex items-center gap-1.5 mt-1">
                      <RiCalendarLine /> {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-GB') : '—'}
                    </p>
                  </div>
                </div>

                {app.teamMembers && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Team Roster</span>
                    <p className="text-slate-300 text-xs mt-1 bg-white/2 p-2 rounded-lg border border-white/5 font-mono truncate">
                      {app.teamMembers}
                    </p>
                  </div>
                )}
              </div>

              {/* Supporting evidence files */}
              {app.documents?.length > 0 && (
                <div className="pt-4 border-t border-white/5">
                  <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Supporting Documents</h4>
                  <div className="space-y-2">
                    {app.documents.map((doc) => (
                      <a
                        key={doc._id}
                        href={`http://localhost:5000/${doc.filePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/5 hover:border-accent-500/30 hover:bg-white/8 transition-all text-xs text-slate-300 hover:text-white"
                      >
                        <RiFileTextLine className="text-accent-400 text-lg shrink-0" />
                        <span className="truncate flex-1 font-medium">{doc.originalName}</span>
                        <RiDownload2Line className="text-slate-500 shrink-0 text-sm" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Evaluation Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Real-time score calculator dashboard */}
            <div
              className="rounded-2xl border border-white/8 p-5 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(0,114,255,0.08) 0%, rgba(0,255,135,0.04) 100%)', backdropFilter: 'blur(16px)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-white text-sm">Evaluation Summary</h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Scored {totals.completedCount} of {criteria.length} criteria
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Weighted Score</span>
                  <p className="text-3xl font-display font-black text-white leading-none mt-1">
                    {totals.weighted}%
                  </p>
                </div>
              </div>
              
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden mt-4">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(totals.completedCount / criteria.length) * 100}%`,
                    background: 'linear-gradient(90deg, #0072ff, #00ff87)',
                  }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit((data) => onSubmitForm(data, false))} className="space-y-6">
              
              {/* Scoring criteria */}
              <div
                className="rounded-2xl border border-white/8 p-6 space-y-6"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}
              >
                <h3 className="font-display font-bold text-white text-base border-b border-white/5 pb-3 flex items-center gap-2">
                  <RiStarLine className="text-gold-400" /> Criteria Evaluation
                </h3>

                <div className="space-y-6">
                  {criteria.map((c) => {
                    const scoreName = `score-${c._id}`;
                    const commentName = `comment-${c._id}`;
                    const currentScore = watchedValues[scoreName] || 0;

                    return (
                      <div key={c._id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h4 className="text-white text-sm font-bold">{c.name}</h4>
                            <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded text-slate-400 shrink-0">
                            Weight: {c.weight}%
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                          {/* Score input / slider */}
                          <div className="w-full sm:flex-1 flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="10"
                              step="1"
                              disabled={isSubmitted}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              {...register(scoreName)}
                            />
                            <span className="w-8 h-8 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-300 flex items-center justify-center font-mono font-bold text-sm shrink-0">
                              {currentScore}
                            </span>
                          </div>
                          
                          {/* Critique comment */}
                          <input
                            type="text"
                            placeholder="Critique note..."
                            disabled={isSubmitted}
                            className="input-field sm:max-w-[240px] !py-2 text-xs disabled:opacity-50"
                            {...register(commentName)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              <div
                className="rounded-2xl border border-white/8 p-6 space-y-5"
                style={{ background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(16px)' }}
              >
                <h3 className="font-display font-bold text-white text-base border-b border-white/5 pb-3">
                  Evaluator Recommendations
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Overall Evaluation Comments</label>
                    <textarea
                      placeholder="Enter overall critique summary..."
                      disabled={isSubmitted}
                      className="input-field h-24 resize-none text-xs disabled:opacity-50"
                      {...register('overallComments')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Key Strengths</label>
                      <textarea
                        placeholder="Core strengths..."
                        disabled={isSubmitted}
                        className="input-field h-20 resize-none text-xs disabled:opacity-50"
                        {...register('strengths')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Areas for Improvement</label>
                      <textarea
                        placeholder="Weaknesses / improvements..."
                        disabled={isSubmitted}
                        className="input-field h-20 resize-none text-xs disabled:opacity-50"
                        {...register('weaknesses')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Panel Recommendation</label>
                    <select
                      disabled={isSubmitted}
                      className="input-field text-xs disabled:opacity-50"
                      {...register('recommendation')}
                    >
                      <option value="strongly_recommend" className="bg-navy-950">Strongly Recommend</option>
                      <option value="recommend" className="bg-navy-950">Recommend</option>
                      <option value="neutral" className="bg-navy-950">Neutral</option>
                      <option value="not_recommend" className="bg-navy-950">Do Not Recommend</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Confidentiality agreement declaration */}
              <div
                className="p-5 rounded-2xl border border-accent-500/20 flex gap-3.5 bg-accent-500/5 items-start"
              >
                <input
                  type="checkbox"
                  id="confirm-confidentiality"
                  disabled={isSubmitted}
                  className="w-5 h-5 accent-accent-500 mt-0.5 rounded border-white/20 disabled:opacity-50"
                  {...register('confidentialityAccepted')}
                />
                <label htmlFor="confirm-confidentiality" className="text-slate-400 text-xs leading-relaxed select-none">
                  I agree to the Confidentiality and Conflict of Interest Declaration. I confirm I have no proprietary, personal, or financial interest in this project or its competing products. <span className="text-red-400">*</span>
                </label>
              </div>

              {/* Actions panel */}
              {!isSubmitted && (
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/3 border border-white/5">
                  <button
                    type="button"
                    onClick={() => navigate('/judge-dashboard')}
                    className="btn-ghost !px-4 !py-2.5 text-xs"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-ghost text-xs !py-2.5 !px-4"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmSubmit(true)}
                      disabled={isSubmitting}
                      className="btn-gold text-xs flex items-center gap-1.5"
                    >
                      Submit Scorecard <RiCheckLine />
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>

        </div>

      </div>

      {/* CONFIRM SUBMISSION MODAL */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmSubmit(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            {/* Modal box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md p-6 rounded-2xl border border-white/10 bg-navy-900 shadow-glow flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <RiErrorWarningLine className="text-amber-400 text-2xl" />
              </div>
              <h3 className="font-display font-bold text-white text-lg mb-2">Finalize Scorecard Submission?</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Once submitted, this scorecard is locked for compliance logging and cannot be edited or modified under any circumstances.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 btn-ghost !py-2.5 text-xs"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit((data) => onSubmitForm(data, true))}
                  disabled={isSubmitting}
                  className="flex-1 btn-gold !py-2.5 text-xs font-bold"
                >
                  Yes, Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvaluationForm;
