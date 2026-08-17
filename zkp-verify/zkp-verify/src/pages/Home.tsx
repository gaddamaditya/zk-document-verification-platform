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
  Shield,
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
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Button
            variant="outline"
            onClick={() => setRole('select')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Role Selection
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
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
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Button
            variant="outline"
            onClick={() => setRole('select')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Role Selection
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Verifier Mode
          </span>
        </div>
        <VerifyProof />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-20 max-w-7xl mx-auto">
      {/* ── Role Selection Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-12 md:p-16">
        <div className="relative text-center max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-300"
          >
            <Shield className="h-3.5 w-3.5" />
            Privacy-Preserving Verification
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Welcome to ZKVerify
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base leading-8 text-muted-foreground sm:text-lg max-w-2xl mx-auto"
          >
            Zero-knowledge proofs let you prove facts about your documents without revealing the documents themselves.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="pt-6 space-y-6"
          >
            <h2 className="text-xl font-semibold text-foreground">What would you like to do?</h2>
            
            <div className="grid gap-6 md:grid-cols-2 text-left">
              {/* Option 1: PROVE A CLAIM (Teal) */}
              <div
                onClick={() => setRole('prover')}
                className="group cursor-pointer rounded-2xl border border-teal-500/30 bg-teal-500/5 p-8 transition-all hover:shadow-md hover:border-teal-500/60 dark:hover:bg-teal-500/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-5">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Prove a Claim
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Upload your document, select the facts you want to prove, and generate a zero-knowledge proof without revealing your original document.
                </p>
                <div className="mt-6">
                  <Button variant="default" className="w-full justify-between bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600">
                    <span>Start Prover Flow</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Option 2: VERIFY A PROOF (Blue) */}
              <div
                onClick={() => setRole('verifier')}
                className="group cursor-pointer rounded-2xl border border-blue-500/30 bg-blue-500/5 p-8 transition-all hover:shadow-md hover:border-blue-500/60 dark:hover:bg-blue-500/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-5">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Verify a Proof
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Upload a proof package received from a prover and verify the validity of their claims without seeing the original document.
                </p>
                <div className="mt-6">
                  <Button variant="secondary" className="w-full justify-between bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                    <span>Start Verifier Flow</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Traditional vs Privacy-Preserving Comparison ─────────── */}
      <section className="space-y-8">
        <SectionHeading
          eyebrow="Why Privacy-Preserving Verification?"
          title="Compare traditional document sharing with selective verification."
          description="Understand the difference between exposing your original document and utilizing privacy-preserving claims."
          centered
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard
            icon={<ShieldAlert className="h-5 w-5 text-red-500" />}
            title="Traditional Verification"
            description="Conventional document sharing requires giving away all details."
          >
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <ul className="grid gap-2 text-sm text-foreground">
                {traditionalItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <GlassCard
            icon={<ShieldCheck className="h-5 w-5 text-teal-500" />}
            title="Privacy-Preserving Verification"
            description="Selective disclosure proves facts without exposing raw data."
          >
            <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-4">
              <ul className="grid gap-2 text-sm text-foreground">
                {privacyItems.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ── Supported Documents ──────────────────────────────────── */}
      <section className="space-y-8">
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
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <GlassCard icon={<Icon className="h-5 w-5 text-primary" />} title={doc.title} description={doc.verification} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Bottom Privacy Message ──────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-8 text-center max-w-3xl mx-auto space-y-2 shadow-sm">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Your privacy is our priority</h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-6">
          Your original document is never shared with the verifier. Only cryptographic proof information is used for verification.
        </p>
      </section>
    </div>
  );
}
