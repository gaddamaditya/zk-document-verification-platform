import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck,
  Filter,
  Lock,
  Shield,
  ShieldCheck,
  User,
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
            Generate Proof
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
          <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Verify a Proof
          </span>
        </div>
        <VerifyProof />
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 max-w-5xl mx-auto">
      {/* ── Hero Section ────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-10 items-center pt-2 pb-8 border-b border-border">
        {/* Left Side Copy & CTAs */}
        <div className="flex flex-col gap-5 max-w-xl">
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
            className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl leading-[1.15]"
          >
            Verify documents. <br />
            Share only what <br />
            matters.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-base text-muted-foreground leading-relaxed max-w-lg"
          >
            Prove selected information from a document without sharing the original document.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="pt-2 flex flex-col sm:flex-row gap-3"
          >
            <Button
              size="lg"
              onClick={() => setRole('prover')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-5 rounded-xl shadow-xs gap-2 text-sm justify-center"
            >
              Generate Proof
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setRole('verifier')}
              className="border-border text-foreground hover:bg-muted font-semibold px-6 py-5 rounded-xl gap-2 text-sm justify-center"
            >
              Verify a Proof
              <Verified className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </Button>
          </motion.div>
        </div>

        {/* Right Side 3-Card Overlapping Composition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="relative w-full max-w-lg mx-auto py-8 px-4 flex items-center justify-center min-h-[320px]"
        >
          {/* Card 1: Aadhaar Card (Left / Back) */}
          <motion.div
            drag
            dragSnapToOrigin
            dragElastic={0.12}
            dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
            className="absolute top-2 left-2 sm:left-4 w-[210px] sm:w-[230px] rounded-xl border border-border bg-card p-3.5 shadow-sm transform -rotate-6 z-10 hover:z-30 cursor-grab active:cursor-grabbing transition-shadow"
          >
            <div className="flex justify-between items-start border-b border-border pb-2 mb-2.5">
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground block">Aadhaar</span>
                <span className="text-xs font-mono font-semibold text-foreground">XXXX XXXX 4821</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted/30 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground block">Holder</span>
                <span className="text-xs font-semibold text-foreground truncate block">Leo Das</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: PAN Card (Right / Back) */}
          <motion.div
            drag
            dragSnapToOrigin
            dragElastic={0.12}
            dragConstraints={{ left: -20, right: 20, top: -20, bottom: 20 }}
            className="absolute top-4 right-2 sm:right-4 w-[210px] sm:w-[230px] rounded-xl border border-border bg-card p-3.5 shadow-sm transform rotate-6 z-10 hover:z-30 cursor-grab active:cursor-grabbing transition-shadow"
          >
            <div className="flex justify-between items-start border-b border-border pb-2 mb-2.5">
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground block">PAN</span>
                <span className="text-xs font-mono font-semibold text-foreground">ABCDE1234F</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-8 shrink-0 items-center justify-center rounded border border-border bg-muted/30 text-muted-foreground">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground block">Holder</span>
                <span className="text-xs font-semibold text-foreground truncate block">Miles Morales</span>
              </div>
            </div>
          </motion.div>

          {/* Card 3: Proof Verified Card (Center / Front) */}
          <div className="relative z-20 w-[240px] sm:w-[260px] rounded-xl border border-border bg-card p-4 shadow-md mt-14 sm:mt-16 transition-shadow hover:shadow-lg">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-border">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <h4 className="text-xs font-bold text-foreground">Proof Verified</h4>
            </div>

            <ul className="space-y-1.5 text-xs font-medium text-foreground">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Name: Leo Das</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>Age ≥ 18</span>
              </li>
            </ul>

            <div className="border-t border-border mt-3 pt-2">
              <span className="text-[0.68rem] text-muted-foreground font-medium block">
                Generated moments ago
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Value Proposition Section ─────────────────────────── */}
      <section className="space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Share the proof, not the document.
          </h2>
          <p className="text-sm text-muted-foreground">
            Prove specific details from Aadhaar, PAN, or marksheets while your original file stays on your device.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary shrink-0" />
              PRIVATE
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">Your original document stays on your device.</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary shrink-0" />
              SELECTIVE
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">Choose exactly what you want to prove.</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary shrink-0" />
              VERIFIABLE
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">Anyone with the proof can verify it.</p>
          </div>
        </div>
      </section>

      {/* ── How It Works Section ─────────────────────────────── */}
      <section className="space-y-8 pt-2">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">How It Works</h2>
          <p className="text-sm text-muted-foreground">Four simple steps to verify your document claims.</p>
        </div>

        {/* Desktop Horizontal Line Timeline */}
        <div className="hidden md:block relative max-w-4xl mx-auto">
          <div className="absolute top-5 left-[12%] right-[12%] h-px bg-border z-0" />
          <div className="grid grid-cols-4 gap-6 relative z-10">
            {[
              { step: '01', title: 'Upload document', desc: 'Select your Aadhaar, PAN, or marksheet locally.' },
              { step: '02', title: 'Choose what to prove', desc: 'Select the specific details to disclose.' },
              { step: '03', title: 'Generate proof', desc: 'Create a private verification proof.' },
              { step: '04', title: 'Share and verify', desc: 'Share your proof link or QR code for verification.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card font-bold text-foreground text-xs shadow-xs">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-foreground pt-1">{item.title}</h4>
                <p className="text-xs leading-5 text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="md:hidden relative max-w-sm mx-auto space-y-6 px-4">
          <div className="absolute left-7 top-4 bottom-4 w-px bg-border z-0" />
          {[
            { step: '01', title: 'Upload document', desc: 'Select your Aadhaar, PAN, or marksheet locally.' },
            { step: '02', title: 'Choose what to prove', desc: 'Select the specific details to disclose.' },
            { step: '03', title: 'Generate proof', desc: 'Create a private verification proof.' },
            { step: '04', title: 'Share and verify', desc: 'Share your proof link or QR code for verification.' },
          ].map((item) => (
            <div key={item.step} className="relative flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card font-bold text-foreground text-xs shadow-xs z-10">
                {item.step}
              </div>
              <div className="pt-0.5">
                <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                <p className="text-xs leading-5 text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported Documents Section ─────────────────────── */}
      <section className="space-y-6 pt-2">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Supported Documents</h2>
          <p className="text-sm text-muted-foreground">Verify identity and academic credentials seamlessly.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary shrink-0" />
              Aadhaar Card
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">
              Verify name, date of birth, age eligibility (18+), or gender while keeping your 12-digit Aadhaar number hidden.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              PAN Card
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">
              Confirm identity and name matching for financial or official checks without exposing full PAN details.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-primary shrink-0" />
              Academic Marksheet
            </h3>
            <p className="text-xs leading-5 text-muted-foreground">
              Prove degree qualifications, CGPA, graduation year, or result status without sharing your complete transcript file.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
