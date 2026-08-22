import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  EyeOff,
  FileCheck,
  Filter,
  Lock,
  Shield,
  ShieldCheck,
  UserCheck,
  Verified,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import GenerateProof from './GenerateProof';
import VerifyProof from './VerifyProof';

export default function Home() {
  const [role, setRole] = useState<'select' | 'prover' | 'verifier'>('select');

  if (role === 'prover') {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Button
            variant="outline"
            onClick={() => setRole('select')}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Prover Flow
          </span>
        </div>
        <GenerateProof />
      </div>
    );
  }

  if (role === 'verifier') {
    return (
      <div className="space-y-6 pb-20 max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Button
            variant="outline"
            onClick={() => setRole('select')}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Verifier Flow
          </span>
        </div>
        <VerifyProof />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20 max-w-6xl mx-auto">
      {/* ── Main Hero Section ──────────────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-12 items-center pt-4 pb-8 border-b border-border">
        {/* Left Side Copy & CTAs */}
        <div className="flex flex-col gap-6 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 self-start rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300"
          >
            <Shield className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            SELECTIVE DISCLOSURE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]"
          >
            Verify Documents. <br />
            Without Exposing <br />
            Them.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-base text-muted-foreground leading-relaxed max-w-lg"
          >
            Prove specific facts about your documents without sharing the underlying document. Generate zero-knowledge proofs and let anyone verify the result.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pt-2 flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              onClick={() => setRole('prover')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-7 py-6 rounded-xl shadow-xs gap-2 text-sm justify-center"
            >
              Generate Proof
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setRole('verifier')}
              className="border-border text-foreground hover:bg-muted font-semibold px-7 py-6 rounded-xl gap-2 text-sm justify-center"
            >
              Verify a Proof
              <Verified className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </Button>
          </motion.div>
        </div>

        {/* Right Side UI Representation Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative w-full max-w-md mx-auto flex flex-col gap-4"
        >
          {/* Document Card Mockup */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm transform -rotate-1 hover:rotate-0 transition-transform duration-300 relative z-20">
            <div className="flex justify-between items-start mb-6 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">National ID Card</h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">ID-2024-9874</p>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                Verified
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground block">Name</span>
                  <span className="text-sm font-semibold text-foreground">Alex Mercer</span>
                </div>
                <div>
                  <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground block">Date of Birth</span>
                  <span className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span className="h-3.5 w-16 rounded bg-muted animate-pulse inline-block" />
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground block">Address</span>
                <span className="text-sm font-medium text-foreground flex items-center gap-2 mt-1">
                  <span className="h-3.5 w-32 rounded bg-muted inline-block" />
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </div>
            </div>
          </div>

          {/* Verification Result Floating Mockup */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-lg transform translate-x-6 sm:translate-x-8 -translate-y-6 relative z-30">
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-foreground">Proof Verified</h4>
            </div>

            <ul className="space-y-2 text-xs font-medium text-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-500 shrink-0" />
                <span>Name: Alex Mercer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-teal-500 shrink-0" />
                <span>Age ≥ 18</span>
              </li>
            </ul>

            <div className="mt-3 pt-2 border-t border-border text-right">
              <span className="text-[0.7rem] text-muted-foreground">Generated moments ago</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Value Proposition Section ─────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-8 md:p-12 space-y-8 shadow-xs">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Share the proof, not the document.
          </h2>
          <p className="text-sm text-muted-foreground">
            ZKVERIFY lets you prove selected claims from a document while keeping the original document private.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col items-center text-center space-y-3 transition-colors hover:border-teal-500/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-teal-600 dark:text-teal-400 shadow-xs">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-foreground">PRIVATE</h3>
            <p className="text-xs leading-6 text-muted-foreground">Your original document stays private and never leaves your control.</p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col items-center text-center space-y-3 transition-colors hover:border-teal-500/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-teal-600 dark:text-teal-400 shadow-xs">
              <Filter className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-foreground">SELECTIVE</h3>
            <p className="text-xs leading-6 text-muted-foreground">Prove only the specific information that matters for your claim.</p>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-6 flex flex-col items-center text-center space-y-3 transition-colors hover:border-teal-500/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-teal-600 dark:text-teal-400 shadow-xs">
              <FileCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold uppercase tracking-wider text-foreground">VERIFIABLE</h3>
            <p className="text-xs leading-6 text-muted-foreground">Anyone can independently verify the generated mathematical proof.</p>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ─────────────────────────────── */}
      <section className="space-y-10 pt-4">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How It Works</h2>
          <p className="text-sm text-muted-foreground">Four simple steps to privacy-preserving document verification.</p>
        </div>

        {/* Desktop Horizontal Line Timeline */}
        <div className="hidden md:block relative max-w-5xl mx-auto">
          <div className="absolute top-8 left-[12%] right-[12%] h-px bg-border z-0" />
          <div className="grid grid-cols-4 gap-8 relative z-10">
            {[
              { step: '01', title: 'Upload Document', desc: 'Securely process your document locally.' },
              { step: '02', title: 'Choose Claims', desc: 'Select specific fields to disclose.' },
              { step: '03', title: 'Generate Proof', desc: 'Create a cryptographic zero-knowledge proof.' },
              { step: '04', title: 'Verify', desc: 'Share the proof for independent verification.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center space-y-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card font-bold text-teal-600 dark:text-teal-400 text-lg shadow-xs">
                  {item.step}
                </div>
                <h4 className="text-base font-bold text-foreground pt-1">{item.title}</h4>
                <p className="text-xs leading-5 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden relative max-w-sm mx-auto space-y-8 px-4">
          <div className="absolute left-9 top-6 bottom-6 w-px bg-border z-0" />
          {[
            { step: '01', title: 'Upload Document', desc: 'Securely process your document locally.' },
            { step: '02', title: 'Choose Claims', desc: 'Select specific fields to disclose.' },
            { step: '03', title: 'Generate Proof', desc: 'Create a cryptographic zero-knowledge proof.' },
            { step: '04', title: 'Verify', desc: 'Share the proof for independent verification.' },
          ].map((item) => (
            <div key={item.step} className="relative flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card font-bold text-teal-600 dark:text-teal-400 text-sm shadow-xs z-10">
                {item.step}
              </div>
              <div className="pt-1">
                <h4 className="text-base font-bold text-foreground">{item.title}</h4>
                <p className="text-xs leading-5 text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Built for Institutions Section ───────────────────── */}
      <section className="space-y-8 pt-4">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Built for Institutions</h2>
          <p className="text-sm text-muted-foreground">Enterprise-ready zero-knowledge verification architecture.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-teal-600 dark:text-teal-400">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Financial Compliance</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              Execute KYC/AML checks without holding sensitive client PII or storing raw identity documents.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-teal-600 dark:text-teal-400">
              <UserCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Identity Verification</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              Prove age, citizenship, or accreditation status while preserving full user privacy.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Healthcare & Academic</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              Verify degrees, certifications, or medical records without exposing underlying sensitive details.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
