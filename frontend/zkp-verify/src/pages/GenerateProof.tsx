import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Download,
  FileText,
  FileUp,
  Loader2,
  QrCode as QrIcon,
  ShieldCheck,
  ShieldX,
  Upload,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_BASE_URL, getAppBaseUrl } from '@/config';

// Document-aware claim configurations
const AADHAAR_CLAIMS = [
  { id: 'name_verification', label: 'Verify Name', description: 'Prove identity name without revealing raw document text.', icon: ShieldCheck, attrKey: 'name' },
  { id: 'dob_verification', label: 'Verify Date of Birth', description: 'Prove birth date record validity.', icon: ShieldCheck, attrKey: 'dob' },
  { id: 'age_verification', label: 'Verify Age ≥ 18', description: 'Prove age is 18+ without disclosing birth date.', icon: ShieldCheck, attrKey: 'dob' },
  { id: 'gender_verification', label: 'Verify Gender', description: 'Prove gender record validity.', icon: ShieldCheck, attrKey: 'gender' },
  { id: 'document_number_verification', label: 'Verify Aadhaar Number', description: 'Prove document ID number validity.', icon: ShieldCheck, attrKey: 'aadhaarNumber' },
  { id: 'address_verification', label: 'Verify Address', description: 'Prove address record validity.', icon: ShieldCheck, attrKey: 'address' },
];

const MARKSHEET_CLAIMS = [
  { id: 'degree_verification', label: 'Verify Student Name', description: 'Prove student name on academic transcript.', icon: CheckCircle2, attrKey: 'studentName' },
  { id: 'dob_verification', label: 'Verify Date of Birth', description: 'Prove birth date on academic record.', icon: CheckCircle2, attrKey: 'dob' },
  { id: 'gender_verification', label: 'Verify Gender', description: 'Prove gender field validity.', icon: CheckCircle2, attrKey: 'gender' },
  { id: 'result_verification', label: 'Verify Result', description: 'Prove passing qualification status.', icon: CheckCircle2, attrKey: 'result' },
  { id: 'cgpa_verification', label: 'Verify Grade', description: 'Prove grade eligibility status.', icon: CheckCircle2, attrKey: 'grade' },
  { id: 'certificate_authenticity', label: 'Verify Grand Total', description: 'Prove total score validity.', icon: CheckCircle2, attrKey: 'grandTotal' },
  { id: 'percentage_verification', label: 'Verify Percentage', description: 'Prove percentage marks score.', icon: CheckCircle2, attrKey: 'grandTotal' },
  { id: 'cgpa_attribute_verification', label: 'Verify CGPA', description: 'Prove CGPA score requirement.', icon: CheckCircle2, attrKey: 'cgpa' },
  { id: 'qualification_verification', label: 'Verify Degree / Qualification', description: 'Prove degree or course qualification.', icon: CheckCircle2, attrKey: 'result' },
  { id: 'institution_verification', label: 'Verify Institution', description: 'Prove issuing university or board.', icon: CheckCircle2, attrKey: 'studentName' },
  { id: 'roll_number_verification', label: 'Verify Roll Number', description: 'Prove student roll or registration number.', icon: CheckCircle2, attrKey: 'documentNumber' },
];

/** Map ZKP engine claim names back to human-readable labels */
const ZKP_CLAIM_LABELS: Record<string, string> = {
  NAME: 'Name Verification',
  DOB: 'Date of Birth Verification',
  AGE_18_PLUS: 'Age ≥ 18 Verification',
  GENDER: 'Gender Verification',
  DOCUMENT_NUMBER: 'Document Number Verification',
  ADDRESS: 'Address Verification',
  STUDENT_NAME: 'Student Name Verification',
  RESULT: 'Academic Result Verification',
  GRADE: 'Grade Verification',
  GRAND_TOTAL: 'Grand Total Verification',
  PERCENTAGE: 'Percentage Verification',
  CGPA: 'CGPA Verification',
  DEGREE: 'Degree / Qualification Verification',
  INSTITUTION: 'Institution Verification',
  ROLL_NUMBER: 'Roll Number Verification',
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
    <div className={cn('rounded-xl border border-border bg-card p-6 shadow-xs', className)}>
      <div className="mb-5 border-b border-border pb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary shrink-0" />
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
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
  const [ocrData, setOcrData] = useState<{ documentType: string; attributes: Record<string, string> } | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Claim state
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  // Generate proof state
  const [generating, setGenerating] = useState(false);
  const [generateResult, setGenerateResult] = useState<{
    success: boolean;
    message: string;
    proofId?: string;
    fileId: string;
    claims: string[];
    pipelineClaim?: string;
    circuitName?: string;
  } | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Download state
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // QR Modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Document preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Authenticity verification state
  const [credentialFile, setCredentialFile] = useState<File | null>(null);
  const [authenticityLoading, setAuthenticityLoading] = useState(false);
  const [authenticityResult, setAuthenticityResult] = useState<{
    success: boolean;
    status: 'AUTHENTIC' | 'TAMPERED' | 'UNTRUSTED_ISSUER';
    issuer?: string;
    integrity?: string;
    signature?: string;
    message?: string;
    issuedAt?: string;
  } | null>(null);
  const [authenticityError, setAuthenticityError] = useState<string | null>(null);
  const credentialInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File) => {
    console.log('[UPLOAD] selected file:', file?.name);
    console.log('[UPLOAD] type:', file?.type);
    console.log('[UPLOAD] size:', file?.size);

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const validExts = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const isValidType = validTypes.includes(file.type) || validExts.includes(ext);

    if (!isValidType) {
      setUploadError('Invalid file type. Please upload a PDF, PNG, or JPEG document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10 MB limit. Please select a smaller file.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadResult(null);
    setUploadError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[UPLOAD] input change fired');
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setUploadResult(null);
    setUploadError(null);
    setOcrData(null);
    setOcrLoading(false);
    setOcrError(null);
    setSelectedClaims([]);
    setGenerateResult(null);
    setCredentialFile(null);
    setAuthenticityResult(null);
    setAuthenticityError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (credentialInputRef.current) credentialInputRef.current.value = '';
  };

  const handleCredentialSelected = (file: File) => {
    setCredentialFile(file);
    setAuthenticityResult(null);
    setAuthenticityError(null);
  };

  const clearCredential = () => {
    setCredentialFile(null);
    setAuthenticityResult(null);
    setAuthenticityError(null);
    if (credentialInputRef.current) credentialInputRef.current.value = '';
  };

  const verifyAuthenticity = async () => {
    if (!selectedFile || !credentialFile) return;
    setAuthenticityLoading(true);
    setAuthenticityError(null);
    setAuthenticityResult(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('credential', credentialFile);

      const url = `${API_BASE_URL}/api/verify-authenticity`;
      const res = await fetch(url, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok && !data.status) {
        setAuthenticityError(data.message || `Verification failed (HTTP ${res.status})`);
        return;
      }

      setAuthenticityResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setAuthenticityError(`Authenticity verification failed: ${message}`);
    } finally {
      setAuthenticityLoading(false);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('document', selectedFile);

      const url = `${API_BASE_URL}/api/upload`;
      let res = await fetch(url, { method: 'POST', body: formData });
      let data = await res.json();

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

  const isMarksheet = ocrData?.documentType === 'MARKSHEET';
  const claimOptions = isMarksheet ? MARKSHEET_CLAIMS : AADHAAR_CLAIMS;

  const isAttributeDetected = (attrKey: string) => {
    if (!ocrData || !ocrData.attributes) return true;
    const attrs = ocrData.attributes;
    if (attrKey === 'studentName') return Boolean(attrs.studentName || attrs.name);
    if (attrKey === 'cgpa') return Boolean(attrs.cgpa || attrs.grade);
    if (attrKey === 'aadhaarNumber') return Boolean(attrs.aadhaarNumber || attrs.documentNumber);
    if (attrKey === 'grandTotal') return Boolean(attrs.grandTotal || attrs.result || attrs.marks);
    if (attrKey === 'result') return Boolean(attrs.result || attrs.grade);
    if (attrKey === 'grade') return Boolean(attrs.grade || attrs.cgpa);
    return Boolean(attrs[attrKey]);
  };

  const toggleClaim = (id: string, available = true) => {
    if (!available) return;
    setSelectedClaims((current) =>
      current.includes(id) ? current.filter((claimId) => claimId !== id) : [...current, id],
    );
  };

  const selectAllClaims = () => {
    const available = claimOptions
      .filter((c) => isAttributeDetected(c.attrKey))
      .map((c) => c.id);
    setSelectedClaims(available);
  };

  const clearAllClaims = () => {
    setSelectedClaims([]);
  };

  const generateProof = async () => {
    const validClaims = selectedClaims.filter((claimId) => {
      const claim = claimOptions.find((c) => c.id === claimId);
      return claim ? isAttributeDetected(claim.attrKey) : false;
    });

    if (!uploadResult || validClaims.length === 0) return;
    setGenerating(true);
    setGenerateError(null);
    setGenerateResult(null);

    try {
      const url = `${API_BASE_URL}/api/generate-proof`;
      console.log(`[GenerateProof] Submitting generate-proof request to: ${url}`);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: uploadResult.id,
          claims: validClaims,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.error || data.message || `Request failed (HTTP ${res.status})`);
        return;
      }

      setGenerateResult(data);
    } catch (err: unknown) {
      const url = `${API_BASE_URL}/api/generate-proof`;
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[GenerateProof] Fetch failed for ${url}:`, err);
      setGenerateError(`Network error: Unable to reach backend at ${url} (${message}).`);
    } finally {
      setGenerating(false);
    }
  };

  const openQrModal = async () => {
    if (!generateResult?.proofId) return;
    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify-proof?proofId=${generateResult.proofId}`;
    try {
      const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 280, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' } });
      setQrDataUrl(dataUrl);
      setShowQrModal(true);
    } catch (err) {
      console.error('[QR] Failed to generate QR:', err);
    }
  };

  const copyVerifyLink = () => {
    if (!generateResult?.proofId) return;
    const baseUrl = getAppBaseUrl();
    const verifyUrl = `${baseUrl}/verify-proof?proofId=${generateResult.proofId}`;
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadFile = async (filename: string) => {
    setDownloadingFile(filename);

    try {
      const url = `${API_BASE_URL}/api/download/${filename}`;
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
      alert(message);
    } finally {
      setDownloadingFile(null);
    }
  };

  // Derived state
  const documentUploaded = !!uploadResult;
  const ocrReady = !!ocrData;
  const hasSelectedClaims = selectedClaims.length > 0;
  const proofGenerated = !!generateResult;
  const currentStep = !documentUploaded ? 1 : !ocrReady ? 2 : !hasSelectedClaims ? 3 : !proofGenerated ? 4 : 5;

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Subtitle */}
      <section className="max-w-4xl space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
        >
          Generate Proof
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-sm leading-6 text-muted-foreground max-w-2xl"
        >
          Choose the information you want to prove without sharing the full document.
        </motion.p>
      </section>

      {/* Workflow Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs"
      >
        <StepIndicator step={1} label="01 Document" active={currentStep === 1} completed={documentUploaded} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={2} label="02 Claims" active={currentStep === 2 || currentStep === 3} completed={ocrReady && hasSelectedClaims} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={3} label="03 Generate" active={currentStep === 4} completed={proofGenerated} />
        <div className="hidden h-px w-6 bg-border sm:block" />
        <StepIndicator step={4} label="04 Download" active={currentStep === 5} completed={false} />
      </motion.div>

      {/* ── Step 1: Upload Document ─────────────────────────────── */}
      <Panel
        title="Upload Document"
        description="PDF or supported image file (PNG, JPG)."
        icon={FileUp}
      >
        <input
          id="document-upload"
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="sr-only"
          onChange={handleInputChange}
        />

        <div
          className={cn(
            'rounded-lg border border-dashed p-6 text-center transition-colors select-none',
            dragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 bg-card',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
          <h4 className="text-sm font-bold text-foreground">Upload document</h4>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, PNG or JPEG up to 10 MB
          </p>

          {selectedFile ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground font-medium">
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="max-w-[200px] truncate">{selectedFile.name}</span>
              <span className="text-muted-foreground">· {formatBytes(selectedFile.size)}</span>
              <button
                type="button"
                onClick={clearFile}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <label
              htmlFor="document-upload"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
            >
              {selectedFile ? 'Change Document' : 'Choose Document'}
            </label>
            <Button
              type="button"
              size="sm"
              disabled={!selectedFile || uploading}
              onClick={uploadFile}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
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

      {/* ── Document Preview ─────────────────────────────────────── */}
      {selectedFile && previewUrl && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Panel
            title="Document Preview"
            description="Local preview of the selected document."
            icon={Eye}
          >
            {/* File metadata */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                <FileText className="h-3.5 w-3.5" />
                {selectedFile.type === 'application/pdf' ? 'PDF' : selectedFile.type.includes('png') ? 'PNG' : 'JPEG'}
              </div>
              <span className="text-sm font-medium text-foreground truncate max-w-[260px]">{selectedFile.name}</span>
              <span className="text-xs text-muted-foreground">({formatBytes(selectedFile.size)})</span>
            </div>

            {/* Preview area */}
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
              {selectedFile.type === 'application/pdf' ? (
                <>
                  <object
                    data={previewUrl}
                    type="application/pdf"
                    className="w-full"
                    style={{ height: '400px' }}
                  >
                    {/* Built-in fallback: displayed when browser cannot render the PDF */}
                    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-teal-600 dark:text-teal-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">PDF preview is not supported in this browser.</p>
                    </div>
                  </object>
                  <div className="border-t border-border bg-muted/40 px-4 py-2 text-center">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-medium"
                    >
                      Can't see the preview? Open PDF in a new tab
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center bg-muted/20 p-4">
                  <img
                    src={previewUrl}
                    alt={`Preview of ${selectedFile.name}`}
                    className="max-h-[400px] w-full rounded-lg object-contain"
                  />
                </div>
              )}
            </div>

            {/* Privacy note */}
            <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 text-xs text-muted-foreground leading-6">
              <ShieldCheck className="mb-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-teal-500" />
              Your original document is not shared with the verifier.
            </div>
          </Panel>
        </motion.div>
      )}

      {/* ── Document Authenticity (Optional Verification) ────────── */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Panel
            title="Document Authenticity"
            description="Verify document integrity and digital signatures."
            icon={ShieldCheck}
          >
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3.5 text-xs text-muted-foreground leading-6 mb-4">
              <ShieldCheck className="mb-0.5 mr-1.5 inline-block h-3.5 w-3.5 text-teal-500" />
              Upload the credential file to check that the file has not changed since issuance.
            </div>

            <input
              ref={credentialInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleCredentialSelected(f);
              }}
            />

            {credentialFile ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Issuer Credential</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 opacity-80">{credentialFile.name}</p>
                  </div>
                </div>
                <button type="button" onClick={clearCredential} className="rounded-full p-1 hover:bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 mb-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-teal-600 dark:text-teal-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-foreground">Issuer Credential</p>
                    <p className="text-xs text-muted-foreground">Upload the digitally signed credential associated with this document.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => credentialInputRef.current?.click()}>
                  Select Credential
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={!credentialFile || authenticityLoading}
              onClick={verifyAuthenticity}
              className="border-teal-500/30 text-teal-700 hover:bg-teal-500/10 dark:text-teal-300"
            >
              {authenticityLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Verifying Authenticity…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-1.5 text-teal-500" />
                  Verify Document Authenticity
                </>
              )}
            </Button>

            {/* Authenticity verification result */}
            {authenticityResult && authenticityResult.status === 'AUTHENTIC' && (
              <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-base font-bold text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  AUTHENTIC DOCUMENT
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Document integrity verified.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-500/20 bg-white/40 dark:bg-slate-900/40 p-3">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">Digital Signature</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      VALID
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-white/40 dark:bg-slate-900/40 p-3">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">Issuer</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{authenticityResult.issuer}</p>
                  </div>
                  {authenticityResult.issuedAt && (
                    <div className="rounded-xl border border-emerald-500/20 bg-white/40 dark:bg-slate-900/40 p-3">
                      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">Issued At</p>
                      <p className="mt-1 text-xs font-medium text-foreground">
                        {new Date(authenticityResult.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {authenticityResult && authenticityResult.status === 'TAMPERED' && (
              <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-base font-bold text-red-800 dark:text-red-200">
                  <ShieldX className="h-5 w-5 text-red-500" />
                  TAMPERED DOCUMENT
                </div>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Document integrity verification failed.
                </p>
                <div className="rounded-xl border border-red-500/20 bg-white/40 dark:bg-slate-900/40 p-3">
                  <p className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">Digital Signature</p>
                  <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <ShieldX className="h-3.5 w-3.5" />
                    INVALID
                  </p>
                </div>
              </div>
            )}

            {authenticityResult && authenticityResult.status === 'UNTRUSTED_ISSUER' && (
              <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-base font-bold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  UNTRUSTED ISSUER
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {authenticityResult.message || 'The document could not be verified against a trusted issuer.'}
                </p>
              </div>
            )}

            {authenticityError && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{authenticityError}</span>
              </div>
            )}
          </Panel>
        </motion.div>
      )}

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
                <span>Extracting document attributes using Tesseract OCR…</span>
              </div>
            )}

            {ocrError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{ocrError}</span>
              </div>
            )}

            {ocrData && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document Format:</span>
                    <span className="rounded-md border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                      {ocrData.documentType}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ocrData.attributes)
                      .filter(([key, value]) => key !== 'type' && Boolean(value))
                      .map(([key]) => (
                        <div key={`summary-${key}`} className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>{FIELD_LABELS[key] ?? key}</span>
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
        title="What would you like to verify?"
        description="Select the specific information you want to confirm without exposing the rest of your document."
        icon={ShieldCheck}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
            Format: {ocrData?.documentType || 'DOCUMENT'}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAllClaims} className="h-7 px-2.5 text-xs">
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAllClaims} className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {claimOptions.map((claim) => {
            const detected = isAttributeDetected(claim.attrKey);
            const selected = selectedClaims.includes(claim.id);

            return (
              <div
                key={claim.id}
                role="checkbox"
                aria-checked={selected}
                aria-disabled={!detected}
                tabIndex={detected ? 0 : -1}
                onClick={() => toggleClaim(claim.id, detected)}
                onKeyDown={(e) => {
                  if (detected && (e.key === ' ' || e.key === 'Enter')) {
                    e.preventDefault();
                    toggleClaim(claim.id, detected);
                  }
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-all select-none',
                  !detected
                    ? 'border-border bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed'
                    : selected
                      ? 'border-primary/50 bg-primary/5 text-foreground shadow-xs cursor-pointer'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/30 cursor-pointer',
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  disabled={!detected}
                  readOnly
                  tabIndex={-1}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 mt-0.5 shrink-0 accent-teal-600 dark:accent-teal-400 pointer-events-none"
                />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', selected ? 'text-foreground font-bold' : 'text-foreground')}>
                    {claim.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{claim.description}</p>
                  {!detected && (
                    <p className="text-[0.7rem] font-medium text-amber-600 dark:text-amber-400 mt-1">
                      Not detected in this document
                    </p>
                  )}
                </div>
              </div>
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
        icon={ShieldCheck}
      >
        <div>
          <Button
            disabled={!documentUploaded || !hasSelectedClaims || generating}
            onClick={generateProof}
            className="w-full justify-center sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-5 rounded-md"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Generating Proof…
              </>
            ) : (
              'Generate Proof'
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-bold text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Proof ready
              </div>
              {generateResult.proofId && (
                <span className="rounded-md border border-emerald-500/30 bg-white/60 dark:bg-slate-900/60 px-2.5 py-1 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-200">
                  Proof ID: {generateResult.proofId}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              Share the proof, not the document. Your selected details are verified while your raw document stays private.
            </p>

            <div className="mt-4 border-t border-emerald-500/20 pt-3">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2">
                Verified Claims:
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

            {/* ── Action Buttons ──────────────────────────────────────── */}
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-emerald-500/20 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadFile('proof.json')}
                className="bg-white/80 dark:bg-slate-900/80 hover:bg-white"
              >
                <Download className="h-3.5 w-3.5" />
                Download Proof
              </Button>

              {generateResult.proofId && (
                <Button
                  size="sm"
                  onClick={openQrModal}
                  className="bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-500 dark:hover:bg-teal-600"
                >
                  <QrIcon className="h-3.5 w-3.5" />
                  Show QR Code
                </Button>
              )}
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
          Share these proof files with the verifier or scan the QR code to verify online.
        </div>
      </Panel>

      {/* ── QR CODE MODAL ────────────────────────────────────────── */}
      {showQrModal && generateResult?.proofId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <QrIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="text-base font-bold text-foreground">Share Proof</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Scan this QR code to verify the proof directly in the browser.
            </p>

            {qrDataUrl && (
              <div className="flex justify-center rounded-xl border border-border bg-white p-4">
                <img src={qrDataUrl} alt="ZKP Verification QR Code" className="h-52 w-52" />
              </div>
            )}

            <div className="rounded-xl border border-border bg-muted/40 p-3 text-center">
              <p className="text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground">Proof ID</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-teal-700 dark:text-teal-300">
                {generateResult.proofId}
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={copyVerifyLink}
                className="w-full justify-center"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedLink ? 'Copied Link!' : 'Copy Link'}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowQrModal(false)}
                className="w-full justify-center bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
