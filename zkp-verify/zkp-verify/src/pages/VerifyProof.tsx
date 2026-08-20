import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileJson,
  FileUp,
  Loader2,
  QrCode,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';

function QrScannerModal({
  onClose,
  onScanSuccess,
}: {
  onClose: () => void;
  onScanSuccess: (proofId: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let html5Qrcode: Html5Qrcode | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        setError(null);
        setInitializing(true);
        html5Qrcode = new Html5Qrcode('qr-scanner-view');

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) return;

            let extractedId: string | null = null;

            if (decodedText.startsWith('http://') || decodedText.startsWith('https://') || decodedText.startsWith('/')) {
              try {
                const urlObj = new URL(decodedText, window.location.origin);
                extractedId = urlObj.searchParams.get('proofId') || urlObj.searchParams.get('proof');
                if (!extractedId && urlObj.pathname.includes('/verify')) {
                  const parts = urlObj.pathname.split('/');
                  const last = parts[parts.length - 1];
                  if (last && last.startsWith('ZK-')) {
                    extractedId = last;
                  }
                }
              } catch (e) {
                console.error('[QR Scanner] URL parse error:', e);
              }
            } else if (/^ZK-[A-F0-9]+$/i.test(decodedText.trim())) {
              extractedId = decodedText.trim();
            } else {
              const match = decodedText.match(/(?:proofId|proof)=([A-Za-z0-9\-]+)/i);
              if (match) {
                extractedId = match[1];
              }
            }

            if (extractedId) {
              isMounted = false;
              if (html5Qrcode && html5Qrcode.isScanning) {
                html5Qrcode
                  .stop()
                  .catch(() => {})
                  .finally(() => {
                    onScanSuccess(extractedId!);
                  });
              } else {
                onScanSuccess(extractedId);
              }
            } else {
              setError('Invalid verification QR code. Ensure it belongs to this ZKP app.');
            }
          },
          () => {
            // Ignore scan frame decode errors
          }
        );
        if (isMounted) setInitializing(false);
      } catch (err: any) {
        console.error('[QR Scanner] Error starting camera:', err);
        if (!isMounted) return;
        setInitializing(false);
        const errStr = String(err?.message || err || '');
        if (err?.name === 'NotAllowedError' || errStr.toLowerCase().includes('permission') || errStr.toLowerCase().includes('denied')) {
          setError('Camera permission is required to scan a QR code.');
        } else if (err?.name === 'NotFoundError' || errStr.toLowerCase().includes('not found')) {
          setError('Unable to access the camera.');
        } else {
          setError('Unable to access the camera. Please check browser permissions.');
        }
      }
    };

    const timer = setTimeout(startCamera, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5Qrcode && html5Qrcode.isScanning) {
        html5Qrcode.stop().catch((e) => console.error('[QR Scanner] Error stopping camera:', e));
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-foreground">Scan QR Code</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Point your camera at a ZKP proof verification QR code.
        </p>

        <div className="relative mx-auto w-full aspect-square max-w-[260px] overflow-hidden rounded-2xl bg-black border border-border flex items-center justify-center">
          <div id="qr-scanner-view" className="w-full h-full" />

          {initializing && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white text-xs gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              <span>Starting camera…</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        <div className="pt-1">
          <Button variant="outline" onClick={onClose} className="w-full justify-center">
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

type VerificationState = 'idle' | 'verifying' | 'valid' | 'invalid' | 'expired' | 'error';

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
  PERCENTAGE: 'Percentage Verification',
  CGPA: 'CGPA Verification',
  DEGREE: 'Degree / Qualification Verification',
  INSTITUTION: 'Institution Verification',
  ROLL_NUMBER: 'Roll Number Verification',
  DOCUMENT_NUMBER: 'Document Number Verification',
  ADDRESS: 'Address Verification',
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
  const [qrProofId, setQrProofId] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showQrScanner, setShowQrScanner] = useState(false);

  const allFilesSelected = files.proof && files.public;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const proofParam = params.get('proofId') || params.get('proof');
    if (proofParam) {
      loadProofById(proofParam);
    }
  }, []);

  const loadProofById = async (proofId: string) => {
    setVerificationState('verifying');
    setQrProofId(proofId);
    setQrError(null);

    try {
      const url = `${API_BASE_URL}/api/proof/${proofId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 410 || data.expired) {
          setQrError('This proof link has expired.');
          setVerificationState('expired');
        } else if (res.status === 404) {
          setQrError(`Proof ID "${proofId}" not found on server.`);
          setVerificationState('error');
        } else {
          setQrError(data.message || 'Unable to load proof data.');
          setVerificationState('error');
        }
        return;
      }

      const proofFile = new File([JSON.stringify(data.proof)], 'proof.json', { type: 'application/json' });
      const publicFile = new File([JSON.stringify(data.publicSignals)], 'public.json', { type: 'application/json' });

      setFiles({ proof: proofFile, public: publicFile });

      const formData = new FormData();
      formData.append('proof', proofFile);
      formData.append('public', publicFile);

      const verifyRes = await fetch(`${API_BASE_URL}/api/verify-proof`, {
        method: 'POST',
        body: formData,
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        setVerifiedClaims(verifyData.claims || data.claims || []);
        setVerificationState('valid');
      } else {
        setVerificationState('invalid');
      }
    } catch (err: any) {
      console.error('[VerifyProof] Error loading proof:', err);
      setVerificationState('error');
      const msg = err?.message || String(err || '');
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Load failed')) {
        setQrError('Unable to connect to verification server. Please check network connection or try again.');
      } else {
        setQrError('Failed to load proof data. Please try again.');
      }
    }
  };

  const setFile = (field: string, file: File) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
    setVerificationState('idle');
    setVerifiedClaims([]);
    setQrProofId(null);
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
    setQrProofId(null);
    setQrError(null);
  };

  const handleVerify = async () => {
    if (!files.proof || !files.public) return;
    setVerificationState('verifying');

    try {
      const formData = new FormData();
      formData.append('proof', files.proof);
      formData.append('public', files.public);

      const url = `${API_BASE_URL}/api/verify-proof`;
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
          Verify claims without accessing the original document. Scan a QR link or upload proof files manually.
        </motion.p>
      </section>

      {/* Progress steps */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', allFilesSelected ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>1</span>
          <span className="text-sm font-medium text-foreground">Upload / Load Proof</span>
        </div>
        <div className="h-px w-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', verificationState === 'verifying' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground')}>2</span>
          <span className="text-sm font-medium text-foreground">Verify</span>
        </div>
        <div className="h-px w-6 bg-border" />
        <div className="flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', verificationState === 'valid' || verificationState === 'invalid' || verificationState === 'expired' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')}>3</span>
          <span className="text-sm font-medium text-foreground">Result</span>
        </div>
      </div>

      {/* QR Banner if loaded via QR link */}
      {qrProofId && (
        <div className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-xs text-blue-800 dark:text-blue-200">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Loaded via QR / Proof Link: <strong className="font-mono">{qrProofId}</strong></span>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="h-6 px-2 text-xs">
            Clear
          </Button>
        </div>
      )}

      {/* ── Section 1: Upload Proof Package ─────────────────────────── */}
      <Panel
        title="Upload Proof Package"
        description="Select proof.json and public.json or scan a QR code directly."
        icon={FileUp}
      >
        {/* QR Code Action Option */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <QrCode className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Have a verifier QR code or proof link?</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowQrScanner(true)}
            className="gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400 font-semibold"
          >
            <QrCode className="h-3.5 w-3.5" />
            Scan QR Code
          </Button>
        </div>

        <div className="space-y-4">
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

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            disabled={!allFilesSelected || verificationState === 'verifying'}
            onClick={handleVerify}
            className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {verificationState === 'verifying' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying Proof…
              </>
            ) : (
              'Verify Proof'
            )}
          </Button>

          {(allFilesSelected || verificationState !== 'idle') && (
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </Panel>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <QrScannerModal
          onClose={() => setShowQrScanner(false)}
          onScanSuccess={(scannedProofId) => {
            setShowQrScanner(false);
            loadProofById(scannedProofId);
          }}
        />
      )}
      {/* ── Section 2: Verification Result ──────────────────────────── */}
      {verificationState !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Panel
            title="Verification Result"
            description="Cryptographic proof evaluation results."
            icon={ShieldCheck}
          >
            {verificationState === 'verifying' && (
              <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span>Evaluating Groth16 zero-knowledge proof against public inputs…</span>
              </div>
            )}

            {verificationState === 'expired' && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-2">
                <Clock className="mx-auto h-8 w-8 text-amber-500" />
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">PROOF EXPIRED</h3>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  This proof link ({qrProofId}) has expired and can no longer be verified.
                </p>
              </div>
            )}

            {verificationState === 'valid' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">VALID PROOF</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">
                      The cryptographic zero-knowledge proof was successfully verified.
                    </p>
                  </div>
                </div>

                {verifiedClaims.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Verified Claims:
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {verifiedClaims.map((claim) => (
                        <div key={claim} className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{CLAIM_LABELS[claim] ?? claim}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {verificationState === 'invalid' && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                  <ShieldX className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-red-900 dark:text-red-100">INVALID PROOF</h4>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    The zero-knowledge proof mathematical verification failed.
                  </p>
                </div>
              </div>
            )}

            {verificationState === 'error' && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-100">Verification Error</h4>
                  <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">{qrError || 'Could not complete verification process.'}</p>
                </div>
              </div>
            )}
          </Panel>
        </motion.div>
      )}
    </div>
  );
}
