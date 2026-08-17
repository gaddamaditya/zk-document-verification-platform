import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
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

// Document-aware claim configurations
const AADHAAR_CLAIMS = [
  { id: 'name_verification', label: 'Verify Name', description: 'Prove identity name without revealing raw document text.', icon: ShieldCheck, attrKey: 'name' },
  { id: 'dob_verification', label: 'Verify Date of Birth', description: 'Prove birth date record validity.', icon: ShieldCheck, attrKey: 'dob' },
  { id: 'age_verification', label: 'Verify Age ≥ 18', description: 'Prove age is 18+ without disclosing birth date.', icon: ShieldCheck, attrKey: 'dob' },
  { id: 'gender_verification', label: 'Verify Gender', description: 'Prove gender record validity.', icon: ShieldCheck, attrKey: 'gender' },
];

const MARKSHEET_CLAIMS = [
  { id: 'degree_verification', label: 'Verify Student Name', description: 'Prove student name on academic transcript.', icon: CheckCircle2, attrKey: 'studentName' },
  { id: 'gender_verification', label: 'Verify Gender', description: 'Prove gender field validity.', icon: CheckCircle2, attrKey: 'gender' },
  { id: 'result_verification', label: 'Verify Result', description: 'Prove passing qualification status.', icon: CheckCircle2, attrKey: 'result' },
  { id: 'cgpa_verification', label: 'Verify Grade', description: 'Prove grade eligibility status.', icon: CheckCircle2, attrKey: 'grade' },
  { id: 'certificate_authenticity', label: 'Verify Grand Total', description: 'Prove total score validity.', icon: CheckCircle2, attrKey: 'grandTotal' },
  { id: 'cgpa_attribute_verification', label: 'Verify CGPA', description: 'Prove CGPA score requirement.', icon: CheckCircle2, attrKey: 'cgpa' },
];

/** Map ZKP engine claim names back to human-readable labels */
const ZKP_CLAIM_LABELS: Record<string, string> = {
  NAME: 'Name Verification',
  DOB: 'Date of Birth Verification',
  AGE_18_PLUS: 'Age ≥ 18 Verification',
  GENDER: 'Gender Verification',
  STUDENT_NAME: 'Student Name Verification',
  RESULT: 'Academic Result Verification',
  GRADE: 'Grade Verification',
  GRAND_TOTAL: 'Grand Total Verification',
  CGPA: 'CGPA Verification',
  MULTI_ATTRIBUTE: 'Multi-Attribute Verification',
  AADHAAR_MULTI_ATTRIBUTE: 'Aadhaar Multi-Attribute Verification',
  MARKSHEET_MULTI_ATTRIBUTE: 'Marksheet Multi-Attribute Verification',
};

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
    <div className={cn('rounded-2xl border border-border bg-card p-6 shadow-sm', className)}>
      <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-400">
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

const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  studentName: 'Student Name',
  dob: 'Date of Birth',
  gender: 'Gender',
  result: 'Result',
  grade: 'Grade',
  grandTotal: 'Grand Total',
  cgpa: 'CGPA',
  fatherName: 'Father Name',
  motherName: 'Mother Name',
  aadhaarNumber: 'Aadhaar Number',
  address: 'Address',
  documentNumber: 'Document Number',
};

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
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-colors',
          completed
            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
            : active
              ? 'border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-300'
              : 'border-border bg-muted/50 text-muted-foreground',
        )}
      >
        {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span className={cn('text-sm font-medium', active || completed ? 'text-foreground font-semibold' : 'text-muted-foreground')}>{label}</span>
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

  // Download state
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

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
    setSelectedClaims([]);
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

      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          body: formData,
        });
      } catch (networkErr) {
        const message = networkErr instanceof Error ? networkErr.message : 'Unknown error';
        setUploadError(
          `Could not connect to the server. Make sure the backend is running at ${API_BASE_URL}. (${message})`
        );
        return;
      }

      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        setUploadError(`Invalid response from server (HTTP ${res.status}).`);
        return;
      }

      if (!res.ok) {
        setUploadError((data.error as string) || `Upload failed (HTTP ${res.status})`);
        return;
      }

      const uploadedFile = data.file as UploadMeta;
      setUploadResult(uploadedFile);

      fetchOcr(uploadedFile.id).catch((err) => {
        console.warn('[GenerateProof] OCR auto-extraction failed:', err);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setUploadError(`Upload error: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchOcr = async (fileId: string) => {
    setOcrLoading(true);
    setOcrError(null);
    setOcrData(null);
    setSelectedClaims([]);

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

  const toggleClaim = (id: string, available: boolean) => {
    if (!available) return;
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
        setGenerateError(data.error || data.message || `Request failed (HTTP ${res.status})`);
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

  const handleDownloadFile = async (filename: string) => {
    setDownloadingFile(filename);

    try {
      const url = `${API_BASE_URL}/api/download/${filename}`;
      console.log(`[GenerateProof] Downloading file from: ${url}`);

      const res = await fetch(url);
      if (!res.ok) {
        let errorMsg = `Download failed (HTTP ${res.status})`;
        try {
          const errData = await res.json();
          if (errData.message) errorMsg = errData.message;
        } catch {}
        alert(errorMsg);
        return;
      }

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Download failed';
      console.error('[GenerateProof] Download error:', err);
      alert(message);
    } finally {
      setDownloadingFile(null);
    }
  };

  // Determine active claim options based on detected document type
  const isMarksheet = ocrData?.documentType === 'MARKSHEET';
  const claimOptions = isMarksheet ? MARKSHEET_CLAIMS : AADHAAR_CLAIMS;

  // Check whether an attribute is detected in OCR
  const isAttributeDetected = (attrKey: string) => {
    if (!ocrData || !ocrData.attributes) return true; // Default enabled before OCR completes
    const attrs = ocrData.attributes;
    if (attrKey === 'studentName') return Boolean(attrs.studentName || attrs.name);
    if (attrKey === 'cgpa') return Boolean(attrs.cgpa || attrs.grade);
    return Boolean(attrs[attrKey]);
  };

  // Derived state
  const documentUploaded = !!uploadResult;
  const ocrReady = !!ocrData;
  const hasSelectedClaims = selectedClaims.length > 0;
  const proofGenerated = !!generateResult;
  const currentStep = !documentUploaded ? 1 : !ocrReady ? 2 : !hasSelectedClaims ? 3 : !proofGenerated ? 4 : 5;

  return (
    <div className="space-y-8 pb-16">
      {/* Hero */}
      <section className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-300"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Prover Workflow
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          Prove a Claim
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-base leading-7 text-muted-foreground"
        >
          Generate a privacy-preserving zero-knowledge proof from your document without revealing sensitive information.
        </motion.p>
      </section>

      {/* Progress steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-4 sm:gap-6 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs"
      >
        <StepIndicator step={1} label="Upload" active={currentStep === 1} completed={documentUploaded} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={2} label="OCR Results" active={currentStep === 2} completed={ocrReady} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={3} label="Select Claims" active={currentStep === 3} completed={ocrReady && hasSelectedClaims} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={4} label="Generate" active={currentStep === 4} completed={proofGenerated} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={5} label="Download" active={currentStep === 5} completed={false} />
      </motion.div>

      {/* ── Step 1: Upload Document ─────────────────────────────── */}
      <Panel
        title="Upload Document"
        description="PDF or supported image file (PNG, JPG)."
        icon={FileUp}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={handleInputChange}
        />

        <div
          className={cn(
            'rounded-2xl border-2 border-dashed bg-muted/30 px-6 py-10 text-center transition-colors',
            dragOver
              ? 'border-teal-500 bg-teal-500/5'
              : 'border-border hover:border-teal-500/50 hover:bg-muted/50',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-teal-600 dark:text-teal-400 shadow-xs">
            <Upload className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-foreground">Upload your document</h4>
          <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
            Supports PDF, PNG, and JPEG files up to 10 MB.
          </p>

          {selectedFile && (
            <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs text-teal-700 dark:text-teal-300 font-medium">
              <FileUp className="h-3.5 w-3.5" />
              <span className="max-w-[200px] truncate">{selectedFile.name}</span>
              <span className="text-muted-foreground">({formatBytes(selectedFile.size)})</span>
              <button type="button" onClick={clearFile} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Choose Document
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!selectedFile || uploading}
              onClick={uploadFile}
              className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading…
                </>
              ) : (
                'Upload & Process'
              )}
            </Button>
          </div>
        </div>

        {uploadResult && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Document uploaded successfully — {uploadResult.originalName} ({formatBytes(uploadResult.size)})
          </div>
        )}

        {uploadError && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </Panel>

      {/* ── Step 2: OCR Results ─────────────────────────────────── */}
      {documentUploaded && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Panel
            title="OCR Results"
            description="Information extracted from the uploaded document."
            icon={FileText}
          >
            {ocrLoading && (
              <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                <span>Extracting document information…</span>
              </div>
            )}

            {ocrError && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p>{ocrError}</p>
                  <p className="mt-1 text-xs opacity-80">You can still proceed with claim selection.</p>
                </div>
              </div>
            )}

            {ocrData && (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  <FileText className="h-3.5 w-3.5" />
                  {ocrData.documentType}
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Extracted Attributes
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(ocrData.attributes)
                      .filter(([key, value]) => key !== 'type' && Boolean(value))
                      .map(([key]) => (
                        <div key={`summary-${key}`} className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{FIELD_LABELS[key] ?? key} Detected</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(ocrData.attributes)
                    .filter(([key, value]) => key !== 'type' && Boolean(value))
                    .map(([key]) => (
                      <div
                        key={key}
                        className="rounded-xl border border-border bg-card p-3.5 shadow-xs"
                      >
                        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">
                          {FIELD_LABELS[key] ?? key}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Detected ✓
                        </p>
                      </div>
                    ))}
                </div>

                <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 text-xs text-muted-foreground leading-6">
                  <ShieldCheck className="mb-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-teal-500" />
                  Sensitive fields are masked for privacy. This panel is informational only and does not affect proof generation.
                </div>
              </div>
            )}
          </Panel>
        </motion.div>
      )}

      {/* ── Step 3: Select Claims ───────────────────────────────── */}
      <Panel
        title="Claims available for this document"
        description="Select any combination of attributes to generate a unified zero-knowledge proof."
        icon={ShieldCheck}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Detected Format: {ocrData?.documentType || 'DOCUMENT'}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {claimOptions.map((claim) => {
            const detected = isAttributeDetected(claim.attrKey);
            const selected = selectedClaims.includes(claim.id);
            const Icon = claim.icon;

            return (
              <button
                key={claim.id}
                type="button"
                disabled={!detected}
                onClick={() => toggleClaim(claim.id, detected)}
                className={cn(
                  'flex w-full items-start justify-between rounded-xl border p-4 text-left transition-all',
                  !detected
                    ? 'border-border bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed'
                    : selected
                      ? 'border-teal-500/50 bg-teal-500/10 text-foreground shadow-xs'
                      : 'border-border bg-card text-muted-foreground hover:border-border hover:bg-muted/50',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border mt-0.5',
                    !detected
                      ? 'bg-muted text-muted-foreground'
                      : selected
                        ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30'
                        : 'bg-muted/50 text-muted-foreground'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', selected ? 'text-foreground font-bold' : 'text-foreground')}>{claim.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{claim.description}</p>
                    {!detected && (
                      <p className="text-[0.7rem] font-medium text-amber-600 dark:text-amber-400 mt-1">
                        Not detected in this document
                      </p>
                    )}
                  </div>
                </div>
                {selected && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 ml-2" />}
              </button>
            );
          })}
        </div>

        {selectedClaims.length > 0 && (
          <div className="mt-4 rounded-xl border border-teal-500/30 bg-teal-500/5 p-3.5 text-xs text-foreground font-medium flex items-center justify-between">
            <div>
              <span className="font-bold text-teal-600 dark:text-teal-400">{selectedClaims.length}</span> claim{selectedClaims.length !== 1 && 's'} selected
            </div>
            <span className="text-muted-foreground text-[0.75rem]">One proof will verify all selected claims.</span>
          </div>
        )}
      </Panel>

      {/* ── Step 4: Generate Proof ──────────────────────────────── */}
      <Panel
        title="Generate Proof"
        description="Compute a zero-knowledge proof for your selected claims."
        icon={Zap}
      >
        <div>
          <Button
            disabled={!documentUploaded || !hasSelectedClaims || generating}
            onClick={generateProof}
            className="w-full justify-center sm:w-auto bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Proof…
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
          <p className="mt-2.5 text-xs text-muted-foreground">Upload a document first to proceed.</p>
        )}
        {documentUploaded && !hasSelectedClaims && (
          <p className="mt-2.5 text-xs text-muted-foreground">Select at least one claim to proceed.</p>
        )}

        {generating && (
          <div className="mt-4 rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Preparing document attributes</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Generating witness</span>
            </div>
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-300 font-medium">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Creating zero-knowledge proof…</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground ml-1 mr-1" />
              <span>Finalizing proof package</span>
            </div>
          </div>
        )}

        {generateResult && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-2 text-base font-bold text-emerald-800 dark:text-emerald-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Proof Generated Successfully
            </div>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
              Your claim has been converted into a zero-knowledge proof without revealing your original document.
            </p>
            <div className="mt-4 border-t border-emerald-500/20 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                Included Claims:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {generateResult.claims.map((claimId) => {
                  const label = ZKP_CLAIM_LABELS[claimId] ?? claimOptions.find((c) => c.id === claimId)?.label ?? claimId;
                  return (
                    <div key={claimId} className="flex items-center gap-2 text-xs font-medium text-emerald-900 dark:text-emerald-100">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {generateError && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{generateError}</span>
          </div>
        )}
      </Panel>

      {/* ── Step 5: Download Proof Package ────────────────────────── */}
      <Panel
        title="Download Proof Package"
        description="Share these proof files with the verifier."
        icon={Download}
      >
        <div className="space-y-3">
          {[
            { filename: 'proof.json', label: 'Proof', desc: 'proof.json (Cryptographic proof file)' },
            { filename: 'public.json', label: 'Public Signals', desc: 'public.json (Public claim parameters)' }
          ].map((item) => (
            <div
              key={item.filename}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={generateResult === null || downloadingFile === item.filename}
                onClick={() => handleDownloadFile(item.filename)}
              >
                {downloadingFile === item.filename ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Downloading…
                  </>
                ) : (
                  'Download'
                )}
              </Button>
            </div>
          ))}
        </div>

        {selectedClaims.length > 0 && (
          <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Included Claims</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {selectedClaims.map((claimId) => {
                const claim = claimOptions.find((c) => c.id === claimId);
                return (
                  <div key={claimId} className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                    <span>{claim?.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 text-xs text-muted-foreground leading-6">
          <ShieldCheck className="mb-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-teal-500" />
          Share these proof files with the verifier.
        </div>
      </Panel>
    </div>
  );
}
