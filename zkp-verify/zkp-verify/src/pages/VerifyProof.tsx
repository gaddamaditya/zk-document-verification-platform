import { useRef, useState } from 'react';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  FileJson,
  FileUp,
  Loader2,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';

type VerificationState = 'idle' | 'verifying' | 'valid' | 'invalid' | 'error';

/** Map ZKP engine claim names to human-readable labels */
const CLAIM_LABELS: Record<string, string> = {
  NAME: 'Name Verification',
  AGE_18_PLUS: 'Age Verification (18+)',
  GENDER: 'Gender Verification',
  DOB: 'Date of Birth Verification',
  STUDENT_NAME: 'Student Name Verification',
  RESULT: 'Result Verification',
  GRADE: 'Grade Verification',
  GRAND_TOTAL: 'Grand Total Verification',
};

interface FileSlot {
  label: string;
  fieldName: string;
  description: string;
  icon: React.ElementType;
}

const fileSlots: FileSlot[] = [
  {
    label: 'proof.json',
    fieldName: 'proof',
    description: 'The zero-knowledge proof file provided by the prover.',
    icon: FileJson,
  },
  {
    label: 'public.json',
    fieldName: 'public',
    description: 'The public signals file provided by the prover.',
    icon: FileJson,
  },
];

function Panel({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-sm', className)}>
      <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FileUploadSlot({
  slot,
  file,
  onSelect,
  onClear,
}: {
  slot: FileSlot;
  file: File | null;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const Icon = slot.icon;

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onSelect(droppedFile);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />

      {file ? (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{slot.label}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 opacity-80">{file.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClear} className="rounded-full p-1 hover:bg-muted">
            <X className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            'rounded-xl border-2 border-dashed bg-muted/30 px-5 py-5 text-center transition-colors',
            dragOver
              ? 'border-blue-500 bg-blue-500/5'
              : 'border-border hover:border-blue-500/50 hover:bg-muted/50',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-blue-600 dark:text-blue-400">
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-foreground">{slot.label}</p>
                <p className="text-xs text-muted-foreground">{slot.description}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1" />
              Browse
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyProof() {
  const [files, setFiles] = useState<Record<string, File | null>>({
    proof: null,
    public: null,
  });
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verifiedClaims, setVerifiedClaims] = useState<string[]>([]);

  const allFilesSelected = files.proof && files.public;

  const setFile = (field: string, file: File) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    setVerificationState('idle');
    setVerifiedClaims([]);
  };

  const clearFile = (field: string) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setVerificationState('idle');
    setVerifiedClaims([]);
  };

  const reset = () => {
    setFiles({ proof: null, public: null });
    setVerificationState('idle');
    setVerifiedClaims([]);
  };

  const handleVerify = async () => {
    if (!files.proof || !files.public) return;
    setVerificationState('verifying');

    try {
      const formData = new FormData();
      formData.append('proof', files.proof);
      formData.append('public', files.public);

      const url = `${API_BASE_URL}/api/verify-proof`;
      console.log(`[VerifyProof] Verify Proof URL: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setVerificationState('error');
        return;
      }

      if (data.verified) {
        setVerifiedClaims(data.claims || []);
        setVerificationState('valid');
      } else {
        setVerificationState('invalid');
      }
    } catch (err) {
      console.error(err);
      setVerificationState('error');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero */}
      <section className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Verifier Workflow
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Verify a Proof
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-base leading-7 text-muted-foreground"
        >
          Verify claims without accessing the original document. Upload proof files received from a prover.
        </motion.p>
      </section>

      {/* Progress steps */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', allFilesSelected ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>1</span>
          <span className="text-sm font-medium text-foreground">Upload Proof</span>
        </div>
        <div className="h-px w-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', verificationState === 'verifying' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground')}>2</span>
          <span className="text-sm font-medium text-foreground">Verify</span>
        </div>
        <div className="h-px w-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', verificationState === 'valid' || verificationState === 'invalid' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>3</span>
          <span className="text-sm font-medium text-foreground">Result</span>
        </div>
      </div>

      {/* ── Section 1: Upload Proof Package ─────────────────────────── */}
      <Panel
        title="Upload Proof Package"
        description="Upload the proof and public files provided by the prover."
        icon={FileUp}
      >
        <div className="space-y-3">
          {fileSlots.map((slot) => (
            <FileUploadSlot
              key={slot.fieldName}
              slot={slot}
              file={files[slot.fieldName]}
              onSelect={(file) => setFile(slot.fieldName, file)}
              onClear={() => clearFile(slot.fieldName)}
            />
          ))}
        </div>

        {!allFilesSelected && (
          <p className="mt-3 text-xs text-muted-foreground">
            Upload both proof.json and public.json files to enable verification.
          </p>
        )}
      </Panel>

      {/* ── Section 2: Verify Proof ────────────────────────────────── */}
      <Panel
        title="Verify"
        description="Run zero-knowledge cryptographic verification."
        icon={ShieldCheck}
      >
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!allFilesSelected || verificationState === 'verifying'}
            onClick={handleVerify}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {verificationState === 'verifying' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Verifying…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify Proof
              </>
            )}
          </Button>
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </Panel>

      {/* ── Section 3: Verification Result ─────────────────────────── */}
      <Panel
        title="Verification Result"
        description="The result of the proof verification will appear here."
        icon={verificationState === 'valid' ? CheckCircle2 : verificationState === 'invalid' ? ShieldX : ShieldCheck}
      >
        {verificationState === 'valid' ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">✓ Proof Verified</h4>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  Cryptographic verification successful.
                </p>
              </div>
            </div>

            {verifiedClaims.length > 0 && (
              <div className="mt-4 border-t border-emerald-500/20 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Verified Claims
                </p>
                <div className="space-y-2">
                  {verifiedClaims.map((claim) => (
                    <div
                      key={claim}
                      className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-card p-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="text-sm font-semibold text-foreground">
                        {CLAIM_LABELS[claim] ?? claim}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : verificationState === 'invalid' ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/20 text-red-600 dark:text-red-400">
                <ShieldX className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-red-800 dark:text-red-200">✕ Proof Verification Failed</h4>
                <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                  Unable to verify this proof package. The proof parameters do not match or are invalid.
                </p>
              </div>
            </div>
          </div>
        ) : verificationState === 'error' ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>An error occurred during verification. Please try again.</span>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-muted/30 px-5 py-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground opacity-60" />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Awaiting verification
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload proof files and click Verify Proof to see the result.
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
