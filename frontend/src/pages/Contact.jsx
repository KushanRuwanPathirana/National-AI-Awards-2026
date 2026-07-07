import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  RiMailLine, RiPhoneLine, RiMapPinLine, RiSendPlane2Line,
  RiCheckLine, RiTimeLine,
} from 'react-icons/ri';
import { FaLinkedin, FaTwitter, FaFacebook } from 'react-icons/fa';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await api.post('/contact', data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none" />
        <div className="section-container relative z-10 text-center">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="badge-accent mb-6 inline-flex">
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display font-black text-5xl sm:text-6xl lg:text-7xl text-white mb-6"
          >
            Contact <span className="gradient-text">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-lg max-w-xl mx-auto"
          >
            Have a question about the awards? Want to become a sponsor? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* ── Contact Grid ── */}
      <section className="section-py">
        <div className="section-container">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Info Panel */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Cards */}
              {[
                { icon: RiMailLine, label: 'Email Us', value: 'info@aiawards.lk', sub: 'Replies within 1–2 business days' },
                { icon: RiPhoneLine, label: 'Call Us', value: '+94 11 234 5678', sub: 'Mon–Fri, 9AM– 5PM' },
                { icon: RiMapPinLine, label: 'Visit Us', value: 'Sri Lanka Telecom PLC,LotusRoad, P.O.Box 503,Colombo 01,Sri Lanka.', sub: 'Head Office' },
              ].map((item) => (
                <div key={item.label} className="glass-card p-6 flex items-start gap-4 !hover:transform-none">
                  <div className="w-11 h-11 rounded-xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
                    <item.icon className="text-accent-400 text-xl" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">{item.label}</p>
                    <p className="text-white font-semibold text-sm">{item.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}

              {/* Office Hours */}
              <div className="glass-card p-6 !hover:transform-none">
                <div className="flex items-center gap-2 mb-4">
                  <RiTimeLine className="text-accent-400" />
                  <p className="text-white font-semibold text-sm">Office Hours</p>
                </div>
                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between"><span>Monday – Friday</span><span className="text-white">9:00 AM – 5:00 PM</span></div>
                  <div className="flex justify-between"><span>Saturday</span><span className="text-white">Closed</span></div>
                  <div className="flex justify-between"><span>Sunday</span><span className="text-slate-600">Closed</span></div>
                </div>
              </div>

              {/* Social Links */}
              <div className="glass-card p-6 !hover:transform-none">
                <p className="text-white font-semibold text-sm mb-4">Follow Us</p>
                <div className="flex gap-3">
                  {[
                    { icon: FaLinkedin, href: '#', label: 'LinkedIn', color: 'hover:bg-blue-600/20 hover:border-blue-500/40 hover:text-blue-400' },
                    { icon: FaTwitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500/20 hover:border-sky-500/40 hover:text-sky-400' },
                    { icon: FaFacebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-700/20 hover:border-blue-700/40 hover:text-blue-500' },
                  ].map(({ icon: Icon, href, label, color }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 transition-all ${color}`}
                    >
                      <Icon size={16} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="glass-card p-8 sm:p-10">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
                      <RiCheckLine className="text-emerald-400 text-4xl" />
                    </div>
                    <h3 className="font-display font-bold text-white text-2xl mb-3">Message Sent!</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      Thank you for reaching out. Our team will respond within 1–2 business days.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="btn-ghost text-sm">
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="font-display font-bold text-white text-2xl mb-2">Send Us a Message</h2>
                    <p className="text-slate-400 text-sm mb-8">Fill in the form below and we'll get back to you shortly.</p>

                    {serverError && (
                      <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        {serverError}
                      </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Full Name *</label>
                          <input
                            id="contact-name"
                            className="input-field"
                            placeholder="Your full name"
                            {...register('name', { required: 'Name is required' })}
                          />
                          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address *</label>
                          <input
                            id="contact-email"
                            type="email"
                            className="input-field"
                            placeholder="you@example.com"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                            })}
                          />
                          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Phone Number</label>
                          <input
                            id="contact-phone"
                            className="input-field"
                            placeholder="+94 77 123 4567"
                            {...register('phone')}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Subject</label>
                          <select id="contact-subject" className="input-field" {...register('subject')}>
                            <option value="General Enquiry" className="bg-navy-950">General Enquiry</option>
                            <option value="Application Support" className="bg-navy-950">Application Support</option>
                            <option value="Sponsorship" className="bg-navy-950">Sponsorship Opportunities</option>
                            <option value="Media & Press" className="bg-navy-950">Media & Press</option>
                            <option value="Other" className="bg-navy-950">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5 font-medium">Message *</label>
                        <textarea
                          id="contact-message"
                          rows={5}
                          className="input-field resize-none"
                          placeholder="Tell us how we can help you..."
                          {...register('message', {
                            required: 'Message is required',
                            minLength: { value: 10, message: 'Message must be at least 10 characters' },
                          })}
                        />
                        {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
                      </div>

                      <button
                        id="contact-submit"
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full"
                        style={isSubmitting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <RiSendPlane2Line />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
