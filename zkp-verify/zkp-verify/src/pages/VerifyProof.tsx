import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileJson,
  FileUp,
  History,
  Loader2,
  QrCode,
  RotateCcw,
  ShieldCheck,
  ShieldX,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';
import {
  type VerificationRecord,
  getHistory,
  addRecord,
  clearHistory,
} from '@/services/verificationHistory';

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
  const [expiredAt, setExpiredAt] = useState<string | null>(null);

  // Verification history state
  const [history, setHistory] = useState<VerificationRecord[]>([]);
  // Per-attempt deduplication: unique ID per verification attempt
  const attemptIdRef = useRef<string>('');

  const refreshHistory = useCallback(() => {
    setHistory(getHistory());
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const allFilesSelected = files.proof && files.public;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const proofParam = params.get('proofId') || params.get('proof');
    if (proofParam) {
      loadProofById(proofParam);
    }
  }, []);

  const loadProofById = async (proofId: string) => {
    // Generate unique attempt ID for deduplication
    const currentAttemptId = `qr-${proofId}-${Date.now()}`;
    attemptIdRef.current = currentAttemptId;

    setVerificationState('verifying');
    setQrProofId(proofId);
    setQrError(null);

    try {
      const url = `${API_BASE_URL}/api/proof/${proofId}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 410 || data.expired) {
          setExpiredAt(data.expiredAt || null);
          setQrError('This proof has expired.');
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
        const resolvedClaims = verifyData.claims || data.claims || [];
        setVerifiedClaims(resolvedClaims);
        setVerificationState('valid');
        // Record valid verification in history
        addRecord({
          proofId,
          status: 'VALID',
          claims: resolvedClaims.map((c: string) => CLAIM_LABELS[c] ?? c),
          timestamp: new Date().toISOString(),
          circuitName: verifyData.circuitName || data.circuitName,
        }, currentAttemptId);
        refreshHistory();
      } else {
        setVerificationState('invalid');
        // Record invalid verification in history
        addRecord({
          proofId,
          status: 'INVALID',
          claims: (data.claims || []).map((c: string) => CLAIM_LABELS[c] ?? c),
          timestamp: new Date().toISOString(),
        }, currentAttemptId);
        refreshHistory();
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
    setExpiredAt(null);
  };

  const handleVerify = async () => {
    if (!files.proof || !files.public) return;

    // Generate unique attempt ID for deduplication
    const currentAttemptId = `manual-${Date.now()}`;
    attemptIdRef.current = currentAttemptId;

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
        const resolvedClaims = data.claims || [];
        setVerifiedClaims(resolvedClaims);
        setVerificationState('valid');
        // Record valid verification in history
        addRecord({
          proofId: qrProofId || null,
          status: 'VALID',
          claims: resolvedClaims.map((c: string) => CLAIM_LABELS[c] ?? c),
          timestamp: new Date().toISOString(),
          circuitName: data.circuitName,
        }, currentAttemptId);
        refreshHistory();
      } else {
        setVerificationState('invalid');
        // Record invalid verification in history
        addRecord({
          proofId: qrProofId || null,
          status: 'INVALID',
          claims: [],
          timestamp: new Date().toISOString(),
        }, currentAttemptId);
        refreshHistory();
      }
    } catch (err) {
      console.error(err);
      setVerificationState('error');
    }
  };

  return (
    <div className="space-y-8 pb-16">      {/* Header Section */}
      <section className="max-w-4xl space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
        >
          Verify a Proof
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-sm leading-6 text-muted-foreground max-w-2xl"
        >
          Check whether the shared document claims are valid.
        </motion.p>
      </section>

      {/* QR Banner if loaded via QR link */}
      {qrProofId && (
        <div className="flex items-center justify-between rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-xs text-teal-800 dark:text-teal-200">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Loaded via QR / Proof Link: <strong className="font-mono">{qrProofId}</strong></span>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="h-6 px-2 text-xs">
            Clear
          </Button>
        </div>
      )}

      {/* ── Verification Methods Grid ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          type="button"
          onClick={() => setShowQrScanner(true)}
          className="group flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-xl p-6 text-center transition-all duration-200 hover:shadow-xs hover:border-teal-500/50 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl border border-border bg-muted/40 flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:scale-105 transition-transform">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Scan QR Code</h3>
            <p className="text-xs text-muted-foreground">Scan the QR code provided by the document owner.</p>
          </div>
        </button>

        <div className="flex flex-col items-center justify-center gap-3 bg-card border border-border rounded-xl p-6 text-center">
          <div className="w-10 h-10 rounded-xl border border-border bg-muted/40 flex items-center justify-center text-teal-700 dark:text-teal-300">
            <FileUp className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">Upload Proof Files</h3>
            <p className="text-xs text-muted-foreground">Upload the proof files directly from your device.</p>
          </div>
        </div>
      </div>

      {/* ── Upload Proof Files Panel ───────────────────────────── */}
      <Panel
        title="Upload Proof Package"
        description="Select proof.json and public.json to verify document claims."
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
                Checking proof…
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
            description="Status of the verified document claims."
            icon={ShieldCheck}
          >
            {verificationState === 'verifying' && (
              <div className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span>Checking document verification proof…</span>
              </div>
            )}

            {verificationState === 'expired' && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center space-y-3">
                <Clock className="mx-auto h-10 w-10 text-amber-500" />
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  <Clock className="h-3 w-3" />
                  EXPIRED
                </div>
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">EXPIRED PROOF</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This proof link has expired.
                </p>
                {expiredAt && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300">
                    <p className="font-semibold">Expired:</p>
                    <p className="mt-0.5 font-mono">
                      {new Date(expiredAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {', '}
                      {new Date(expiredAt).toLocaleTimeString('en-IN', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                )}
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80">
                  For security and privacy, expired proofs cannot be retrieved or verified.
                </p>
                {qrProofId && (
                  <p className="text-[0.7rem] font-mono text-amber-700/60 dark:text-amber-400/60">
                    {qrProofId}
                  </p>
                )}
                <div className="pt-1">
                  <Button variant="outline" size="sm" onClick={reset} className="border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300">
                    Close
                  </Button>
                </div>
              </div>
            )}

            {verificationState === 'valid' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">Proof verified</h4>
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                      These claims were successfully verified.
                    </p>
                  </div>
                </div>

                {verifiedClaims.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Zero-Knowledge Verified Claims:
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

                {/* Privacy disclaimer */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-muted-foreground leading-6">
                  <ShieldCheck className="mb-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-emerald-500" />
                  The original document was <strong>not revealed</strong>. Only the mathematical proof of the selected claims was verified.
                </div>
              </div>
            )}

            {verificationState === 'invalid' && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                  <ShieldX className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-red-900 dark:text-red-100">INVALID PROOF</h4>
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
                      <ShieldX className="h-3 w-3" />
                      INVALID
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
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

      {/* ── Section 3: Verification History ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Panel
          title="Your recent verifications"
          description="Verifications completed in this browser."
          icon={History}
        >
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground mb-3">
                <History className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">No verification history yet.</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                Completed verifications will appear here automatically.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5 border',
                        record.status === 'VALID'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
                      )}
                    >
                      {record.status === 'VALID' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <ShieldX className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider',
                            record.status === 'VALID'
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
                          )}
                        >
                          {record.status === 'VALID' ? 'Verified' : 'Invalid'}
                        </span>
                        {record.circuitName && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground">
                            {record.circuitName}
                          </span>
                        )}
                      </div>
                      {record.claims.length > 0 && (
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {record.claims.join(' · ')}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.7rem] text-muted-foreground">
                        {record.proofId && (
                          <span className="font-mono font-medium">{record.proofId}</span>
                        )}
                        <span>
                          {new Date(record.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                          {', '}
                          {new Date(record.timestamp).toLocaleTimeString('en-IN', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Clear all verification history from this browser?')) {
                      clearHistory();
                      refreshHistory();
                    }
                  }}
                  className="gap-2 text-red-600 border-red-500/30 hover:bg-red-500/10 dark:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear History
                </Button>
              </div>
            </>
          )}

          {/* Privacy note */}
          <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5 text-xs text-muted-foreground leading-6">
            <ShieldCheck className="mb-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-blue-500" />
            Verification history is stored only in this browser and does not contain the original document or private document data.
          </div>
        </Panel>
      </motion.div>
    </div>
  );
}
