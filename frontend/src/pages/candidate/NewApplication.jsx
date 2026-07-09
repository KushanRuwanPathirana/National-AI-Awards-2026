import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  RiArrowLeftLine, RiArrowRightLine, RiCheckLine, RiCloseLine,
  RiFileTextLine, RiSave3Line, RiShieldCheckLine, RiUploadCloud2Line,
} from 'react-icons/ri';
import Button from '../../components/shared/Button';
import categoryService from '../../services/category.service';
import applicationService from '../../services/application.service';
import { useAuth } from '../../context/AuthContext';

const steps = [
  { label: 'Applicant' },
  { label: 'Category' },
  { label: 'Overview' },
  { label: 'Evidence' },
  { label: 'Materials' },
  { label: 'National' },
  { label: 'Consent' },
];

const organisationSizes = ['Startup <4 yrs', 'SME', 'Large Enterprise', 'Government', 'Academic'];
const deploymentStatuses = ['Pilot', 'Live in production', 'Scaling'];
const APPLICATION_DEADLINE_CLOSES_AT = '2026-08-16T00:00:00+05:30';
const APPLICATION_DEADLINE_LABEL = '15 August 2026';

const judgingCriteria = [
  ['innovationOriginality', 'Innovation & Originality', 20, 'What makes this technically or conceptually novel vs existing solutions?'],
  ['measurableImpact', 'Measurable Impact (Business/National)', 25, 'Quantified results: revenue impact, cost savings, users served, efficiency gains with supporting data/metrics.'],
  ['technicalExcellence', 'Technical Excellence', 20, 'Architecture overview, models/frameworks used, performance benchmarks.'],
  ['responsibleAI', 'Responsible AI & Governance', 15, 'Data privacy measures, bias mitigation, explainability, compliance steps taken.'],
  ['scalabilitySustainability', 'Scalability & Sustainability', 10, 'Plan/evidence for scaling beyond current deployment.'],
  ['executionEvidence', 'Execution & Evidence', 10, 'Team capability, timeline of delivery, proof points such as links, screenshots, or demo video.'],
];

const defaults = {
  organisationName: '',
  registrationNumber: '',
  sectorIndustry: '',
  organisationSize: '',
  primaryContactName: '',
  primaryContactDesignation: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  websiteLinkedIn: '',
  categoryId: '',
  categoryEligibilityConfirmed: false,
  projectTitle: '',
  tagline: '',
  problemStatement: '',
  solution: '',
  deploymentStatus: '',
  launchDate: '',
  customerReferenceRevenue: '',
  innovationOriginality: '',
  measurableImpact: '',
  technicalExcellence: '',
  responsibleAI: '',
  scalabilitySustainability: '',
  executionEvidence: '',
  projectUrl: '',
  demoVideoUrl: '',
  testimonialOne: '',
  testimonialTwo: '',
  nationalRelevance: '',
  declarationAccepted: false,
  verificationConsent: false,
  promotionalConsent: false,
  conflictDisclosure: '',
  submissionFeeAcknowledged: false,
};

const countWords = (value = '') => value.trim().split(/\s+/).filter(Boolean).length;
const hasApplicationDeadlinePassed = () => Date.now() >= new Date(APPLICATION_DEADLINE_CLOSES_AT).getTime();

const getApiErrorMessage = (error, fallback) => {
  const first = error.response?.data?.errors?.[0];
  if (first) return `${first.field}: ${first.message}`;
  return error.response?.data?.message || fallback;
};

const FieldLabel = ({ children, required = false }) => (
  <label className="block text-xs text-slate-400 mb-1.5 font-medium">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

const WordHint = ({ value, max }) => {
  const count = countWords(value);
  return <p className={`mt-1 text-[11px] ${count > max ? 'text-red-300' : 'text-slate-500'}`}>{count}/{max} words</p>;
};

const FieldError = ({ message }) => (
  message ? <p className="mt-1 text-[11px] font-medium text-red-300">{message}</p> : null
);

const NewApplication = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const draftQueryId = searchParams.get('draft');
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { register, handleSubmit, watch, reset, getValues, setValue } = useForm({ defaultValues: defaults });
  const categoryId = watch('categoryId');
  const watched = watch();
  const candidateRegistrationNumber = user?.registrationNumber || '';
  const applicationDeadlinePassed = hasApplicationDeadlinePassed();

  useEffect(() => {
    setValue('registrationNumber', candidateRegistrationNumber, { shouldDirty: false });
  }, [candidateRegistrationNumber, setValue]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await categoryService.getCategories();
        setCategories(data.data.categories || []);
      } catch {
        toast.error('Failed to load award categories.');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setSelectedCategory(categories.find(category => category._id === categoryId) || null);
  }, [categoryId, categories]);

  useEffect(() => {
    if (!draftQueryId) return;

    const fetchDraft = async () => {
      setLoadingDraft(true);
      try {
        const { data } = await applicationService.getApplicationById(draftQueryId);
        const draft = data.data.application;

        if (draft.status !== 'draft') {
          toast.error('Only draft applications can be edited.');
          navigate('/dashboard');
          return;
        }

        setDraftId(draft._id);
        setUploadedFiles(draft.documents || []);
        reset({
          ...defaults,
          organisationName: draft.organisationName || draft.organizationName || '',
          registrationNumber: candidateRegistrationNumber,
          sectorIndustry: draft.sectorIndustry || '',
          organisationSize: draft.organisationSize || '',
          primaryContactName: draft.primaryContactName || '',
          primaryContactDesignation: draft.primaryContactDesignation || '',
          primaryContactEmail: draft.primaryContactEmail || '',
          primaryContactPhone: draft.primaryContactPhone || '',
          websiteLinkedIn: draft.websiteLinkedIn || '',
          categoryId: draft.category?._id || draft.category || '',
          categoryEligibilityConfirmed: !!draft.categoryEligibilityConfirmed || draft.isEligible === true,
          projectTitle: draft.projectTitle || '',
          tagline: draft.tagline || '',
          problemStatement: draft.problemStatement || '',
          solution: draft.solution || '',
          deploymentStatus: draft.deploymentStatus || '',
          launchDate: draft.launchDate ? draft.launchDate.slice(0, 10) : '',
          customerReferenceRevenue: draft.customerReferenceRevenue || '',
          innovationOriginality: draft.innovationOriginality || draft.innovationDetails || '',
          measurableImpact: draft.measurableImpact || draft.impactDetails || '',
          technicalExcellence: draft.technicalExcellence || draft.aiTechnologies || '',
          responsibleAI: draft.responsibleAI || '',
          scalabilitySustainability: draft.scalabilitySustainability || '',
          executionEvidence: draft.executionEvidence || '',
          projectUrl: draft.projectUrl || '',
          demoVideoUrl: draft.demoVideoUrl || '',
          testimonialOne: draft.testimonialOne || '',
          testimonialTwo: draft.testimonialTwo || '',
          nationalRelevance: draft.nationalRelevance || '',
          declarationAccepted: !!draft.declarationAccepted,
          verificationConsent: !!draft.verificationConsent,
          promotionalConsent: !!draft.promotionalConsent,
          conflictDisclosure: draft.conflictDisclosure || '',
          submissionFeeAcknowledged: !!draft.submissionFeeAcknowledged,
        });
        setCurrentStep(Math.min(Math.max(draft.completedStep || 0, 0), steps.length - 1));
      } catch (e) {
        toast.error(getApiErrorMessage(e, 'Failed to load draft application.'));
        navigate('/dashboard');
      } finally {
        setLoadingDraft(false);
      }
    };

    fetchDraft();
  }, [candidateRegistrationNumber, draftQueryId, navigate, reset]);

  const buildPayload = (values, completedStep = Math.min(currentStep + 1, steps.length)) => {
    const payload = {
      organisationName: values.organisationName,
      organizationName: values.organisationName,
      registrationNumber: candidateRegistrationNumber,
      sectorIndustry: values.sectorIndustry,
      organisationSize: values.organisationSize,
      primaryContactName: values.primaryContactName,
      primaryContactDesignation: values.primaryContactDesignation,
      primaryContactEmail: values.primaryContactEmail,
      primaryContactPhone: values.primaryContactPhone,
      websiteLinkedIn: values.websiteLinkedIn,
      projectTitle: values.projectTitle,
      tagline: values.tagline,
      problemStatement: values.problemStatement,
      solution: values.solution,
      deploymentStatus: values.deploymentStatus,
      customerReferenceRevenue: values.customerReferenceRevenue,
      innovationOriginality: values.innovationOriginality,
      measurableImpact: values.measurableImpact,
      technicalExcellence: values.technicalExcellence,
      responsibleAI: values.responsibleAI,
      scalabilitySustainability: values.scalabilitySustainability,
      executionEvidence: values.executionEvidence,
      innovationDetails: values.innovationOriginality,
      impactDetails: values.measurableImpact,
      aiTechnologies: values.technicalExcellence,
      projectUrl: values.projectUrl,
      demoVideoUrl: values.demoVideoUrl,
      testimonialOne: values.testimonialOne,
      testimonialTwo: values.testimonialTwo,
      nationalRelevance: values.nationalRelevance,
      eligibilityAnswers: [{
        question: 'I confirm this entry meets the eligibility criteria for the selected category.',
        answer: !!values.categoryEligibilityConfirmed,
      }],
      isEligible: !!values.categoryEligibilityConfirmed,
      categoryEligibilityConfirmed: !!values.categoryEligibilityConfirmed,
      declarationAccepted: !!values.declarationAccepted,
      verificationConsent: !!values.verificationConsent,
      promotionalConsent: !!values.promotionalConsent,
      conflictDisclosure: values.conflictDisclosure,
      submissionFeeAcknowledged: !!values.submissionFeeAcknowledged,
      completedStep,
    };

    if (values.categoryId) payload.categoryId = values.categoryId;
    if (values.launchDate) payload.launchDate = values.launchDate;

    return payload;
  };

  const ensureDraft = async (values = getValues()) => {
    if (draftId) return draftId;
    const { data } = await applicationService.createDraft(buildPayload(values, currentStep));
    const id = data.data.application._id;
    setDraftId(id);
    return id;
  };

  const validateStep = (values) => {
    if (currentStep === 0) {
      const required = [
        ['organisationName', 'Organisation/Individual name'],
        ['sectorIndustry', 'Sector/Industry'],
        ['organisationSize', 'Organisation size'],
        ['primaryContactName', 'Primary contact name'],
        ['primaryContactDesignation', 'Designation'],
        ['primaryContactEmail', 'Email'],
        ['primaryContactPhone', 'Phone'],
      ];
      const missing = required.find(([field]) => !values[field]);
      if (missing) return { field: missing[0], message: `Please fill in ${missing[1]}.` };
    }
    if (currentStep === 1) {
      if (!values.categoryId || !categories.some(category => category._id === values.categoryId)) {
        return { field: 'categoryId', message: 'Please select a valid award category.' };
      }
      if (!values.categoryEligibilityConfirmed) {
        return { field: 'categoryEligibilityConfirmed', message: 'Please confirm this entry meets the selected category eligibility criteria.' };
      }
    }
    if (currentStep === 2) {
      const required = [
        ['projectTitle', 'Solution/Project name'],
        ['tagline', 'One-line summary'],
        ['problemStatement', 'Problem statement'],
        ['solution', 'Solution description'],
        ['deploymentStatus', 'Deployment status'],
        ['launchDate', 'Date of launch'],
      ];
      const missing = required.find(([field]) => !values[field]);
      if (missing) return { field: missing[0], message: `Please fill in ${missing[1]}.` };
      if (countWords(values.tagline) > 25) return { field: 'tagline', message: 'One-line summary must be 25 words or fewer.' };
      if (countWords(values.problemStatement) > 300) return { field: 'problemStatement', message: 'Problem statement must be 300 words or fewer.' };
      if (countWords(values.solution) > 500) return { field: 'solution', message: 'Solution description must be 500 words or fewer.' };
    }
    if (currentStep === 3) {
      const missing = judgingCriteria.find(([key]) => !values[key]);
      if (missing) return { field: missing[0], message: `Please fill in ${missing[1]} evidence.` };
    }
    if (currentStep === 5 && !values.nationalRelevance) {
      return { field: 'nationalRelevance', message: 'Please describe the Sri Lanka-specific national relevance.' };
    }
    return null;
  };

  const handleNext = async () => {
    if (applicationDeadlinePassed) {
      toast.error(`Applications can no longer be edited after the ${APPLICATION_DEADLINE_LABEL} deadline.`);
      navigate('/dashboard?tab=drafts');
      return;
    }

    const values = getValues();
    const validationError = validateStep(values);
    if (validationError) {
      setFieldErrors({ [validationError.field]: validationError.message });
      toast.error(validationError.message);
      return;
    }

    try {
      setFieldErrors({});
      const id = await ensureDraft(values);
      await applicationService.updateDraft(id, buildPayload(values));
      setCurrentStep(step => step + 1);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to save application progress.'));
    }
  };

  const handleSaveDraft = async () => {
    if (applicationDeadlinePassed) {
      toast.error(`Applications can no longer be edited after the ${APPLICATION_DEADLINE_LABEL} deadline.`);
      navigate('/dashboard?tab=drafts');
      return;
    }

    const values = getValues();

    try {
      setSavingDraft(true);
      setFieldErrors({});
      const id = await ensureDraft(values);
      await applicationService.updateDraft(id, buildPayload(values, currentStep));
      toast.success('Draft saved successfully.');
      navigate('/dashboard?tab=drafts');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to save draft.'));
    } finally {
      setSavingDraft(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (applicationDeadlinePassed) {
      toast.error(`Documents can no longer be edited after the ${APPLICATION_DEADLINE_LABEL} deadline.`);
      e.target.value = '';
      return;
    }

    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (uploadedFiles.length + files.length > 2) {
      toast.error('Upload a maximum of 2 PDF documents.');
      e.target.value = '';
      return;
    }
    if (files.some(file => file.type !== 'application/pdf')) {
      toast.error('Only PDF documents are allowed.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const id = await ensureDraft();
      const formData = new FormData();
      files.forEach(file => formData.append('documents', file));
      const { data } = await applicationService.uploadDocuments(id, formData);
      setUploadedFiles(data.data.documents);
      toast.success('Document uploaded successfully.');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to upload documents.'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFileDelete = async (docId) => {
    if (applicationDeadlinePassed) {
      toast.error(`Documents can no longer be edited after the ${APPLICATION_DEADLINE_LABEL} deadline.`);
      return;
    }

    try {
      await applicationService.deleteDocument(draftId, docId);
      setUploadedFiles(files => files.filter(file => file._id !== docId));
      toast.success('Document removed.');
    } catch {
      toast.error('Failed to remove document.');
    }
  };

  const onSubmit = async () => {
    if (applicationDeadlinePassed) {
      toast.error(`Applications can no longer be submitted after the ${APPLICATION_DEADLINE_LABEL} deadline.`);
      navigate('/dashboard?tab=drafts');
      return;
    }

    const values = getValues();
    const requiredConsents = values.declarationAccepted && values.verificationConsent && values.promotionalConsent && values.submissionFeeAcknowledged;
    if (!requiredConsents) {
      setFieldErrors({
        declarationAccepted: !values.declarationAccepted ? 'Please confirm the accuracy of the information provided.' : '',
        verificationConsent: !values.verificationConsent ? 'Please provide consent for verification if shortlisted.' : '',
        promotionalConsent: !values.promotionalConsent ? 'Please provide promotional consent.' : '',
        submissionFeeAcknowledged: !values.submissionFeeAcknowledged ? 'Please acknowledge the submission fee requirement.' : '',
      });
      toast.error('Please complete all required declarations and consents.');
      return;
    }

    try {
      setFieldErrors({});
      const id = await ensureDraft();
      await applicationService.updateDraft(id, buildPayload({ ...values, declarationAccepted: true }));
      await applicationService.submitApplication(id);
      toast.success('Application submitted successfully!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to submit application.'));
    }
  };

  const inputClass = 'input-field';
  const textareaClass = 'input-field resize-none min-h-[116px]';
  const fieldClass = (field, base = inputClass) => `${base} ${fieldErrors[field] ? '!border-red-400 focus:!border-red-400 focus:!shadow-none' : ''}`;

  return (
    <div className="min-h-screen bg-navy-950 pt-28 pb-20">
      <div className="section-container max-w-5xl">
        <div className="mb-10 text-center">
          <span className="badge-accent mb-4">Candidate Application</span>
          <h1 className="font-display font-black text-3xl text-white">{draftId ? 'Edit Draft Submission' : 'National AI Awards 2026 Submission'}</h1>
          <p className="text-slate-400 text-sm mt-2">One submission per primary award category. Multiple categories require separate entries.</p>
        </div>

        {loadingDraft ? (
          <div className="glass-card p-10 !hover:transform-none flex justify-center">
            <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applicationDeadlinePassed ? (
          <div className="glass-card p-8 sm:p-10 !hover:transform-none text-center">
            <h2 className="font-display font-bold text-white text-2xl">Applications Closed</h2>
            <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
              The application deadline was {APPLICATION_DEADLINE_LABEL}. Drafts are now locked and can no longer be edited or submitted.
            </p>
            <Button variant="primary" className="mt-6 text-xs" onClick={() => navigate('/dashboard?tab=drafts')}>
              Back to Edit Draft
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-10 overflow-x-auto pb-2">
              <div className="min-w-[720px] flex justify-between items-center relative">
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-white/5 z-0" />
                <div
                  className="absolute left-0 top-5 h-0.5 bg-gradient-accent transition-all duration-300 z-0"
                  style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                />
                {steps.map((step, idx) => (
                  <div key={step.label} className="relative z-10 flex flex-col items-center w-24">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm border-2 transition-all ${
                      idx < currentStep
                        ? 'bg-accent-500 border-accent-500 text-white shadow-glow'
                        : idx === currentStep
                          ? 'bg-navy-900 border-accent-500 text-accent-400 shadow-glow'
                          : 'bg-navy-900 border-white/10 text-slate-500'
                    }`}>
                      {idx < currentStep ? <RiCheckLine size={18} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${idx === currentStep ? 'text-accent-400' : 'text-slate-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 sm:p-8 !hover:transform-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section A: Applicant & Organisation Details</h3>
                        <p className="text-slate-400 text-xs mt-1">Provide the applicant details and authorised contact for this entry.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><FieldLabel required>Organisation/Individual name</FieldLabel><input className={fieldClass('organisationName')} {...register('organisationName')} /><FieldError message={fieldErrors.organisationName} /></div>
                        <div>
                          <FieldLabel>Registration number</FieldLabel>
                          <input
                            className={`${inputClass} cursor-not-allowed bg-white/3 text-slate-300`}
                            readOnly
                            aria-readonly="true"
                            {...register('registrationNumber')}
                          />
                          <p className="mt-1 text-[11px] text-slate-500">Automatically assigned to your candidate account.</p>
                        </div>
                        <div><FieldLabel required>Sector/Industry</FieldLabel><input className={fieldClass('sectorIndustry')} {...register('sectorIndustry')} /><FieldError message={fieldErrors.sectorIndustry} /></div>
                        <div>
                          <FieldLabel required>Organisation size</FieldLabel>
                          <select className={fieldClass('organisationSize')} {...register('organisationSize')}>
                            <option value="">Select size...</option>
                            {organisationSizes.map(size => <option key={size} value={size} className="bg-navy-950">{size}</option>)}
                          </select>
                          <FieldError message={fieldErrors.organisationSize} />
                        </div>
                        <div><FieldLabel required>Primary contact name</FieldLabel><input className={fieldClass('primaryContactName')} {...register('primaryContactName')} /><FieldError message={fieldErrors.primaryContactName} /></div>
                        <div><FieldLabel required>Designation</FieldLabel><input className={fieldClass('primaryContactDesignation')} {...register('primaryContactDesignation')} /><FieldError message={fieldErrors.primaryContactDesignation} /></div>
                        <div><FieldLabel required>Email</FieldLabel><input type="email" className={fieldClass('primaryContactEmail')} {...register('primaryContactEmail')} /><FieldError message={fieldErrors.primaryContactEmail} /></div>
                        <div><FieldLabel required>Phone</FieldLabel><input className={fieldClass('primaryContactPhone')} {...register('primaryContactPhone')} /><FieldError message={fieldErrors.primaryContactPhone} /></div>
                        <div><FieldLabel>Website/LinkedIn</FieldLabel><input className={inputClass} placeholder="https://..." {...register('websiteLinkedIn')} /></div>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section B: Award Category Selection</h3>
                        <p className="text-slate-400 text-xs mt-1">Select one primary award category for this submission.</p>
                      </div>
                      <div>
                        <FieldLabel required>Award category</FieldLabel>
                        <select className={fieldClass('categoryId')} {...register('categoryId')}>
                          <option value="">Choose category...</option>
                          {categories.map(category => <option key={category._id} value={category._id} className="bg-navy-950">{category.name}</option>)}
                        </select>
                        <FieldError message={fieldErrors.categoryId} />
                        {categories.length === 0 && <p className="mt-2 text-xs text-amber-300">No active award categories are available. Please ask an administrator to seed or activate categories.</p>}
                      </div>
                      {selectedCategory && (
                        <div className="rounded-xl bg-accent-500/5 border border-accent-500/20 p-4">
                          <h4 className="text-accent-400 text-xs font-bold uppercase tracking-wider">Category Focus</h4>
                          <p className="text-slate-300 text-xs mt-1 leading-relaxed">{selectedCategory.description}</p>
                        </div>
                      )}
                      <label className={`flex gap-3 p-4 rounded-xl bg-white/5 border ${fieldErrors.categoryEligibilityConfirmed ? 'border-red-400' : 'border-white/5'}`}>
                        <input type="checkbox" className="w-5 h-5 accent-accent-500 mt-0.5" {...register('categoryEligibilityConfirmed')} />
                        <span className="text-slate-300 text-sm leading-relaxed">I confirm this entry meets the eligibility criteria for the selected category.</span>
                      </label>
                      <FieldError message={fieldErrors.categoryEligibilityConfirmed} />
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section C: Solution Overview</h3>
                        <p className="text-slate-400 text-xs mt-1">The core narrative used for screening and shortlist announcements.</p>
                      </div>
                      <div><FieldLabel required>Solution/Project name</FieldLabel><input className={fieldClass('projectTitle')} {...register('projectTitle')} /><FieldError message={fieldErrors.projectTitle} /></div>
                      <div><FieldLabel required>One-line summary</FieldLabel><input className={fieldClass('tagline')} placeholder="25 words or fewer" {...register('tagline')} /><WordHint value={watched.tagline} max={25} /><FieldError message={fieldErrors.tagline} /></div>
                      <div><FieldLabel required>Problem statement</FieldLabel><textarea className={fieldClass('problemStatement', textareaClass)} placeholder="What challenge does this solve?" {...register('problemStatement')} /><WordHint value={watched.problemStatement} max={300} /><FieldError message={fieldErrors.problemStatement} /></div>
                      <div><FieldLabel required>Solution description</FieldLabel><textarea className={fieldClass('solution', 'input-field resize-none min-h-[160px]')} placeholder="How does it work, and what AI/ML techniques are used?" {...register('solution')} /><WordHint value={watched.solution} max={500} /><FieldError message={fieldErrors.solution} /></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                          <FieldLabel required>Deployment status</FieldLabel>
                          <select className={fieldClass('deploymentStatus')} {...register('deploymentStatus')}>
                            <option value="">Select status...</option>
                            {deploymentStatuses.map(status => <option key={status} value={status} className="bg-navy-950">{status}</option>)}
                          </select>
                          <FieldError message={fieldErrors.deploymentStatus} />
                        </div>
                        <div><FieldLabel required>Date of launch</FieldLabel><input type="date" className={fieldClass('launchDate')} {...register('launchDate')} /><FieldError message={fieldErrors.launchDate} /></div>
                        <div><FieldLabel>Customer reference/revenue</FieldLabel><input className={inputClass} {...register('customerReferenceRevenue')} /></div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section D: Evidence Against Judging Criteria</h3>
                        <p className="text-slate-400 text-xs mt-1">Judges score directly against these weighted criteria.</p>
                      </div>
                      {judgingCriteria.map(([key, label, weight, prompt]) => (
                        <div key={key} className="rounded-xl bg-white/5 border border-white/5 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h4 className="text-white text-sm font-bold">{label}</h4>
                            <span className="badge-accent w-fit">{weight}%</span>
                          </div>
                          <FieldLabel required>{prompt}</FieldLabel>
                          <textarea className={fieldClass(key, textareaClass)} {...register(key)} />
                          <FieldError message={fieldErrors[key]} />
                        </div>
                      ))}
                    </div>
                  )}

                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section E: Supporting Materials</h3>
                        <p className="text-slate-400 text-xs mt-1">Keep evidence concise and comparable across applicants.</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><FieldLabel>External URL</FieldLabel><input className={inputClass} placeholder="One live demo, product page, or video URL" {...register('projectUrl')} /></div>
                        <div><FieldLabel>Optional demo video link</FieldLabel><input className={inputClass} placeholder="YouTube/Vimeo, 2-3 minutes" {...register('demoVideoUrl')} /></div>
                        <div><FieldLabel>Testimonial/client reference 1</FieldLabel><input className={inputClass} {...register('testimonialOne')} /></div>
                        <div><FieldLabel>Testimonial/client reference 2</FieldLabel><input className={inputClass} {...register('testimonialTwo')} /></div>
                      </div>
                      <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/5 relative">
                        <input type="file" multiple accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading || uploadedFiles.length >= 2} />
                        <div className="flex flex-col items-center">
                          <RiUploadCloud2Line className="text-accent-400 text-4xl mb-3" />
                          <h4 className="font-display font-semibold text-white text-sm mb-1">{uploading ? 'Uploading...' : 'Upload up to 2 PDF documents'}</h4>
                          <p className="text-slate-500 text-xs">Suggested cap: 5 pages each, max 10MB per file.</p>
                        </div>
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-white text-xs font-bold uppercase tracking-wider">Uploaded Documents</h4>
                          {uploadedFiles.map(file => (
                            <div key={file._id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                              <div className="flex items-center gap-2 truncate"><RiFileTextLine className="text-accent-400 text-lg shrink-0" /><span className="truncate">{file.originalName}</span></div>
                              <button type="button" onClick={() => handleFileDelete(file._id)} className="p-1 rounded hover:bg-red-500/10 text-red-400" aria-label="Remove document"><RiCloseLine size={16} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section F: National Relevance</h3>
                        <p className="text-slate-400 text-xs mt-1">Describe the Sri Lanka-specific need, local language support, or national development relevance.</p>
                      </div>
                      <textarea className={fieldClass('nationalRelevance', 'input-field resize-none min-h-[180px]')} placeholder="How does this solution address Sinhala/Tamil support, local market needs, or national development goals?" {...register('nationalRelevance')} />
                      <FieldError message={fieldErrors.nationalRelevance} />
                    </div>
                  )}

                  {currentStep === 6 && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-display font-bold text-white text-lg">Section G: Declarations & Consent</h3>
                        <p className="text-slate-400 text-xs mt-1">Confirm authority, accuracy, verification consent, and conflict disclosure before final submission.</p>
                      </div>
                      <div className="rounded-2xl bg-white/5 border border-white/5 p-5 space-y-4">
                        {[
                          ['declarationAccepted', 'I confirm the accuracy of all information provided in this application.'],
                          ['verificationConsent', 'I consent to a site visit or demo verification if shortlisted.'],
                          ['promotionalConsent', 'I consent to be featured in promotional materials if shortlisted or winning.'],
                          ['submissionFeeAcknowledged', 'I acknowledge the submission fee requirements for this entry.'],
                        ].map(([field, label]) => (
                          <div key={field}>
                            <label className={`flex gap-3 rounded-xl border p-3 ${fieldErrors[field] ? 'border-red-400 bg-red-500/5' : 'border-transparent'}`}>
                              <input type="checkbox" className="w-5 h-5 accent-accent-500 mt-0.5" {...register(field)} />
                              <span className="text-slate-300 text-sm leading-relaxed">{label}</span>
                            </label>
                            <FieldError message={fieldErrors[field]} />
                          </div>
                        ))}
                      </div>
                      <div><FieldLabel>Conflict of interest disclosure</FieldLabel><textarea className={textareaClass} placeholder="Declare any judge affiliation, committee relationship, or write N/A." {...register('conflictDisclosure')} /></div>
                      <div className="rounded-xl bg-accent-500/5 border border-accent-500/20 p-4 flex gap-3">
                        <RiShieldCheckLine className="text-accent-400 text-xl shrink-0 mt-0.5" />
                        <p className="text-slate-300 text-xs leading-relaxed">Once submitted, this candidate application enters the review workflow and cannot be modified from the portal.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row justify-between gap-3 border-t border-white/10 mt-8 pt-6">
                <button type="button" onClick={() => setCurrentStep(step => step - 1)} disabled={currentStep === 0} className="btn-ghost !px-4 !py-2 text-xs flex items-center gap-1.5" style={currentStep === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                  <RiArrowLeftLine /> Previous
                </button>
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button variant="ghost" className="text-xs !px-4 !py-2" onClick={handleSaveDraft} loading={savingDraft}>
                    Save Draft <RiSave3Line />
                  </Button>
                  {currentStep < steps.length - 1 ? (
                    <Button variant="primary" className="text-xs" onClick={handleNext}>Save & Continue <RiArrowRightLine /></Button>
                  ) : (
                    <Button variant="gold" className="text-xs" onClick={handleSubmit(onSubmit)}>Submit Application <RiCheckLine /></Button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewApplication;
