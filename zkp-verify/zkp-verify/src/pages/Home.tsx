import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Shield,
  ShieldCheck,
  Upload,
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
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
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
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Verifier Flow
          </span>
        </div>
        <VerifyProof />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 max-w-5xl mx-auto">
      {/* ── Main Hero ────────────────────────────────────────── */}
      <section className="text-center space-y-6 pt-6 pb-10 border-b border-border">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
        >
          <Shield className="h-3.5 w-3.5" />
          ZKVerify
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight"
        >
          Prove what is true without revealing your document.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Zero-knowledge proofs enable instant, cryptographic verification of identity and document facts without disclosing sensitive raw files or personal details.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div
            onClick={() => setRole('prover')}
            className="w-full sm:w-80 cursor-pointer rounded-xl border border-teal-500/30 bg-teal-500/5 p-6 text-left transition-all hover:border-teal-500/60 dark:hover:bg-teal-500/10 shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">For Provers</span>
              <ShieldCheck className="h-4 w-4 text-teal-500" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              PROVE A CLAIM
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Upload a document and generate a privacy-preserving proof.
            </p>
            <Button size="sm" className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600">
              Start Prover Flow →
            </Button>
          </div>

          <div
            onClick={() => setRole('verifier')}
            className="w-full sm:w-80 cursor-pointer rounded-xl border border-blue-500/30 bg-blue-500/5 p-6 text-left transition-all hover:border-blue-500/60 dark:hover:bg-blue-500/10 shadow-xs group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">For Verifiers</span>
              <ShieldCheck className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              VERIFY A PROOF
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Verify a proof received from another person without seeing their file.
            </p>
            <Button size="sm" variant="secondary" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
              Start Verifier Flow →
            </Button>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground pt-2">
          Powered by zero-knowledge proofs.
        </p>
      </section>

      {/* ── How ZKVerify Works ───────────────────────────────── */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">How ZKVerify works</h2>
          <p className="text-sm text-muted-foreground">No document is shared with the verifier.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-teal-600 dark:text-teal-400">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">1. Upload Document</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              Select your document locally. Key attributes are parsed automatically while raw files remain private.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">2. Select Claims</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              Choose specifically what facts you wish to prove (such as Age ≥ 18, Name, or Academic Result).
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-3 shadow-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">3. Generate Proof</h3>
            <p className="text-xs leading-6 text-muted-foreground">
              A mathematical proof package is generated to certify your claims without exposing the document.
            </p>
          </div>
        </div>
      </section>

      {/* ── Privacy & Trust ──────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-8 md:p-10 space-y-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Your document stays private.</h3>
            <p className="text-xs text-muted-foreground">Zero document storage & selective disclosure</p>
          </div>
        </div>
        <p className="text-sm leading-7 text-muted-foreground max-w-3xl">
          ZKVerify allows users to prove specific facts about their identity or qualifications without exposing the original document. Verifiers validate only the cryptographic proof file.
        </p>
      </section>
    </div>
  );
}
