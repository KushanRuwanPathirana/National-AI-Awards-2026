import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RiAddLine, RiSubtractLine, RiArrowRightLine } from 'react-icons/ri';
import SectionHeader from '../components/shared/SectionHeader';
import Button from '../components/shared/Button';

const faqData = [
  {
    category: 'Eligibility',
    faqs: [
      { q: 'Who can apply for the National AI Awards?', a: 'Any Sri Lankan citizen, permanent resident, or organisation legally incorporated in Sri Lanka with an AI-driven solution is eligible to apply. This includes startups, SMEs, large corporations, research institutions, and academic groups.' },
      { q: 'Do I need to be a technology company to apply?', a: 'No. Organisations from any industry — healthcare, agriculture, finance, education, manufacturing — are welcome. What matters is that your solution meaningfully incorporates Artificial Intelligence.' },
      { q: 'Can individuals apply, or only organisations?', a: 'Both individuals and organisations can apply. Individuals must be Sri Lankan citizens or residents and should have a demonstrable AI project or research body of work.' },
      { q: 'Is there an age restriction for applicants?', a: 'There is no age restriction. We welcome applications from young innovators, students, mid-career professionals, and experienced industry veterans alike.' },
    ],
  },
  {
    category: 'Application Process',
    faqs: [
      { q: 'Is there an application fee?', a: 'No. Applying to the National AI Awards Sri Lanka is completely free of charge. We want to ensure every talented innovator can participate regardless of budget.' },
      { q: 'How do I submit my application?', a: 'Create an account on our portal, complete your applicant profile, choose up to 2 award categories, fill in the application form, and upload supporting documents. You can save drafts and return before the deadline.' },
      { q: 'Can I apply in more than one category?', a: 'Yes, you may apply in up to 2 award categories. Ensure your application is tailored to each category\'s specific criteria. A separate application form must be submitted for each category.' },
      { q: 'What documents do I need to submit?', a: 'Requirements include: a completed application form, a concise project description (max 1000 words), supporting evidence of AI implementation, proof of impact or traction, and optionally a pitch deck or demo video.' },
      { q: 'Can I edit my application after submission?', a: 'Applications can be edited any time before the submission deadline (31 March 2026). After the deadline, submissions are locked for the review process.' },
    ],
  },
  {
    category: 'Judging & Selection',
    faqs: [
      { q: 'How are applications evaluated?', a: 'All submissions are evaluated by a panel of independent expert judges comprising technology leaders, academics, investors, and industry practitioners. Scoring is based on Innovation & Novelty (30%), Real-World Impact (25%), Technical Excellence (20%), Scalability (15%), and Ethical AI Practices (10%).' },
      { q: 'Who are the judges?', a: 'Judges are senior professionals selected for their expertise in AI, technology, and the relevant industry vertical. All judges are required to disclose conflicts of interest and recuse themselves from evaluating any application where a conflict exists.' },
      { q: 'Will shortlisted applicants be notified?', a: 'Yes. All shortlisted applicants will be notified via email and through their portal dashboard by 30 April 2026. Shortlisted candidates will be invited to present before the judging panel in May 2026.' },
      { q: 'Do I need to present in person?', a: 'Shortlisted applicants will be required to make a presentation — either in person at our Colombo venue or via high-quality video link. All finalists are strongly encouraged to attend in person.' },
    ],
  },
  {
    category: 'Awards & Prizes',
    faqs: [
      { q: 'What prizes are awarded?', a: 'Each category winner receives: a cash prize (amount announced in February 2026), a prestigious trophy and certificate, media coverage worth LKR 500,000+, a one-year mentorship package, and access to exclusive investor networking events.' },
      { q: 'Are there prizes for runners-up?', a: 'Yes. In each category, 1st Runner-Up and 2nd Runner-Up positions receive certificates of excellence, media recognition, and discounted access to industry events and training programmes.' },
      { q: 'Where and when is the Awards Ceremony?', a: 'The Grand Awards Ceremony will be held on 25 July 2026 at a prestigious venue in Colombo. The event is attended by government officials, industry leaders, investors, and media.' },
      { q: 'Will the ceremony be livestreamed?', a: 'Yes. The awards ceremony will be livestreamed on our official YouTube channel and social media platforms, enabling friends, families, and supporters worldwide to watch.' },
    ],
  },
];

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className={`glass-card overflow-hidden !hover:transform-none transition-colors duration-200 ${isOpen ? 'border-accent-500/40' : ''}`}>
    <button
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 p-6 text-left"
      aria-expanded={isOpen}
    >
      <span className="font-display font-semibold text-white text-sm leading-snug pr-2">{faq.q}</span>
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
        isOpen ? 'bg-accent-500/30 text-accent-300' : 'bg-white/5 text-slate-400'
      }`}>
        {isOpen ? <RiSubtractLine size={16} /> : <RiAddLine size={16} />}
      </span>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6">
            <div className="divider-glow mb-4" />
            <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQs = () => {
  const [openItems, setOpenItems] = useState({});

  const toggle = (catIdx, faqIdx) => {
    const key = `${catIdx}-${faqIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="section-container relative z-10 text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-accent mb-6 inline-flex">
            Help Centre
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-xl mx-auto"
          >
            Everything you need to know about applying, judging, and winning at the National AI Awards Sri Lanka.
          </motion.p>
        </div>
      </section>

      {/* ── FAQ Sections ── */}
      <section className="section-py">
        <div className="section-container max-w-3xl mx-auto">
          {faqData.map((section, catIdx) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: catIdx * 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full bg-gradient-accent" />
                <h2 className="font-display font-bold text-white text-xl">{section.category}</h2>
              </div>
              <div className="space-y-3">
                {section.faqs.map((faq, faqIdx) => {
                  const key = `${catIdx}-${faqIdx}`;
                  return (
                    <FAQItem
                      key={faq.q}
                      faq={faq}
                      isOpen={!!openItems[key]}
                      onToggle={() => toggle(catIdx, faqIdx)}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Still have questions? ── */}
      <section className="section-py bg-surface-200/50">
        <div className="section-container text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex flex-col items-center gap-6 glass-card p-12 max-w-xl mx-auto">
              <p className="font-display font-bold text-white text-2xl">Still have questions?</p>
              <p className="text-slate-400 text-sm">
                Our team is happy to help. Reach out via the contact form and we'll respond within 1–2 business days.
              </p>
              <Link to="/contact">
                <Button variant="primary">
                  Contact Us <RiArrowRightLine />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;
