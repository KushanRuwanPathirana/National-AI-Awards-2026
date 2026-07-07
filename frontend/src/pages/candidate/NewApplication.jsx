import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  RiAwardLine, RiArrowRightLine, RiArrowLeftLine, RiUploadCloud2Line,
  RiCheckLine, RiFileList3Line, RiShieldLine, RiFileTextLine, RiCloseLine,
} from 'react-icons/ri';
import Button from '../../components/shared/Button';
import categoryService from '../../services/category.service';
import applicationService from '../../services/application.service';

const steps = [
  { label: 'Category & Title' },
  { label: 'Eligibility' },
  { label: 'Project Info' },
  { label: 'Documents' },
  { label: 'Declaration' },
];

const NewApplication = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [draftId, setDraftId] = useState(null);

  // Files
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm({
    defaultValues: {
      categoryId: '',
      projectTitle: '',
      tagline: '',
      problemStatement: '',
      solution: '',
      aiTechnologies: '',
      innovationDetails: '',
      impactDetails: '',
      teamSize: 1,
      teamMembers: '',
      projectUrl: '',
      organizationName: '',
      projectStartYear: new Date().getFullYear(),
      declarationAccepted: false,
    },
  });

  const categoryId = watch('categoryId');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await categoryService.getCategories();
        setCategories(data.data.categories);
      } catch (e) {
        toast.error('Failed to load award categories.');
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSelectedCategory(null);
      return;
    }

    // Prefer API-backed category when available
    const apiCat = categories.find(c => c._id === categoryId);
    if (apiCat) {
      setSelectedCategory(apiCat);
      return;
    }

    setSelectedCategory(null);
  }, [categoryId, categories]);

  const handleNext = async () => {
    const values = getValues();

    if (currentStep === 0) {
      if (!values.categoryId || !values.projectTitle) {
        toast.error('Please select a category and fill project title.');
        return;
      }
      if (!categories.some(c => c._id === values.categoryId)) {
        toast.error('Please select a valid award category from the list.');
        return;
      }

      // Create draft if not exists, or update
      try {
        if (!draftId) {
          const { data } = await applicationService.createDraft({
            categoryId: values.categoryId,
            projectTitle: values.projectTitle,
            tagline: values.tagline,
          });
          setDraftId(data.data.application._id);
        } else {
          await applicationService.updateDraft(draftId, {
            projectTitle: values.projectTitle,
            tagline: values.tagline,
          });
        }
      } catch (e) {
        toast.error('Failed to save draft progress.');
        return;
      }
    }

    if (currentStep === 1) {
      // Check eligibility answers
      const eligibleQuestions = selectedCategory?.eligibilityQuestions || [];
      const answers = eligibleQuestions.map((q, idx) => {
        const checked = document.getElementById(`eligibility-${idx}`)?.checked;
        return { question: q.question, answer: !!checked };
      });

      const failedAny = answers.some((a, idx) => a.answer !== selectedCategory.eligibilityQuestions[idx].requiredAnswer);
      if (failedAny) {
        toast.error('Your solution does not meet the eligibility criteria for this category.');
        return;
      }

      try {
        await applicationService.updateDraft(draftId, {
          eligibilityAnswers: answers,
          isEligible: true,
        });
      } catch (e) {
        toast.error('Error saving eligibility answers.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!values.problemStatement || !values.solution) {
        toast.error('Problem statement and solution description are required.');
        return;
      }
      try {
        await applicationService.updateDraft(draftId, {
          problemStatement: values.problemStatement,
          solution: values.solution,
          aiTechnologies: values.aiTechnologies,
          innovationDetails: values.innovationDetails,
          impactDetails: values.impactDetails,
          teamSize: values.teamSize,
          teamMembers: values.teamMembers,
          projectUrl: values.projectUrl,
          organizationName: values.organizationName,
          projectStartYear: values.projectStartYear,
        });
      } catch (e) {
        toast.error('Error saving project description.');
        return;
      }
    }

    if (currentStep === 3) {
      if (uploadedFiles.length === 0) {
        toast.error('Please upload at least one project document.');
        return;
      }
    }

    setCurrentStep(s => s + 1);
  };

  const handlePrev = () => {
    setCurrentStep(s => s - 1);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(f => formData.append('documents', f));

    setUploading(true);
    try {
      const { data } = await applicationService.uploadDocuments(draftId, formData);
      setUploadedFiles(data.data.documents);
      toast.success('Documents uploaded successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload documents.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (docId) => {
    try {
      await applicationService.deleteDocument(draftId, docId);
      setUploadedFiles(files => files.filter(f => f._id !== docId));
      toast.success('Document removed.');
    } catch {
      toast.error('Failed to remove document.');
    }
  };

  const onSubmit = async () => {
    const values = getValues();
    if (!values.declarationAccepted) {
      toast.error('You must accept the declaration to submit your entry.');
      return;
    }

    try {
      await applicationService.updateDraft(draftId, {
        declarationAccepted: true,
      });
      await applicationService.submitApplication(draftId);
      toast.success('Application submitted successfully!');
      navigate('/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit application.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 pt-28 pb-20">
      <div className="section-container max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-display font-black text-3xl text-white">Start Nomination</h1>
          <p className="text-slate-400 text-sm mt-2">National AI Awards Sri Lanka 2026</p>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-10 relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/5 z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-accent transition-all duration-300 z-0"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm border-2 transition-all duration-300 ${
                  idx < currentStep
                    ? 'bg-accent-500 border-accent-500 text-white shadow-glow'
                    : idx === currentStep
                    ? 'bg-navy-900 border-accent-500 text-accent-400 shadow-glow'
                    : 'bg-navy-900 border-white/10 text-slate-500'
                }`}
              >
                {idx < currentStep ? <RiCheckLine size={18} /> : idx + 1}
              </div>
              <span className={`text-[10px] mt-2 font-medium tracking-wider uppercase hidden sm:block ${
                idx === currentStep ? 'text-accent-400 font-bold' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="glass-card p-8 !hover:transform-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 1: CATEGORY & TITLE */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">Award Category</h3>
                    <p className="text-slate-400 text-xs mb-4">Select the award category that best matches your solution.</p>
                    <select
                      className="input-field"
                      {...register('categoryId', { required: 'Please select a category' })}
                    >
                      <option value="">Choose category...</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id} className="bg-navy-950">
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="mt-2 text-xs text-amber-300">
                        No active award categories are available. Please ask an administrator to seed or activate categories.
                      </p>
                    )}
                  </div>

                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-accent-500/5 border border-accent-500/20"
                    >
                      <h4 className="text-accent-400 text-xs font-bold uppercase tracking-wider">Category Focus</h4>
                      <p className="text-slate-300 text-xs mt-1 leading-relaxed">{selectedCategory.description}</p>
                    </motion.div>
                  )}

                  <div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">Project / Innovation Title</h3>
                    <p className="text-slate-400 text-xs mb-4">Provide the formal name of your AI product, project, or startup.</p>
                    <input
                      className="input-field"
                      placeholder="e.g. HealthAI Diagnostics System"
                      {...register('projectTitle', { required: 'Project title is required' })}
                    />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-white text-lg mb-2">One-Line Tagline</h3>
                    <p className="text-slate-400 text-xs mb-4">Summarize your innovation in a single punchy sentence.</p>
                    <input
                      className="input-field"
                      placeholder="e.g. Next-generation cancer screening using deep learning neural networks"
                      {...register('tagline')}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: ELIGIBILITY */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-white text-lg mb-2">Eligibility Screening Questionnaire</h3>
                  <p className="text-slate-400 text-xs mb-6">You must meet the fundamental criteria to apply under the category: <strong className="text-accent-400">{selectedCategory?.name}</strong>.</p>

                  <div className="space-y-4">
                    {selectedCategory?.eligibilityQuestions?.map((q, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <input
                          type="checkbox"
                          id={`eligibility-${idx}`}
                          className="w-5 h-5 accent-accent-500 mt-0.5 rounded border-white/10"
                        />
                        <label htmlFor={`eligibility-${idx}`} className="text-slate-300 text-sm leading-relaxed">
                          {q.question} <span className="text-red-400">*</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: DETAILED FORM */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-white text-lg">Project Details</h3>
                  <p className="text-slate-400 text-xs mb-6">Describe the architecture, innovation, and direct impact of your entry.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Problem Statement *</label>
                      <textarea
                        className="input-field h-28 resize-none"
                        placeholder="What critical challenge or business problem does your project solve?"
                        {...register('problemStatement', { required: 'Required' })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">AI Solution & Technical Details *</label>
                      <textarea
                        className="input-field h-28 resize-none"
                        placeholder="Detail your AI models, data pipelines, tools, and technical implementation."
                        {...register('solution', { required: 'Required' })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">What makes this solution innovative?</label>
                      <textarea
                        className="input-field h-20 resize-none"
                        placeholder="Explain any novel techniques, algorithms, or unique value propositions."
                        {...register('innovationDetails')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Impact & Practical Results</label>
                      <textarea
                        className="input-field h-20 resize-none"
                        placeholder="Provide concrete numbers: efficiency gains, lives impacted, revenue, or performance improvements."
                        {...register('impactDetails')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">AI Technologies Used</label>
                      <input
                        className="input-field"
                        placeholder="e.g. PyTorch, CNN, LLM, OpenCV"
                        {...register('aiTechnologies')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Demo/Project URL</label>
                      <input
                        className="input-field"
                        placeholder="https://github.com/myproject"
                        {...register('projectUrl')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Organization / Company</label>
                      <input
                        className="input-field"
                        placeholder="Company or University name"
                        {...register('organizationName')}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5 font-medium">Core Team Size</label>
                      <input
                        type="number"
                        className="input-field"
                        min={1}
                        {...register('teamSize')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENTS */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-white text-lg">Documents Upload</h3>
                  <p className="text-slate-400 text-xs mb-6">Attach files supporting your project (Technical Spec, Pitch Deck, PDFs, Images). Max 10MB per file.</p>

                  <div className="border border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/5 relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center">
                      <RiUploadCloud2Line className="text-accent-400 text-4xl mb-3" />
                      <h4 className="font-display font-semibold text-white text-sm mb-1">
                        {uploading ? 'Uploading Files...' : 'Drag & Drop files or click to browse'}
                      </h4>
                      <p className="text-slate-500 text-xs">PDF, JPG, PNG, and DOCX allowed (up to 5 files)</p>
                    </div>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2 mt-6">
                      <h4 className="text-white text-xs font-bold uppercase tracking-wider">Uploaded Documents</h4>
                      {uploadedFiles.map(f => (
                        <div key={f._id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                          <div className="flex items-center gap-2 truncate">
                            <RiFileTextLine className="text-accent-400 text-lg shrink-0" />
                            <span className="truncate">{f.originalName}</span>
                          </div>
                          <button
                            onClick={() => handleFileDelete(f._id)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-400"
                          >
                            <RiCloseLine size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: DECLARATION */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-white text-lg">Declaration & Consent</h3>
                  <p className="text-slate-400 text-xs mb-6">Please read and accept the terms of the National AI Awards panel.</p>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-slate-300 text-xs leading-relaxed space-y-4 max-h-60 overflow-y-auto">
                    <p>I hereby declare that the information provided in this application is true, accurate, and complete to the best of my knowledge.</p>
                    <p>I confirm that the technology presented is our team's original creation and does not infringe upon any intellectual property rights of any third party.</p>
                    <p>I consent to the evaluation of this submission by the assigned judging panel and understand that their decisions are final and binding.</p>
                  </div>

                  <div className="flex gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <input
                      type="checkbox"
                      id="declare-check"
                      className="w-5 h-5 accent-accent-500 mt-0.5"
                      {...register('declarationAccepted')}
                    />
                    <label htmlFor="declare-check" className="text-slate-300 text-sm leading-relaxed">
                      I accept the declaration and submit my application. <span className="text-red-400">*</span>
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="flex justify-between items-center border-t border-white/10 mt-8 pt-6">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="btn-ghost !px-4 !py-2 text-xs flex items-center gap-1.5"
              style={currentStep === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              <RiArrowLeftLine /> Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <Button variant="primary" className="text-xs" onClick={handleNext}>
                Next Step <RiArrowRightLine />
              </Button>
            ) : (
              <Button variant="gold" className="text-xs" onClick={onSubmit}>
                Submit Application <RiCheckLine />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewApplication;
