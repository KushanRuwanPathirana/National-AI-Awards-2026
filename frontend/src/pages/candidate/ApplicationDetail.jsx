import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  RiArrowLeftLine, RiFileTextLine, RiAwardLine, RiCalendarLine,
  RiTimeLine, RiTeamLine, RiGlobalLine, RiSurveyLine,
} from 'react-icons/ri';
import applicationService from '../../services/application.service';
import { buildAssetUrl } from '../../services/api';

const statusWorkflow = [
  'draft',
  'submitted',
  'under_review',
  'eligible',
  'shortlisted',
  'finalist',
  'winner',
];

const ApplicationDetail = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const { data } = await applicationService.getApplicationById(id);
        setApp(data.data.application);
      } catch {
        toast.error('Failed to load application details.');
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [id]);

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
        <h2 className="text-white font-display text-xl font-bold mb-2">Application Not Found</h2>
        <Link to="/dashboard" className="text-accent-400 hover:text-accent-300 flex items-center gap-1">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const getStatusIndex = (status) => {
    // Treat ineligible same as under_review/eligible index for layout
    if (status === 'ineligible') return 3;
    if (status === 'runner_up') return 6;
    return statusWorkflow.indexOf(status);
  };

  const currentIdx = getStatusIndex(app.status);

  return (
    <div className="min-h-screen bg-navy-950 pt-28 pb-20">
      <div className="section-container max-w-5xl">
        <Link to="/dashboard" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-6 transition-colors w-fit">
          <RiArrowLeftLine /> Back to Dashboard
        </Link>

        {/* Hero Card */}
        <div className="glass-card p-8 mb-8 !hover:transform-none">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <span className="badge-accent uppercase font-mono text-[10px]">{app.category?.name}</span>
              <h1 className="font-display font-black text-2xl text-white mt-1.5">{app.projectTitle}</h1>
              <p className="text-slate-400 text-sm mt-1">{app.tagline || 'No tagline provided'}</p>
            </div>
            <div className="text-right">
              {app.referenceNumber && (
                <div className="text-xs text-slate-500 font-mono">REF: {app.referenceNumber}</div>
              )}
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                app.status === 'winner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                app.status === 'ineligible' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-accent-500/10 text-accent-400 border border-accent-500/20'
              }`}>
                {app.statusLabel}
              </span>
            </div>
          </div>

          {/* Workflow Map */}
          <div>
            <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-6">Application Progress</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {statusWorkflow.map((stage, idx) => {
                const isPast = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={stage} className="flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isPast ? 'bg-accent-500 border-accent-500 text-white shadow-glow' :
                      isCurrent ? 'bg-navy-950 border-accent-500 text-accent-400 shadow-glow' :
                      'bg-navy-950 border-white/10 text-slate-500'
                    }`}>
                      {isPast ? <RiCheckLine size={14} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${
                      isCurrent ? 'text-accent-400 font-bold' : 'text-slate-500'
                    }`}>
                      {stage.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 !hover:transform-none">
              <h3 className="font-display font-bold text-white text-lg border-b border-white/10 pb-3 mb-5 flex items-center gap-2">
                <RiSurveyLine className="text-accent-400" /> Executive Summary
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Problem Statement</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{app.problemStatement}</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">AI Solution & Technical Details</h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{app.solution}</p>
                </div>
                {app.innovationDetails && (
                  <div>
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Innovation Highlight</h4>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{app.innovationDetails}</p>
                  </div>
                )}
                {app.impactDetails && (
                  <div>
                    <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Direct Impact & Outcomes</h4>
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{app.impactDetails}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="glass-card p-8 !hover:transform-none">
              <h3 className="font-display font-bold text-white text-lg border-b border-white/10 pb-3 mb-5 flex items-center gap-2">
                <RiFileTextLine className="text-accent-400" /> Attached Proof & Documents
              </h3>
              {app.documents?.length === 0 ? (
                <p className="text-slate-500 text-xs">No documents attached.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {app.documents?.map(doc => (
                    <a
                      key={doc._id}
                      href={buildAssetUrl(doc.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent-500/30 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <RiFileTextLine className="text-accent-400 text-xl group-hover:scale-105 transition-transform" />
                        <span className="text-xs text-slate-300 truncate font-medium">{doc.originalName}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Details */}
            {app.category?.name !== 'University AI Innovation' && (
              <div className="glass-card p-8 !hover:transform-none">
                <h3 className="font-display font-bold text-white text-lg border-b border-white/10 pb-3 mb-5 flex items-center gap-2">
                  <RiAwardLine className="text-accent-400" /> Payment Details
                </h3>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status</span>
                    <span className="font-bold text-emerald-400">Paid / Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="text-white capitalize font-semibold">
                      {app.paymentMethod === 'transfer' ? 'Online / Bank Transfer' : app.paymentMethod === 'online' ? 'Online Card Payment' : 'Not Selected'}
                    </span>
                  </div>
                  {app.paymentMethod === 'transfer' && app.paymentSlip && (
                    <div className="flex flex-col gap-2 border-t border-white/5 pt-3 mt-3">
                      <span className="text-slate-500 font-medium">Uploaded Bank Slip</span>
                      <a
                        href={buildAssetUrl(app.paymentSlip.filePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-accent-500/30 hover:bg-white/10 transition-all group w-fit"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <RiFileTextLine className="text-accent-400 text-xl group-hover:scale-105 transition-transform" />
                          <span className="text-xs text-slate-300 truncate font-medium">{app.paymentSlip.originalName}</span>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-8">
            <div className="glass-card p-6 !hover:transform-none">
              <h3 className="font-display font-bold text-white text-base border-b border-white/10 pb-3 mb-4">Metadata</h3>
              <div className="space-y-4 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1"><RiCalendarLine /> Created</span>
                  <span className="text-white">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
                {app.submittedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><RiTimeLine /> Submitted</span>
                    <span className="text-white">{new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {app.organizationName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><RiGlobalLine /> Organisation</span>
                    <span className="text-white truncate max-w-[150px]">{app.organizationName}</span>
                  </div>
                )}
                {app.teamSize && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><RiTeamLine /> Team Size</span>
                    <span className="text-white">{app.teamSize} member(s)</span>
                  </div>
                )}
                {app.projectUrl && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 flex items-center gap-1"><RiGlobalLine /> Project Link</span>
                    <a href={app.projectUrl} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline truncate max-w-[150px]">
                      Visit Link
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Audit notes / candidate information */}
            <div className="glass-card p-6 !hover:transform-none">
              <h3 className="font-display font-bold text-white text-base border-b border-white/10 pb-3 mb-4">Verification Check</h3>
              <div className="space-y-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${app.isEligible ? 'bg-emerald-500 shadow-glow' : app.isEligible === false ? 'bg-red-500' : 'bg-slate-600'}`} />
                  <span>Category Eligibility: {app.isEligible === true ? 'Verified' : app.isEligible === false ? 'Failed' : 'Pending Screening'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${app.status === 'winner' || app.status === 'runner_up' ? 'bg-emerald-500 shadow-glow' : 'bg-slate-600'}`} />
                  <span>Awards Ceremony: {app.status === 'winner' ? '🏆 Winner Awarded' : app.status === 'runner_up' ? '🥈 Runner-up Awarded' : 'Pending Selection'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple proxy indicator for standard checks
const RiCheckLine = ({ size }) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height={size} width={size} xmlns="http://www.w3.org/2000/svg">
    <path fill="none" d="M0 0h24v24H0z"></path>
    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
  </svg>
);

export default ApplicationDetail;
