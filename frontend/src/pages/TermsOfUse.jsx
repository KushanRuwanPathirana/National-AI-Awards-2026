import { motion } from 'framer-motion';

const TermsOfUse = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using the National AI Awards Sri Lanka 2026 portal, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, please do not use the platform.',
    },
    {
      title: '2. User Registration & Account Security',
      content: 'To submit applications or access specific features, you must register for an account. You agree to:\n\n• Provide accurate, current, and complete information.\n• Maintain the confidentiality of your account credentials.\n• Notify us immediately of any unauthorized access to or use of your account.',
    },
    {
      title: '3. Application Submission Guidelines',
      content: 'All applications must be submitted within the official timelines. Submissions must:\n\n• Be the original work of the applicant or applicant organization.\n• Not infringe on any third-party intellectual property or confidentiality agreements.\n• Accurately represent the AI technology, capabilities, and evidence of implementation.\n• Complete payment slip upload for paid categories (standard submissions) or apply for the free University AI Innovation category.',
    },
    {
      title: '4. Evaluation & Judging Integrity',
      content: 'The judging panel is independent. Judges score submissions based on set criteria. Scoring processes, dynamic averages, and progress statuses visible inside dashboards are managed in accordance with structural guidelines. The decision of the judging panel is final and binding.',
    },
    {
      title: '5. Intellectual Property Rights',
      content: 'The portal, including its code, design templates, and workflow indicators, is owned by the National AI Awards team. Applicants retain all intellectual property rights to their individual project submission contents and source materials.',
    },
    {
      title: '6. Limitation of Liability',
      content: 'Under no circumstances shall the organizers or portal administrators be liable for any direct, indirect, incidental, or consequential damages resulting from the use of, or inability to use, the platform or evaluation outcomes.',
    },
    {
      title: '7. Amendments to Terms',
      content: 'We reserve the right to modify these Terms of Use at any time. Continued use of the portal after amendments indicates your acceptance of the updated terms.',
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="section-container relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="badge-accent mb-6 inline-flex"
          >
            Terms & Conditions
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            Terms of Use
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-sm max-w-lg mx-auto mt-4 leading-relaxed"
          >
            Please read these terms carefully before utilizing our portal, submitting applications, or evaluating projects.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="pb-28">
        <div className="section-container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="glass-card p-8 sm:p-12 space-y-10 !hover:transform-none"
          >
            <div className="text-slate-400 text-xs leading-relaxed">
              Last updated: July 9, 2026
            </div>

            <div className="divider-glow" />

            <div className="space-y-8">
              {sections.map((section, idx) => (
                <div key={idx} className="space-y-3">
                  <h3 className="text-white text-lg font-bold font-display tracking-wide">
                    {section.title}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="divider-glow pt-6" />

            <div className="text-center text-slate-500 text-xs">
              National AI Awards Sri Lanka © 2026. All rights reserved.
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfUse;
