import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX, HiChevronDown } from 'react-icons/hi';
import { RiAwardLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { label: 'Home',             path: '/' },
  { label: 'About Awards',     path: '/about' },
  { label: 'Categories',       path: '/categories' },
  { label: 'Timeline',         path: '/timeline' },
  { label: 'FAQs',             path: '/faqs' },
  { label: 'Contact',          path: '/contact' },
];

const Navbar = () => {
  const [isOpen,      setIsOpen]      = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin')     return '/admin';
    if (user.role === 'judge')     return '/judge-dashboard';
    return '/dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-navy-950/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <nav className="flex items-center justify-between h-20">

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="relative w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <RiAwardLine className="text-white text-2xl" />
              <div className="absolute inset-0 rounded-xl bg-gradient-accent opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-white text-sm leading-tight">
                National AI Awards
              </p>
              <p className="text-xs text-accent-400 font-medium">Sri Lanka 2026</p>
            </div>
          </Link>

          {/* ── Desktop Nav ───────────────────────────────────── */}
          <ul className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `nav-link px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'active text-white bg-white/5' : 'hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Desktop CTA ───────────────────────────────────── */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate(getDashboardPath())}
                  className="btn-ghost text-sm px-4 py-2"
                >
                  Dashboard
                </button>
                <button onClick={handleLogout} className="btn-ghost text-sm px-4 py-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/judge-portal" className="btn-ghost text-sm px-4 py-2">
                  Judge Portal
                </Link>
                <Link to="/login" className="btn-ghost text-sm px-4 py-2">
                  Login
                </Link>
                <Link to="/apply" className="btn-gold text-sm px-5 py-2">
                  Apply Now
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────────────────── */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </nav>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-navy-950/98 backdrop-blur-xl border-t border-white/10"
          >
            <div className="section-container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <div className="divider-glow my-3" />

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => { navigate(getDashboardPath()); setIsOpen(false); }}
                    className="btn-primary w-full mt-1"
                  >
                    Dashboard
                  </button>
                  <button onClick={handleLogout} className="btn-ghost w-full mt-1 text-red-400">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/judge-portal" onClick={() => setIsOpen(false)} className="btn-ghost w-full mt-1 text-center">
                    Judge Portal
                  </Link>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="btn-ghost w-full mt-1 text-center">
                    Login
                  </Link>
                  <Link to="/apply" onClick={() => setIsOpen(false)} className="btn-gold w-full mt-1 text-center">
                    Apply Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
