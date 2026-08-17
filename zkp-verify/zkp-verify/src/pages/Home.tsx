import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  BookOpenText,
  FileCheck2,
  FileText,
  IdCard,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  GlassCard,
  SectionHeading,
} from '@/components/landing/LandingSections';
import { landingContent } from '@/content/landing';
import GenerateProof from './GenerateProof';
import VerifyProof from './VerifyProof';

const traditionalItems = [
  'Full document must be shared',
  'Personal information is exposed',
  'Sensitive details remain visible',
  'Higher privacy risk',
];

const privacyItems = [
  'Only required claims are shared',
  'Sensitive information remains hidden',
  'Original document is not revealed',
  'Secure cryptographic verification',
];

export default function Home() {
  const [role, setRole] = useState<'select' | 'prover' | 'verifier'>('select');

  if (role === 'prover') {
    return (
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Button
            variant="outline"
            onClick={() => setRole('select')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Role Selection
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-200">
            Prover Mode
          </span>
        </div>
        <GenerateProof />
      </div>
    );
  }

  if (role === 'verifier') {
    return (
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Button
            variant="outline"
            onClick={() => setRole('select')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Role Selection
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-200">
            Verifier Mode
          </span>
        </div>
        <VerifyProof />
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-20 max-w-7xl mx-auto">
      {/* ── Role Selection Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-6 py-16 shadow-[0_24px_100px_rgba(2,6,23,0.55)] sm:px-10 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="relative text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            Zero-Knowledge Identity & Document Verification
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            ZKVerify
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-base leading-8 text-slate-300 sm:text-xl"
          >
            Prove what is true without revealing your document, or verify a proof you received.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="pt-4"
          >
            <h2 className="text-xl font-semibold text-cyan-200 mb-6">What would you like to do?</h2>
            <div className="grid gap-6 md:grid-cols-2 text-left">
              {/* Option 1: Prove a Claim */}
              <button
                type="button"
                onClick={() => setRole('prover')}
                className="group relative overflow-hidden rounded-[1.75rem] border border-cyan-400/30 bg-cyan-400/10 p-8 transition-all hover:scale-[1.02] hover:border-cyan-400/60 hover:bg-cyan-400/15 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/20 text-cyan-200 mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white group-hover:text-cyan-200">
                  Prove a Claim
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Upload a document, select facts to prove, and generate a zero-knowledge proof package without revealing your original document.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 group-hover:translate-x-1 transition-transform">
                  Start Prover Flow <ArrowRight className="h-4 w-4" />
                </div>
              </button>

              {/* Option 2: Verify a Proof */}
              <button
                type="button"
                onClick={() => setRole('verifier')}
                className="group relative overflow-hidden rounded-[1.75rem] border border-purple-400/30 bg-purple-400/10 p-8 transition-all hover:scale-[1.02] hover:border-purple-400/60 hover:bg-purple-400/15 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-400/20 text-purple-200 mb-6">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold text-white group-hover:text-purple-200">
                  Verify a Proof
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Upload proof files received from a prover and verify the validity of their claims without seeing the original document.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-300 group-hover:translate-x-1 transition-transform">
                  Start Verifier Flow <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Traditional vs Privacy-Preserving Comparison ─────────── */}
      <section className="space-y-10">
        <SectionHeading
          eyebrow="Why Privacy-Preserving Verification?"
          title="Compare traditional document sharing with selective verification."
          description="Understand the difference between exposing your original document and utilizing privacy-preserving claims."
          centered
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard
            icon={<ShieldAlert className="h-5 w-5 animate-pulse text-red-400" />}
            title="Traditional Verification"
            description="Conventional document sharing requires giving away all details."
          >
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
              <ul className="grid gap-2 text-sm text-red-100">
                {traditionalItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <GlassCard
            icon={<ShieldCheck className="h-5 w-5 text-cyan-300" />}
            title="Privacy-Preserving Verification"
            description="Selective disclosure proves facts without exposing raw data."
          >
            <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <ul className="grid gap-2 text-sm text-cyan-100">
                {privacyItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Supported Documents ──────────────────────────────────── */}
      <section className="space-y-10">
        <SectionHeading
          eyebrow="Supported Documents"
          title="Document types currently supported for verification"
          description="Each document type maps to specific verifiable claims and can be extended with additional formats."
          centered
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {landingContent.supportedDocuments.map((doc, index) => {
            const icons = [IdCard, CreditCard, Landmark, UserCheck, FileText, BookOpenText];
            const Icon = icons[index % icons.length];

            return (
              <motion.div
                key={doc.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <GlassCard icon={<Icon className="h-5 w-5" />} title={doc.title} description={doc.verification} />
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
