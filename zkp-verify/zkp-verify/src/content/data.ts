import { Shield, Fingerprint, Search, LockKeyhole, FileText, CheckCircle2, Cpu } from "lucide-react";

export const homeContent = {
  hero: {
    title: "Privacy-Preserving Document Verification",
    subtitle: "Prove facts about your documents without revealing the documents themselves. A zero-knowledge cryptography research platform.",
  },
  whatIsZKP: {
    title: "The Zero-Knowledge Paradigm",
    description: "Traditional verification requires handing over sensitive documents—passports, bank statements, degrees—exposing you to identity theft and data breaches. Zero-Knowledge Proofs (ZKPs) allow a Prover to cryptographically convince a Verifier that a claim is true without revealing any underlying data.",
  },
  features: [
    {
      id: "f1",
      icon: LockKeyhole,
      title: "Absolute Privacy",
      description: "Documents never leave your local device. The proof generation happens client-side, ensuring raw data is never exposed.",
    },
    {
      id: "f2",
      icon: Shield,
      title: "Cryptographic Certainty",
      description: "Mathematical guarantees ensure that proofs cannot be forged. Verifiers get 100% certainty of the claim's validity.",
    },
    {
      id: "f3",
      icon: Search,
      title: "Selective Disclosure",
      description: "Prove only what is necessary. For example, prove you are over 18 without revealing your exact date of birth or name.",
    }
  ],
  claimTypes: [
    { name: "Age Verification", icon: Fingerprint, detail: "Prove age ≥ 18 without revealing DOB." },
    { name: "Academic Result Verification", icon: FileText, detail: "Prove academic results without exposing full transcripts." },
    { name: "Degree Verification", icon: CheckCircle2, detail: "Prove degree possession without exposing the certificate." }
  ],
  actions: [
    {
      title: "Generate Proof",
      description: "Upload a document locally, select a claim to prove, and generate a zk-SNARK proof.",
      link: { href: "/generate-proof", label: "Start Proving" }
    },
    {
      title: "Verify Proof",
      description: "Act as a Verifier. Upload a proof and public inputs to cryptographically verify a claim.",
      link: { href: "/verify-proof", label: "Start Verifying" }
    },
    {
      title: "Understand the Math",
      description: "Dive into the mechanics of zk-SNARKs, polynomial commitments, and circuit design.",
      link: { href: "/how-zkp-works", label: "Read Documentation" }
    }
  ]
};

export const generateProofContent = {
  title: "Generate Zero-Knowledge Proof",
  subtitle: "Create a cryptographic proof locally on your device. Your document never touches a server.",
  steps: ["Upload Document", "Extract Data", "Select Claim", "Generate Proof"],
  claims: [
    { id: "name_verification", label: "Name Verification" },
    { id: "age_verification", label: "Age ≥ 18 Verification" },
    { id: "gender_verification", label: "Gender Verification" },
    { id: "dob_verification", label: "Date of Birth Verification" },
    { id: "result_verification", label: "Academic Result Verification" },
    { id: "cgpa_verification", label: "CGPA Verification" },
    { id: "degree_verification", label: "Degree Verification" },
    { id: "certificate_authenticity", label: "Certificate Authenticity" }
  ]
};

export const verifyProofContent = {
  title: "Verify Zero-Knowledge Proof",
  subtitle: "Validate a claim without seeing the underlying document. Requires proof.json, public.json, and verification_key.json.",
};

export const howItWorksContent = {
  title: "How ZKP Works",
  subtitle: "A step-by-step breakdown of the zero-knowledge document verification process.",
  pipeline: [
    {
      id: 1,
      title: "Local Document Parsing (OCR)",
      description: "The user selects a document. A client-side OCR engine extracts text and structure locally. The raw document is immediately discarded from memory, leaving only the extracted key-value pairs.",
      icon: FileText
    },
    {
      id: 2,
      title: "Circuit Witness Generation",
      description: "The extracted data acts as private inputs (the 'witness') to an arithmetic circuit. The circuit encodes the logic of the claim (e.g., current_year - birth_year >= 18).",
      icon: Cpu
    },
    {
      id: 3,
      title: "zk-SNARK Proof Computation",
      description: "Using a proving key and the witness, the system generates a succinct cryptographic proof. This process involves polynomial commitments and elliptic curve pairings, outputting a tiny proof file.",
      icon: LockKeyhole
    },
    {
      id: 4,
      title: "Cryptographic Verification",
      description: "The Verifier receives the proof and public inputs (the claim itself). Using a public verification key, they run a mathematical check. If it passes, the claim is indisputably true.",
      icon: CheckCircle2
    }
  ]
};
