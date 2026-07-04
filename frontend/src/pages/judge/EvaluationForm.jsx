import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  RiArrowLeftLine, RiAwardLine, RiShieldLine, RiCheckLine,
  RiStarLine, RiFileTextLine, RiFileWordLine,
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

  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm();

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

          // Prepopulate score sliders
          ev.scores?.forEach(s => {
            setValue(`score-${s.criteria}`, s.score);
            setValue(`comment-${s.criteria}`, s.comment || '');
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

  const onSubmitForm = async (formData, submit) => {
    try {
      const scoresPayload = criteria.map(c => ({
        criteria: c._id,
        score: parseInt(formData[`score-${c._id}`] || 0),
        comment: formData[`comment-${c._id}`] || '',
      }));

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

  return (
    <div className="min-h-screen bg-navy-950 pt-28 pb-20">
      <div className="section-container max-w-5xl">
        <Link to="/judge-dashboard" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-6 transition-colors w-fit">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>

        {/* Info summary */}
        <div className="glass-card p-8 mb-8 !hover:transform-none">
          <span className="badge-gold uppercase font-mono text-[10px]">{app.category?.name}</span>
          <h1 className="font-display font-black text-2xl text-white mt-1.5">{app.projectTitle}</h1>
          <p className="text-slate-400 text-sm mt-1">{app.tagline || 'No tagline provided'}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-white/5 pt-6 text-slate-300 text-xs">
            <div>
              <span className="block text-slate-500 font-bold uppercase tracking-wider mb-1">Problem Statement</span>
              <p className="leading-relaxed whitespace-pre-line">{app.problemStatement}</p>
            </div>
            <div>
              <span className="block text-slate-500 font-bold uppercase tracking-wider mb-1">AI Solution & Technical Details</span>
              <p className="leading-relaxed whitespace-pre-line">{app.solution}</p>
            </div>
          </div>

          {app.documents?.length > 0 && (
            <div className="mt-6 border-t border-white/5 pt-6">
              <span className="block text-slate-500 font-bold uppercase tracking-wider mb-3 text-xs">Attachment Documents</span>
              <div className="flex flex-wrap gap-3">
                {app.documents.map(doc => (
                  <a
                    key={doc._id}
                    href={buildAssetUrl(doc.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-accent-500/30 hover:bg-white/10 transition-all text-xs"
                  >
                    <RiFileTextLine className="text-accent-400" />
                    <span>{doc.originalName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scorecard Form */}
        <form onSubmit={handleSubmit((data) => onSubmitForm(data, false))} className="space-y-8">
          <div className="glass-card p-8 !hover:transform-none">
            <h3 className="font-display font-bold text-white text-lg border-b border-white/10 pb-3 mb-6 flex items-center gap-2">
              <RiStarLine className="text-gold-400" /> Scoring Sheet
            </h3>

            <div className="space-y-8">
              {criteria.map((c) => (
                <div key={c._id} className="border-b border-white/5 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white text-sm font-bold">{c.name}</h4>
                      <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">Weight: <strong>{c.weight}%</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-3">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-500"
                      {...register(`score-${c._id}`)}
                    />
                    <input
                      type="text"
                      className="input-field max-w-[200px]"
                      placeholder="Comment for this score..."
                      {...register(`comment-${c._id}`)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Comments */}
          <div className="glass-card p-8 !hover:transform-none">
            <h3 className="font-display font-bold text-white text-lg border-b border-white/10 pb-3 mb-6">Evaluator Remarks</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Overall Evaluation Comments</label>
                <textarea
                  className="input-field h-28 resize-none"
                  placeholder="Summarize your evaluation notes here..."
                  {...register('overallComments')}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Project Strengths</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="Key strengths of the AI integration/system..."
                  {...register('strengths')}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Project Weaknesses & Gaps</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="Any improvements needed or identified issues..."
                  {...register('weaknesses')}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">Panel Recommendation</label>
                <select className="input-field" {...register('recommendation')}>
                  <option value="strongly_recommend" className="bg-navy-950">Strongly Recommend</option>
                  <option value="recommend" className="bg-navy-950">Recommend</option>
                  <option value="neutral" className="bg-navy-950">Neutral</option>
                  <option value="not_recommend" className="bg-navy-950">Do Not Recommend</option>
                </select>
              </div>
            </div>
          </div>

          {/* Confidentiality declaration */}
          <div className="glass-card p-6 !hover:transform-none flex gap-3 border border-accent-500/20 bg-accent-500/5">
            <input
              type="checkbox"
              id="confirm-confidentiality"
              className="w-5 h-5 accent-accent-500 mt-0.5"
              {...register('confidentialityAccepted')}
            />
            <label htmlFor="confirm-confidentiality" className="text-slate-300 text-xs leading-relaxed">
              I agree to the Confidentiality and Conflict of Interest Declaration. I confirm I have no proprietary, personal, or financial interest in this project or its competing products. <span className="text-red-400">*</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center bg-white/5 border border-white/5 p-4 rounded-2xl">
            <button
              type="button"
              onClick={() => navigate('/judge-dashboard')}
              className="btn-ghost !px-4 !py-2 text-xs"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-ghost text-xs !py-2.5 !px-4 border-slate-700 hover:bg-white/5"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handleSubmit((data) => onSubmitForm(data, true))}
                disabled={isSubmitting}
                className="btn-gold text-xs flex items-center gap-1.5"
              >
                Submit Scorecard <RiCheckLine />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;
