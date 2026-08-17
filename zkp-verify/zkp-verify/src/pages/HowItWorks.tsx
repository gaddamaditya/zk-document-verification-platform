import { motion } from 'framer-motion';
import { ArrowRight, FileScan, KeyRound, LockKeyhole, ScrollText, Workflow } from 'lucide-react';

import {
  ConceptCard,
  FlowArrow,
  SummaryCard,
  WorkflowActionButton,
  WorkflowSectionHeading,
} from '@/components/workflow/WorkflowSections';
import { cryptographicConcepts, workflowStages, workflowSummary } from '@/content/workflow';

export default function HowItWorks() {
  return (
    <div className="space-y-16 pb-20 max-w-5xl mx-auto">
      {/* Hero */}
      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400"
        >
          <Workflow className="h-3.5 w-3.5" />
          Technical Overview
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        >
          How It Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-base leading-7 text-muted-foreground max-w-3xl"
        >
          This page explains the technical pipeline behind privacy-preserving document verification using Zero-Knowledge Proofs — from document intake to proof verification.
        </motion.p>
      </section>

      {/* ── Plain-language explanation ────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">
            What are Zero-Knowledge Proofs?
          </h2>
          <div className="space-y-3 text-sm leading-7 text-muted-foreground">
            <p>
              A <span className="font-bold text-foreground">Zero-Knowledge Proof (ZKP)</span> is a cryptographic method that allows one party (the prover) to prove a statement is true to another party (the verifier) — <span className="text-teal-600 dark:text-teal-400 font-semibold">without revealing any underlying data</span>.
            </p>
            <p>
              In the context of document verification, this means you can prove facts like <em>"I am over 18"</em> or <em>"I hold a valid degree"</em> without ever sharing the original document with the verifier.
            </p>
            <p>
              The verifier only receives a compact mathematical proof and can confirm the claim is valid — they never see your name, date of birth, address, or any other personal information.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
          className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4"
        >
          <h2 className="text-2xl font-bold text-foreground">
            The User Journey
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Prover Journey</p>
              <ol className="mt-3 space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2"><span className="font-bold text-teal-600 dark:text-teal-400">1.</span> Upload your document</li>
                <li className="flex items-start gap-2"><span className="font-bold text-teal-600 dark:text-teal-400">2.</span> Automatic OCR detection</li>
                <li className="flex items-start gap-2"><span className="font-bold text-teal-600 dark:text-teal-400">3.</span> Select claims to prove</li>
                <li className="flex items-start gap-2"><span className="font-bold text-teal-600 dark:text-teal-400">4.</span> Generate & download proof package</li>
              </ol>
            </div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
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
          title="Behind the scenes: from document to verifiable proof"
          description="The following stages describe the technical processing pipeline that transforms a document into a zero-knowledge proof."
        />

        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="grid gap-4 lg:grid-cols-7 lg:items-stretch">
            {workflowStages.map((stage, index) => {
              const Icon = stage.icon;

              return (
                <motion.div
                  key={stage.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07 }}
                  className="flex flex-col"
                >
                  <div className="flex-1 rounded-lg border border-border bg-muted/40 p-4 text-center">
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-teal-600 dark:text-teal-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">{stage.step}</p>
                    <h3 className="mt-1 text-sm font-bold text-foreground">{stage.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{stage.description}</p>
                  </div>
                  {index < workflowStages.length - 1 && (
                    <div className="hidden lg:flex">
                      <FlowArrow />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg border border-teal-500/30 bg-teal-500/5 p-4 text-xs leading-6 text-foreground font-medium">
            The pipeline above runs behind the scenes. Users interact only with a simple Upload → Select Claims → Generate Proof → Download workflow.
          </div>
        </div>
      </section>

      {/* ── Cryptographic Concepts ────────────────────────────────── */}
      <section className="space-y-6">
        <WorkflowSectionHeading
          eyebrow="Cryptographic concepts"
          title="Building blocks of zero-knowledge document verification"
          description="These are the core technologies and primitives used in the proof pipeline."
          centered
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cryptographicConcepts.map((concept, index) => (
            <motion.div
              key={concept.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <ConceptCard title={concept.title} description={concept.description} icon={concept.icon} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Summary ──────────────────────────────────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SummaryCard
          title="Proof lifecycle summary"
          description="The proof workflow separates private data from public evidence. The document is read, attributes are extracted, the circuit receives public and private inputs, witness generation happens locally, Groth16 produces the proof, and the verifier checks the proof against the public inputs and key."
        >
          <ul className="space-y-2.5 text-xs leading-6 text-muted-foreground">
            {workflowSummary.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SummaryCard>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-xs">
          <h3 className="text-lg font-bold text-foreground">Public vs private inputs</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-teal-600 dark:text-teal-400">
                <ScrollText className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Public Inputs</h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Visible to the verifier and used to validate the claim.</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="mb-2.5 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-blue-600 dark:text-blue-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Private Inputs</h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Remain hidden in the witness and never get disclosed directly.</p>
            </div>
          </div>
          <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4 text-xs leading-6 text-muted-foreground">
            Poseidon Hash is commonly used inside zero-knowledge circuits to hash and compare values efficiently without leaving the ZK-friendly arithmetic domain.
          </div>
        </div>
      </section>

      {/* ── Tool reference ───────────────────────────────────────── */}
      <section className="space-y-6">
        <WorkflowSectionHeading
          eyebrow="Toolchain"
          title="The key tools used in the proof pipeline"
          description="Each tool plays a specific role in the journey from document to verifiable proof."
          centered
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'OCR', description: 'Read the document and convert it into machine-readable text.', icon: FileScan },
            { label: 'Circom', description: 'Encode claim logic as an arithmetic circuit.', icon: Workflow },
            { label: 'snarkjs', description: 'Generate the witness and coordinate proof tooling.', icon: KeyRound },
            { label: 'Groth16', description: 'Produce a succinct proof that can be verified efficiently.', icon: LockKeyhole },
          ].map((item) => (
            <ConceptCard key={item.label} title={item.label} description={item.description} icon={item.icon} />
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────── */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 text-sm leading-7 text-foreground sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div>
          <h3 className="text-base font-bold text-foreground">Ready to experience privacy-preserving verification?</h3>
          <p className="text-xs text-muted-foreground">Generate a proof or verify an existing proof package.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <WorkflowActionButton href="/" label="Go to ZKVerify Platform" />
        </div>
      </section>
    </div>
  );
}
