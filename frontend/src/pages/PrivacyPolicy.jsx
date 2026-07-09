import { motion } from 'framer-motion';
import SectionHeader from '../components/shared/SectionHeader';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: '1. Introduction',
      content: 'Welcome to the National AI Awards Sri Lanka 2026 portal. We are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, store, and share information when you use our platform, register for the awards, submit an application, or participate in the evaluation process.',
    },
    {
      title: '2. Information We Collect',
      content: 'We collect information you provide directly to us when creating an account, applying, or contacting us. This includes:\n\n• Personal identification information (Name, email address, phone number, and physical address).\n• Professional details (Organization name, designation, and professional background).\n• Project submissions (Project details, descriptions, team members, supporting documents, and payment slips).\n• Evaluation data (Judges\' scorecards, grades, strengths/weaknesses comments, and evaluation logs).',
    },
    {
      title: '3. How We Use Your Information',
      content: 'We use the collected information for purposes including:\n\n• Portal Administration: Managing accounts, authentication, and user access.\n• Award Evaluation: Facilitating application matching, judging processes, score computation, and status progressions.\n• Communication: Sending updates, automated notifications regarding application status changes, and daily reminder alerts to judges.\n• Certificates & Awards: Generating certificates, publishing finalist/winner lists, and printing event details.\n• Support & Safety: Responding to inquiries and logging audit histories for administrative operations.',
    },
    {
      title: '4. Data Protection & Security',
      content: 'We implement robust security measures to safeguard your personal data against unauthorized access, disclosure, alteration, or destruction. All application documents and scorecards are stored securely. Access to confidential submission materials is strictly restricted to assigned judges and authorised system administrators who have signed confidentiality declarations.',
    },
    {
      title: '5. Data Retention',
      content: 'We retain your personal data and award application submissions only for as long as is necessary to fulfill the purposes outlined in this policy, complete the judging workflow for the 2026 event cycle, and meet legal, audit, or record-keeping requirements.',
    },
    {
      title: '6. Your Rights',
      content: 'You have the right to request access to the personal data we hold about you, request corrections to any inaccurate information, and request the deletion of your account/draft submissions. You can manage and edit your application drafts directly through your candidate dashboard prior to the official submission deadline.',
    },
    {
      title: '7. Contact Us',
      content: 'If you have any questions or concerns regarding this Privacy Policy or how your data is handled, please reach out to our support team at info@aiawards.lk or through the contact page.',
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
            Legal & Compliance
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight"
          >
            Privacy Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-sm max-w-lg mx-auto mt-4 leading-relaxed"
          >
            Your trust is paramount. This policy describes how your details and award submissions are securely managed.
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

export default PrivacyPolicy;
