import { motion } from 'framer-motion';
import { ArrowRight, FileScan, KeyRound, LockKeyhole, ScrollText, ShieldCheck, Workflow } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { WorkflowSectionHeading } from '@/components/workflow/WorkflowSections';
import { cryptographicConcepts, workflowStages, workflowSummary } from '@/content/workflow';

export default function HowItWorks() {
  return (
    <div className="space-y-16 pb-20 max-w-5xl mx-auto">
      {/* Hero */}
      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-300"
        >
          <Workflow className="h-3.5 w-3.5" />
          Technical Overview
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          How It Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base leading-7 text-muted-foreground max-w-3xl"
        >
          This page explains the technical pipeline behind privacy-preserving document verification using Zero-Knowledge Proofs — from document intake to proof generation.
        </motion.p>
      </section>

      {/* ── Plain-language explanation ────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">
            What are Zero-Knowledge Proofs?
          </h2>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>
              A <span className="font-semibold text-foreground">Zero-Knowledge Proof (ZKP)</span> is a cryptographic method that allows one party (the prover) to prove a statement is true to another party (the verifier) — <span className="text-teal-600 dark:text-teal-400 font-medium">without revealing any underlying data</span>.
            </p>
            <p>
              In the context of document verification, this means you can prove facts like <em>"I am over 18"</em> or <em>"I hold a valid degree"</em> without ever sharing the original document.
            </p>
            <p>
              The verifier only receives a compact mathematical proof and can confirm the claim is valid — they never see your name, date of birth, address, or any other personal information.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">
            The Prover Journey
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Prover Workflow</p>
              <ol className="mt-3 space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2"><span className="font-bold text-teal-500">1.</span> Upload your document</li>
                <li className="flex items-start gap-2"><span className="font-bold text-teal-500">2.</span> Automatic OCR detection & attributes masking</li>
                <li className="flex items-start gap-2"><span className="font-bold text-teal-500">3.</span> Select claims to prove</li>
                <li className="flex items-start gap-2"><span className="font-bold text-teal-500">4.</span> Generate & download proof package</li>
              </ol>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Privacy Guarantee</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your original document stays private on your device. Only compact mathematical proofs are generated for selective disclosure.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Technical Pipeline ────────────────────────────────────── */}
      <section className="space-y-6">
        <WorkflowSectionHeading
          eyebrow="Technical Pipeline"
          title="From Local Intake to Cryptographic Evidence"
          description="A breakdown of how documents are converted into zero-knowledge proofs."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {workflowStages.map((stage) => (
            <div key={stage.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                  {stage.id}
                </span>
                <h3 className="text-lg font-bold text-foreground">{stage.title}</h3>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{stage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 p-8 text-sm leading-7 text-foreground sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div>
          <h3 className="text-lg font-bold text-foreground">Ready to test privacy-preserving verification?</h3>
          <p className="text-muted-foreground text-xs mt-1">Start by proving a claim or verifying a proof package.</p>
        </div>
        <Button href="/" className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600 shrink-0">
          Go to ZKVerify Platform
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </section>
    </div>
  );
}
