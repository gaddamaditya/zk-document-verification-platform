import { BadgeCheck, FileCheck2, Layers3, Lock, ShieldCheck, Workflow, Mail } from 'lucide-react';

export const landingContent = {
  hero: {
    eyebrow: 'Privacy-Preserving Document Verification',
    title: 'Verify Documents Without Revealing Sensitive Information',
    subtitle:
      'Prove facts such as age, identity, academic qualifications, and document authenticity without sharing the original document.',
    actions: [
      { label: 'Generate Proof', href: '/generate-proof', variant: 'default' as const },
      { label: 'Verify Proof', href: '/verify-proof', variant: 'outline' as const },
    ],
    infoCards: [
      {
        title: 'Supported Document Types',
        accent: 'cyan' as const,
        items: ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving Licence', 'Academic Certificate', 'Marksheet'],
      },
      {
        title: 'Supported Verification Claims',
        accent: 'purple' as const,
        items: ['Name Verification', 'Age Verification', 'Degree Verification', 'CGPA Verification', 'Result Verification', 'Identity Verification'],
      },
    ],
    stats: [
      { value: 'Private', label: 'Verification' },
      { value: 'No Document', label: 'Sharing' },
      { value: 'Multiple', label: 'Claims' },
      { value: 'Secure', label: 'Verification' },
    ],
  },
  explanation: {
    eyebrow: 'What is a ZKP?',
    title: 'A zero-knowledge proof lets one party prove a statement is true without revealing the underlying data.',
    description:
      'For document verification, that means a user can prove age, academic credentials, or certificate authenticity while the raw document remains private. Only the mathematical proof is shared.',
  },
  comparisonRows: [
    {
      label: 'Data shared with verifier',
      traditional: 'Full document or sensitive scans are uploaded.',
      zkp: 'Only a cryptographic proof and limited public inputs are shared.',
    },
    {
      label: 'Privacy risk',
      traditional: 'High risk of storage leaks, unnecessary retention, and over-collection.',
      zkp: 'The source document can stay local, reducing exposure dramatically.',
    },
    {
      label: 'Verification goal',
      traditional: 'Trust the copied document content and its custody chain.',
      zkp: 'Trust the proof that the claim is mathematically valid.',
    },
    {
      label: 'Best fit',
      traditional: 'Administrative workflows that require document inspection.',
      zkp: 'Privacy-sensitive contexts such as identity, credentials, and compliance.',
    },
  ],
  platformWorkflow: [
    'Upload Document',
    'Select Claims',
    'Generate Proof',
    'Verify Proof',
  ],
  comparisonVisual: {
    traditional: {
      title: 'Traditional Verification',
      lead: 'User uploads full document',
      reveals: ['Name', 'Date of Birth', 'Aadhaar Number', 'Address', 'Photograph'],
    },
    zkp: {
      title: 'Zero-Knowledge Verification',
      lead: 'User generates proof',
      reveals: ['Proof', 'Public Inputs'],
      hidden: ['Document', 'Aadhaar Number', 'Address', 'Date of Birth'],
    },
  },
  benefits: [
    {
      title: 'Selective disclosure',
      description: 'Reveal only the claim, not the document. This keeps private attributes private.',
      icon: Lock,
    },
    {
      title: 'Reduced data exposure',
      description: 'Minimize storage and transmission of raw documents in the verification flow.',
      icon: ShieldCheck,
    },
    {
      title: 'Mathematical trust',
      description: 'The verifier checks a proof rather than relying on manual inspection.',
      icon: BadgeCheck,
    },
    {
      title: 'Modern compliance fit',
      description: 'A stronger privacy posture aligns well with academic and policy-driven use cases.',
      icon: FileCheck2,
    },
  ],
  supportedDocuments: [
    {
      title: 'Aadhaar',
      verification: 'Identity and age-related claims',
    },
    {
      title: 'PAN',
      verification: 'Name consistency and identity matching',
    },
    {
      title: 'Passport',
      verification: 'Identity and date-of-birth verification',
    },
    {
      title: 'Driving Licence',
      verification: 'Name and age eligibility claims',
    },
    {
      title: 'Marksheet',
      verification: 'Result and score-based claims',
    },
    {
      title: 'Degree Certificate',
      verification: 'Degree and qualification authenticity',
    },
  ],
  verificationClaims: [
    'Name Match',
    'Age >= 18',
    'Gender',
    'Date of Birth',
    'Degree Verification',
    'CGPA Verification',
    'Result Verification',
    'Certificate Authenticity',
  ],
  workflow: [
    {
      number: '01',
      title: 'Upload your document',
      description: 'Select a PDF, PNG, or JPEG document to begin the proof generation process.',
    },
    {
      number: '02',
      title: 'Select claims to prove',
      description: 'Choose which facts about your document you want to verify without revealing the document itself.',
    },
    {
      number: '03',
      title: 'Generate proof',
      description: 'A cryptographic proof is generated that proves your selected claims are true.',
    },
    {
      number: '04',
      title: 'Share and verify',
      description: 'Download your proof files and share them with a verifier, who can confirm the claims without seeing your document.',
    },
  ],
  actions: [
    {
      title: 'Generate Proof',
      description: 'Upload a document, select claims, and generate a cryptographic proof that verifies facts without revealing the original.',
      href: '/generate-proof',
      cta: 'Start Proving',
      icon: Layers3,
      featured: true,
    },
    {
      title: 'Verify Proof',
      description: 'Upload proof files received from a prover and verify the claims without ever seeing the original document.',
      href: '/verify-proof',
      cta: 'Start Verifying',
      icon: ShieldCheck,
      featured: false,
    },
    {
      title: 'Contact',
      description: 'For project discussions, feedback, collaboration opportunities, or technical questions.',
      href: '/contact',
      cta: 'Contact',
      icon: Mail,
      featured: false,
    },
  ],
};