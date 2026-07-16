import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  BookOpenText,
  FileText,
  IdCard,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

import {
  ActionCard,
  GlassCard,
  LandingHero,
  SectionHeading,
} from '@/components/landing/LandingSections';
import { landingContent } from '@/content/landing';

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      <LandingHero
        eyebrow={landingContent.hero.eyebrow}
        title={landingContent.hero.title}
        subtitle={landingContent.hero.subtitle}
        actions={landingContent.hero.actions}
        stats={landingContent.hero.stats}
      />

      {/* ── Simple workflow ─────────────────────────────────────── */}
      <section className="space-y-8">
        <SectionHeading
          eyebrow="How It Works"
          title="Four simple steps from document to verified proof"
          description="Upload a document, choose what to prove, generate a proof, and share it with a verifier. No personal data is ever revealed."
          centered
        />

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl md:grid-cols-2 xl:grid-cols-7">
          {landingContent.platformWorkflow.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="h-full rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200">Step {index + 1}</p>
                <p className="mt-2 text-sm font-medium text-white">{step}</p>
              </div>
              {index < landingContent.platformWorkflow.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden -translate-y-1/2 xl:flex">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                    <ArrowDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ZKP explanation + benefits ──────────────────────────── */}
      <section className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow={landingContent.explanation.eyebrow}
            title="What is Zero-Knowledge Proof and why does it matter?"
            description={landingContent.explanation.description}
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {landingContent.benefits.slice(0, 3).map((benefit) => (
              <GlassCard key={benefit.title} icon={<benefit.icon className="h-5 w-5" />} title={benefit.title} description={benefit.description} />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">The core idea</h3>
              <p className="text-sm text-slate-400">Prove facts without revealing the source.</p>
            </div>
          </div>

          <div className="grid gap-3 text-sm leading-7 text-slate-300">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="font-medium text-white">What is ZKP?</p>
              <p className="mt-1 text-slate-400">A cryptographic method to prove a claim is true without revealing the underlying data.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="font-medium text-white">Why important?</p>
              <p className="mt-1 text-slate-400">It prevents over-disclosure in document verification and reduces privacy risk exposure.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="font-medium text-white">Benefits</p>
              <p className="mt-1 text-slate-400">Selective disclosure, smaller trust surface, and mathematically verifiable claims.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Traditional vs ZKP comparison ────────────────────────── */}
      <section className="space-y-10">
        <SectionHeading
          eyebrow="Verification Comparison"
          title="Traditional verification exposes personal data. Zero-knowledge verification does not."
          description="See exactly what the verifier receives in each model."
          centered
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard
            icon={<ShieldAlert className="h-5 w-5" />}
            title={landingContent.comparisonVisual.traditional.title}
            description={landingContent.comparisonVisual.traditional.lead}
          >
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
              <p className="text-sm font-semibold text-red-200">Verifier receives</p>
              <ul className="mt-2 grid gap-2 text-sm text-red-100">
                {landingContent.comparisonVisual.traditional.reveals.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ArrowDown className="h-3.5 w-3.5 rotate-[-45deg]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>

          <GlassCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title={landingContent.comparisonVisual.zkp.title}
            description={landingContent.comparisonVisual.zkp.lead}
          >
            <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-sm font-semibold text-cyan-100">Verifier receives</p>
              <ul className="mt-2 grid gap-2 text-sm text-cyan-50">
                {landingContent.comparisonVisual.zkp.reveals.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 rounded-xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="text-sm font-semibold text-purple-100">Verifier never sees</p>
              <ul className="mt-2 grid gap-2 text-sm text-purple-50">
                {landingContent.comparisonVisual.zkp.hidden.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ArrowDown className="h-3.5 w-3.5 rotate-45" />
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

      {/* ── CTAs ─────────────────────────────────────────────────── */}
      <section className="space-y-10">
        <SectionHeading
          eyebrow="Get Started"
          title="Try the prover and verifier workflows"
          description="Generate a proof from your document or verify a proof you've received."
          centered
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {landingContent.actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <ActionCard {...action} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
