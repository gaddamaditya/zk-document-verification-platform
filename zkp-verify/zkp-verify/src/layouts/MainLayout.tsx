import { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, Mail, Menu, Moon, Shield, Sun, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { useTheme } from '@/context/ThemeContext';
import { footerHighlights, navigationLinks } from '@/utils/navigation';

export function MainLayout({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col relative bg-background text-foreground transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-foreground uppercase">ZKVerify</p>
              <p className="text-xs text-muted-foreground">Zero-Knowledge Document Verification</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            <nav className="flex items-center gap-1 rounded-full border border-border bg-muted/50 p-1">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-accent hover:border-primary/50"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>
          </div>

          {/* Mobile menu & theme button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground p-2"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card p-2 text-foreground transition-colors hover:border-primary"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border bg-card/95 backdrop-blur-xl md:hidden"
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
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
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

      <footer className="relative z-10 border-t border-border bg-card/50 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-foreground">ZKVerify</p>
                <p className="text-xs text-muted-foreground">Zero-Knowledge Document Verification</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Privacy-Preserving Document Verification platform using Zero-Knowledge Proofs. Enables users to prove specific document attributes without revealing the complete document.
            </p>
            <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Student Researcher:</span> Adithya Gaddam
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {footerHighlights.map((item) => (
                <span key={item} className="rounded-full border border-border bg-muted/40 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Navigation</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {navigationLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className="transition-colors hover:text-foreground">
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resources & Contact</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Technology Stack:</span> React, Vite, Tailwind, Groth16, Express
              </p>
              <a className="flex items-center gap-2 transition-colors hover:text-foreground" href="mailto:gaddamaditya8@gmail.com">
                <Mail className="h-4 w-4 text-primary" /> gaddamaditya8@gmail.com
              </a>
              <a className="flex items-center gap-2 transition-colors hover:text-foreground" href="https://github.com/gaddamaditya/zk-document-verification-platform" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 text-secondary" /> GitHub Repository
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-border px-6 py-5 text-center text-xs text-muted-foreground">
          Copyright {new Date().getFullYear()} ZKVerify. Privacy-Preserving Document Verification Platform.
        </div>
      </footer>
    </div>
  );
}
