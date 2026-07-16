import { motion } from 'framer-motion';
import { ArrowRight, FileScan, KeyRound, LockKeyhole, ScrollText, Sigma, Workflow } from 'lucide-react';

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
    <div className="space-y-24 pb-20">
      {/* Hero */}
      <section className="max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Technical Overview
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          How It Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-4xl text-base leading-8 text-slate-400 sm:text-lg"
        >
          This page explains the technical pipeline behind privacy-preserving document verification using Zero-Knowledge Proofs — from document intake to proof verification.
        </motion.p>
      </section>

      {/* ── Plain-language explanation ────────────────────────────── */}
      <section className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
        >
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            What are Zero-Knowledge Proofs?
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>
              A <span className="font-semibold text-white">Zero-Knowledge Proof (ZKP)</span> is a cryptographic method that allows one party (the prover) to prove a statement is true to another party (the verifier) — <span className="text-cyan-200">without revealing any underlying data</span>.
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
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
        >
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            The User Journey
          </h2>
          <div className="mt-5 space-y-5">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Prover</p>
              <ol className="mt-3 space-y-2 text-sm text-cyan-50">
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-cyan-200">1.</span> Upload a document</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-cyan-200">2.</span> Select claims to prove</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-cyan-200">3.</span> Generate a cryptographic proof</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-cyan-200">4.</span> Download proof files and share with verifier</li>
              </ol>
            </div>
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <ArrowRight className="h-4 w-4 rotate-90" />
              </div>
            </div>
            <div className="rounded-xl border border-purple-400/20 bg-purple-400/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200">Verifier</p>
              <ol className="mt-3 space-y-2 text-sm text-purple-50">
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-purple-200">1.</span> Upload proof files</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-purple-200">2.</span> Click Verify Proof</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 font-semibold text-purple-200">3.</span> See Valid or Invalid result</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Technical Pipeline ────────────────────────────────────── */}
      <section className="space-y-8">
        <WorkflowSectionHeading
          eyebrow="Technical Pipeline"
          title="Behind the scenes: from document to verifiable proof"
          description="The following stages describe the technical processing pipeline that transforms a document into a zero-knowledge proof. These details are hidden from the primary user workflow but are included here for research demonstration."
        />

        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl">
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
                  <div className="flex-1 rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">{stage.step}</p>
                    <h3 className="mt-2 text-base font-semibold text-white">{stage.title}</h3>
                    <p className="mt-3 text-xs leading-6 text-slate-400">{stage.description}</p>
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

          <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-7 text-cyan-50">
            The pipeline above runs behind the scenes. Users interact only with a simple Upload → Select Claims → Generate Proof → Download workflow.
          </div>
        </div>
      </section>

      {/* ── Cryptographic Concepts ────────────────────────────────── */}
      <section className="space-y-8">
        <WorkflowSectionHeading
          eyebrow="Cryptographic concepts"
          title="Building blocks of zero-knowledge document verification"
          description="These are the core technologies and primitives used in the proof pipeline."
          centered
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
          <ul className="space-y-3 text-sm leading-7 text-slate-300">
            {workflowSummary.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SummaryCard>

        <div className="space-y-6 rounded-[1.75rem] border border-white/10 bg-slate-950/30 p-6 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white">Public vs private inputs</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <ScrollText className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">Public Inputs</h4>
              <p className="mt-2 text-xs leading-6 text-slate-400">Visible to the verifier and used to validate the claim.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10 text-purple-200">
                <KeyRound className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">Private Inputs</h4>
              <p className="mt-2 text-xs leading-6 text-slate-400">Remain hidden in the witness and never get disclosed directly.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-purple-400/20 bg-purple-400/10 p-5 text-sm leading-7 text-purple-50">
            Poseidon Hash is commonly used inside zero-knowledge circuits to hash and compare values efficiently without leaving the ZK-friendly arithmetic domain.
          </div>
        </div>
      </section>

      {/* ── Tool reference ───────────────────────────────────────── */}
      <section className="space-y-8">
        <WorkflowSectionHeading
          eyebrow="Toolchain"
          title="The key tools used in the proof pipeline"
          description="Each tool plays a specific role in the journey from document to verifiable proof."
          centered
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
      <section className="flex flex-col gap-4 rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/10 px-6 py-8 text-sm leading-7 text-cyan-50 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <p>
          Ready to try it out? Use the prover and verifier pages to experience the workflow firsthand.
        </p>
        <div className="flex flex-wrap gap-3">
          <WorkflowActionButton href="/generate-proof" label="Generate Proof" />
          <WorkflowActionButton href="/verify-proof" label="Verify Proof" />
        </div>
      </section>
    </div>
  );
}
