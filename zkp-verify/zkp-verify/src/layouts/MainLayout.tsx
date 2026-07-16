import { ReactNode, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Mail, Menu, Shield, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { footerHighlights, navigationLinks } from '@/utils/navigation';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-200 selection:bg-cyan-500/30">
      <div className="absolute top-[-8%] left-[-8%] h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[18%] right-[-10%] h-[26rem] w-[26rem] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:border-cyan-400/60">
              <Shield className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-cyan-100 uppercase">ZKP-DOCVerify</p>
              <p className="text-xs text-slate-400">Research demonstration</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/5 p-1 md:flex">
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400 hover:text-white',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-white md:hidden"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 bg-slate-950/95 backdrop-blur-xl md:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-4">
                {navigationLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      [
                        'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        isActive ? 'bg-cyan-400/15 text-cyan-200' : 'text-slate-400 hover:bg-white/5 hover:text-white',
                      ].join(' ')
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 py-12">{children}</main>

      <footer className="relative z-10 border-t border-white/5 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <Shield className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-white">ZKP-DOCVerify</p>
                <p className="text-sm text-slate-400">Privacy-preserving document verification</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-400">
              Privacy-Preserving Document Verification using Zero-Knowledge Proofs. This research project demonstrates selective disclosure of document attributes through OCR, Circom circuits, Groth16 proof generation, and cryptographic verification.
            </p>
            <div className="mt-6 grid gap-2 text-xs text-slate-400">
              <p>
                <span className="text-slate-200">Student Researcher:</span> Adithya Gaddam
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              {footerHighlights.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Navigate</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              {navigationLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100">Research Resources</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p>
                <span className="text-slate-200">Technology Stack:</span> React, Vite, Tailwind, Framer Motion, Groth16
              </p>
              <a className="flex items-center gap-2 transition-colors hover:text-white" href="mailto:gaddamaditya8@gmail.com">
                <Mail className="h-4 w-4 text-cyan-300" /> gaddamaditya8@gmail.com
              </a>
              <a className="flex items-center gap-2 transition-colors hover:text-white" href="https://github.com/gaddamaditya" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 text-purple-300" /> GitHub Repository
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 px-6 py-5 text-center text-xs text-slate-500">
          Copyright {new Date().getFullYear()} ZKP-DOCVerify Research Platform. Academic demonstration for research and education.
        </div>
      </footer>
    </div>
  );
}
