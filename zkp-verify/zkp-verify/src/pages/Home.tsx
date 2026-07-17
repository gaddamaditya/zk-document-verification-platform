import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  BookOpenText,
  FileText,
  IdCard,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

import {
  ActionCard,
  GlassCard,
  LandingHero,
  SectionHeading,
} from '@/components/landing/LandingSections';
import { landingContent } from '@/content/landing';

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
          title="Verify Your Documents in Four Simple Steps"
          description="Generate privacy-preserving proofs from your documents and share only the information required for verification."
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
