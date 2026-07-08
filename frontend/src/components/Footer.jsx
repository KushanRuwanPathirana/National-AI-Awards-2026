import { Link } from 'react-router-dom';
import ApplyLink from './shared/ApplyLink';
import { RiAwardLine, RiMailLine, RiPhoneLine, RiMapPinLine } from 'react-icons/ri';
import { FaLinkedin, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';
import { motion } from 'framer-motion';

const footerLinks = {
  'Quick Links': [
    { label: 'Home', path: '/' },
    { label: 'About Awards', path: '/about' },
    { label: 'Categories', path: '/categories' },
    { label: 'Timeline', path: '/timeline' },
  ],
  'Participate': [
    { label: 'Apply Now', path: '/apply' },
    { label: 'Judge Portal', path: '/judge-portal' },
    { label: 'FAQs', path: '/faqs' },
    { label: 'Contact Us', path: '/contact' },
  ],
};

const socials = [
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

const Footer = () => (
  <footer className="relative bg-surface-300 border-t border-white/10 overflow-hidden">
    {/* Decorative gradient */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
    <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl pointer-events-none" />

    <div className="section-container py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand Column */}
        <div className="lg:col-span-1">
          <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <RiAwardLine className="text-white text-2xl" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm leading-tight">National AI Awards</p>
              <p className="text-xs text-accent-400 font-medium">Sri Lanka 2026</p>
            </div>
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Recognising excellence in Artificial Intelligence innovation across Sri Lanka.
            Celebrating the brightest minds shaping our digital future.
          </p>
          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-accent-500/20 hover:border-accent-500/40 transition-all duration-200"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Link Columns */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-display font-semibold text-white text-sm mb-5 uppercase tracking-wider">
              {title}
            </h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.path}>
                  {link.path === '/apply' ? (
                    <ApplyLink className="text-slate-400 text-sm hover:text-accent-300 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1 h-1 rounded-full bg-accent-500/0 group-hover:bg-accent-400 transition-colors" />
                      {link.label}
                    </ApplyLink>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-slate-400 text-sm hover:text-accent-300 transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-accent-500/0 group-hover:bg-accent-400 transition-colors" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contact Column */}
        <div>
          <h4 className="font-display font-semibold text-white text-sm mb-5 uppercase tracking-wider">
            Contact
          </h4>
          <ul className="space-y-4">
            {[
              { icon: RiMapPinLine, text: 'Colombo, Sri Lanka' },
              { icon: RiMailLine, text: 'info@aiawards.lk' },
              { icon: RiPhoneLine, text: '+94 11 234 5678' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-slate-400">
                <Icon className="text-accent-400 mt-0.5 flex-shrink-0" size={16} />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 p-4 glass-card !hover:transform-none">
            <p className="text-xs text-slate-400 mb-3">Applications Open</p>
            <p className="gradient-text-gold font-display font-bold text-lg">15 July - 15 August 2026</p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="divider-glow my-10" />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} National AI Awards Sri Lanka. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link to="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-slate-300 transition-colors">Terms of Use</Link>
          <Link to="#" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
