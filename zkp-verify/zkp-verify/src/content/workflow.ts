import { FileScan, Fingerprint, Hash, KeyRound, LockKeyhole, ScrollText, Sigma, Workflow } from 'lucide-react';

export const workflowStages = [
  {
    step: '01',
    title: 'Document',
    description: 'A source document is prepared locally before any proof-related processing begins.',
    icon: ScrollText,
  },
  {
    step: '02',
    title: 'OCR',
    description: 'Optical character recognition extracts machine-readable text from the document image or PDF.',
    icon: FileScan,
  },
  {
    step: '03',
    title: 'Attribute Extraction',
    description: 'Relevant fields such as age, identity, or credential properties are isolated from the OCR output.',
    icon: Fingerprint,
  },
  {
    step: '04',
    title: 'Circuit Inputs',
    description: 'Private and public values are organized into the inputs expected by the Circom circuit.',
    icon: KeyRound,
  },
  {
    step: '05',
    title: 'Witness Generation',
    description: 'snarkjs computes the witness from the circuit inputs, creating the hidden values needed for proof generation.',
    icon: Workflow,
  },
  {
    step: '06',
    title: 'Groth16 Proof Generation',
    description: 'The witness is transformed into a compact Groth16 proof that can be verified without exposing the source data.',
    icon: LockKeyhole,
  },
  {
    step: '07',
    title: 'Proof Verification',
    description: 'The verifier checks the proof against the public inputs and verification key to confirm validity.',
    icon: Sigma,
  },
];

export const cryptographicConcepts = [
  {
    title: 'OCR',
    description: 'Converts document pixels into text so the application can work with structured content.',
    icon: FileScan,
  },
  {
    title: 'Circom',
    description: 'Defines the arithmetic circuit that encodes the claim logic and proof constraints.',
    icon: Workflow,
  },
  {
    title: 'Groth16',
    description: 'A succinct zk-SNARK proving system used to create compact proofs for verification.',
    icon: LockKeyhole,
  },
  {
    title: 'snarkjs',
    description: 'JavaScript tooling that generates witnesses, builds proofs, and runs local verification flows.',
    icon: KeyRound,
  },
  {
    title: 'Poseidon Hash',
    description: 'A zk-friendly hash function often used inside circuits to compress values efficiently.',
    icon: Hash,
  },
  {
    title: 'Witness',
    description: 'The private assignment to the circuit that demonstrates the claim without revealing secret inputs.',
    icon: Fingerprint,
  },
  {
    title: 'Public Inputs',
    description: 'Values that are visible to the verifier and used to check the proof.',
    icon: ScrollText,
  },
  {
    title: 'Private Inputs',
    description: 'Sensitive values that remain hidden while still participating in the proof generation process.',
    icon: KeyRound,
  },
];

export const workflowSummary = [
  'The document is parsed locally.',
  'Attributes are separated into public and private values.',
  'The circuit receives the inputs and the witness is generated.',
  'Groth16 produces a concise proof that can be checked independently.',
];
