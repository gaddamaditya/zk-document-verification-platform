import { useRef, useState } from 'react';

import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Loader2,
  ShieldCheck,
  Upload,
  X,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/config';

const claimOptions = [
  { id: 'name_verification', label: 'Name Verification' },
  { id: 'age_verification', label: 'Age ≥ 18 Verification' },
  { id: 'gender_verification', label: 'Gender Verification' },
  { id: 'dob_verification', label: 'Date of Birth Verification' },
  { id: 'result_verification', label: 'Academic Result Verification' },
  { id: 'cgpa_verification', label: 'CGPA Verification' },
  { id: 'degree_verification', label: 'Degree Verification' },
  { id: 'certificate_authenticity', label: 'Certificate Authenticity' },
];

function Panel({
  title,
  description,
  icon: Icon,
  className = '',
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('rounded-[1.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_18px_70px_rgba(2,6,23,0.35)] backdrop-blur-xl', className)}>
      <div className="mb-5 flex items-start gap-3 border-b border-white/10 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────

interface UploadMeta {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  storedAs: string;
  uploadedAt: string;
}

interface OcrResult {
  documentType: string;
  attributes: Record<string, string>;
}

// ── Privacy masking utilities ──────────────────────────────────

/** Fields that must never be displayed */
const HIDDEN_FIELDS = new Set([
  'type',
  'fatherName',
  'motherName',
  'aadhaarNumber',
  'address',
  'documentNumber',
]);

/** Fields that should show only "Detected" status, not values */
const DETECTED_ONLY_FIELDS = new Set([
  'name',
  'studentName',
  'dob',
  'gender',
  'result',
  'grade',
  'grandTotal',
  'cgpa',
]);

/** Pretty labels for attribute keys */
const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  studentName: 'Student Name',
  dob: 'Date of Birth',
  gender: 'Gender',
  result: 'Result',
  grade: 'Grade',
  grandTotal: 'Grand Total',
  cgpa: 'CGPA',
};

function getDisplayValue(key: string, value: string): string {
  if (DETECTED_ONLY_FIELDS.has(key)) return 'Detected \u2713';
  return value;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ── Step indicator ──────────────────────────────────────────────

function StepIndicator({ step, label, active, completed }: { step: number; label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
          completed
            ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
            : active
              ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-200'
              : 'border-white/10 bg-white/5 text-slate-500',
        )}
      >
        {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span className={cn('text-sm font-medium', active || completed ? 'text-white' : 'text-slate-500')}>{label}</span>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────

export default function GenerateProof() {
  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadMeta | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // OCR state
  const [ocrData, setOcrData] = useState<OcrResult | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Claim state
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  // Generate proof state
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{ success: boolean; message: string; fileId: string; claims: string[] } | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
    setUploadError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelected(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadError(null);
    setOcrData(null);
    setOcrLoading(false);
    setOcrError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);

      const url = `${API_BASE_URL}/api/upload`;
      console.log(`[GenerateProof] Upload URL: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || `Upload failed (HTTP ${res.status})`);
        return;
      }

      const uploadedFile = data.file as UploadMeta;
      setUploadResult(uploadedFile);

      // Auto-trigger OCR extraction
      fetchOcr(uploadedFile.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setUploadError(`Network error: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchOcr = async (fileId: string) => {
    setOcrLoading(true);
    setOcrError(null);
    setOcrData(null);

    try {
      const url = `${API_BASE_URL}/api/ocr`;
      console.log(`[GenerateProof] OCR URL: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOcrError(data.message || `OCR failed (HTTP ${res.status})`);
        return;
      }

      setOcrData({ documentType: data.documentType, attributes: data.attributes });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setOcrError(`OCR extraction failed: ${message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  const toggleClaim = (id: string) => {
    setSelectedClaims((current) =>
      current.includes(id) ? current.filter((claimId) => claimId !== id) : [...current, id],
    );
  };

  const generateProof = async () => {
    if (!uploadResult || selectedClaims.length === 0) return;
    setGenerating(true);
    setGenerateError(null);
    setGenerateResult(null);

    try {
      const url = `${API_BASE_URL}/api/generate-proof`;
      console.log(`[GenerateProof] Generate Proof URL: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadResult.id,
          claims: selectedClaims,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.message || `Request failed (HTTP ${res.status})`);
        return;
      }

      setGenerateResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setGenerateError(`Network error: ${message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Derived state
  const documentUploaded = !!uploadResult;
  const ocrReady = !!ocrData;
  const hasSelectedClaims = selectedClaims.length > 0;
  const proofGenerated = !!generateResult;
  const currentStep = !documentUploaded ? 1 : !ocrReady ? 2 : !hasSelectedClaims ? 3 : !proofGenerated ? 4 : 5;

  return (
    <div className="space-y-8 pb-20">
      {/* Hero */}
      <section className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200"
        >
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          Prover Workflow
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl"
        >
          Generate Proof
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg"
        >
          Upload a document, select the claims you want to prove, and generate a zero-knowledge proof. The proof can be shared with a verifier without revealing your original document.
        </motion.p>
      </section>

      {/* Progress steps */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-6 rounded-[1.25rem] border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl"
      >
        <StepIndicator step={1} label="Upload Document" active={currentStep === 1} completed={documentUploaded} />
        <div className="hidden h-px w-8 bg-white/10 sm:block" />
        <StepIndicator step={2} label="OCR Results" active={currentStep === 2} completed={ocrReady} />
        <div className="hidden h-px w-8 bg-white/10 sm:block" />
        <StepIndicator step={3} label="Select Claims" active={currentStep === 3} completed={ocrReady && hasSelectedClaims} />
        <div className="hidden h-px w-8 bg-white/10 sm:block" />
        <StepIndicator step={4} label="Generate Proof" active={currentStep === 4} completed={proofGenerated} />
        <div className="hidden h-px w-8 bg-white/10 sm:block" />
        <StepIndicator step={5} label="Download Files" active={currentStep === 5} completed={false} />
      </motion.div>

      {/* ── Section 1: Upload Document ─────────────────────────────── */}
      <Panel
        title="Upload Document"
        description="Select a PDF, PNG, or JPEG document to begin."
        icon={FileUp}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleInputChange}
        />

        <div
          className={cn(
            'rounded-[1.25rem] border-2 border-dashed bg-slate-950/30 px-6 py-12 text-center transition-colors',
            dragOver
              ? 'border-cyan-400/50 bg-cyan-400/5'
              : 'border-white/10 hover:border-cyan-400/30 hover:bg-white/5',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-200">
            <Upload className="h-7 w-7" />
          </div>
          <h4 className="text-lg font-semibold text-white">Drag and drop your document</h4>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Supports PDF, PNG, and JPEG files up to 10 MB.
          </p>

          {/* Selected file chip */}
          {selectedFile && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              <FileUp className="h-4 w-4" />
              <span className="max-w-[200px] truncate">{selectedFile.name}</span>
              <span className="text-xs text-slate-400">({formatBytes(selectedFile.size)})</span>
              <button type="button" onClick={clearFile} className="ml-1 rounded-full p-0.5 hover:bg-white/10">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              Browse files
            </Button>
            <Button
              variant="outline"
              disabled={!selectedFile || uploading}
              onClick={uploadFile}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                'Upload Document'
              )}
            </Button>
          </div>
        </div>

        {/* Upload success */}
        {uploadResult && (
          <div className="mt-4 flex items-center gap-3 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Document uploaded — {uploadResult.originalName} ({formatBytes(uploadResult.size)})
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Privacy notice */}
        <div className="mt-4 rounded-[1rem] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs leading-6 text-cyan-50">
          <ShieldCheck className="mb-1 mr-2 inline-block h-3.5 w-3.5" />
          Your document is used only to generate a cryptographic proof. The original document is not intended to be permanently stored.
        </div>
      </Panel>

      {/* ── Section 2: OCR Results ─────────────────────────────────── */}
      {documentUploaded && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Panel
            title="OCR Results"
            description="Information extracted from the uploaded document."
            icon={FileText}
          >
            {/* Loading state */}
            {ocrLoading && (
              <div className="flex items-center gap-3 py-6 text-sm text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
                <span>Extracting document information…</span>
              </div>
            )}

            {/* Error state */}
            {ocrError && (
              <div className="flex items-start gap-3 rounded-[1.25rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p>{ocrError}</p>
                  <p className="mt-1 text-xs text-amber-300/70">You can still proceed with claim selection.</p>
                </div>
              </div>
            )}

            {/* OCR data display */}
            {ocrData && (
              <div className="space-y-4">
                {/* Document type badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <FileText className="h-3.5 w-3.5" />
                  {ocrData.documentType}
                </div>

                {/* Extracted Attributes summary */}
                <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-4">
                  <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Extracted Attributes
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(ocrData.attributes)
                      .filter(([key, value]) => !HIDDEN_FIELDS.has(key) && value)
                      .map(([key]) => (
                        <div key={`summary-${key}`} className="flex items-center gap-2 text-sm text-emerald-200">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                          <span>{FIELD_LABELS[key] ?? key} Detected</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Attributes grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(ocrData.attributes)
                    .filter(([key, value]) => !HIDDEN_FIELDS.has(key) && value)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                      >
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                          {FIELD_LABELS[key] ?? key}
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {getDisplayValue(key, value)}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Privacy notice */}
                <div className="rounded-[1rem] border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-xs leading-6 text-cyan-50">
                  <ShieldCheck className="mb-1 mr-2 inline-block h-3.5 w-3.5" />
                  Sensitive fields are masked for privacy. This panel is informational only and does not affect proof generation.
                </div>
              </div>
            )}
          </Panel>
        </motion.div>
      )}

      {/* ── Section 3: Select Claims ───────────────────────────────── */}
      <Panel
        title="Select Claims"
        description="Choose one or more claims you want to prove about your document."
        icon={ShieldCheck}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {claimOptions.map((claim) => {
            const selected = selectedClaims.includes(claim.id);
            return (
              <button
                key={claim.id}
                type="button"
                onClick={() => toggleClaim(claim.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors',
                  selected
                    ? 'border-cyan-400/30 bg-cyan-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
                )}
              >
                <span className="text-sm font-medium">{claim.label}</span>
                {selected && <CheckCircle2 className="h-4 w-4 text-cyan-200" />}
              </button>
            );
          })}
        </div>

        {selectedClaims.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
            <span className="font-semibold text-white">{selectedClaims.length}</span> claim{selectedClaims.length !== 1 && 's'} selected
          </div>
        )}
      </Panel>

      {/* ── Section 3: Generate Proof ──────────────────────────────── */}
      <Panel
        title="Generate Proof"
        description="Generate a zero-knowledge proof for your selected claims."
        icon={Zap}
      >
        <div className="mt-0">
          <Button
            disabled={!documentUploaded || !hasSelectedClaims || generating}
            onClick={generateProof}
            className="w-full justify-center sm:w-auto"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Generate Proof
              </>
            )}
          </Button>
        </div>

        {!documentUploaded && (
          <p className="mt-3 text-xs text-slate-500">Upload a document first to proceed.</p>
        )}
        {documentUploaded && !hasSelectedClaims && (
          <p className="mt-3 text-xs text-slate-500">Select at least one claim to proceed.</p>
        )}

        {/* Generate success */}
        {generateResult && (
          <div className="mt-4 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              {generateResult.message}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {generateResult.claims.map((claimId) => {
                const claim = claimOptions.find((c) => c.id === claimId);
                return (
                  <div key={claimId} className="flex items-center gap-2 text-sm text-emerald-100">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                    <span>{claim?.label ?? claimId}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate error */}
        {generateError && (
          <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{generateError}</span>
          </div>
        )}
      </Panel>

      {/* ── Section 4: Download Proof Files ────────────────────────── */}
      <Panel
        title="Download Proof Files"
        description="Once proof generation is available, your proof files will appear here for download."
        icon={Download}
      >
        <div className="space-y-3">
          {['proof.json', 'public.json', 'verification_key.json'].map((file) => (
            <div
              key={file}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-400">{file}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={generateResult === null}
                onClick={() => {
                  let url = '';
                  if (file === 'proof.json') {
                    url = `${API_BASE_URL}/api/download/proof`;
                  } else if (file === 'public.json') {
                    url = `${API_BASE_URL}/api/download/public`;
                  } else if (file === 'verification_key.json') {
                    url = `${API_BASE_URL}/api/download/verification-key`;
                  }
                  console.log("Downloading:", url);
                  window.open(url, '_blank');
                }}
              >
                Download
              </Button>
            </div>
          ))}
        </div>

        {selectedClaims.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Included Claims</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedClaims.map((claimId) => {
                const claim = claimOptions.find((c) => c.id === claimId);
                return (
                  <div key={claimId} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
                    <span>{claim?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button href="/verify-proof" variant="outline" className="justify-between">
            Go to Verify Proof
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Panel>
    </div>
  );
}
