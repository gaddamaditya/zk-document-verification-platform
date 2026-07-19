# Privacy-Preserving Document Verification using Zero-Knowledge Proofs

## Overview

This project implements a privacy-preserving document verification framework using **Zero-Knowledge Proofs (zk-SNARKs)**. The system enables users to prove specific claims about a document (such as age, gender, or multiple attributes) without revealing the complete document or sensitive personal information.

The framework supports multiple document formats and is designed to be modular, making it adaptable to identity cards, passports, academic certificates, healthcare records, and other structured documents.

---

## Features

- Document processing for multiple file formats
- OCR and text extraction
- Automatic document type detection
- Attribute extraction
- Claim generation
- Poseidon hash-based commitments
- Multiple Circom verification circuits
- Witness generation
- Groth16 proof generation and verification
- Privacy-preserving attribute verification

---

## System Architecture

```
Document (PDF / Image / DOCX / TXT)
                │
                ▼
      Document Extraction
                │
                ▼
      Attribute Extraction
                │
                ▼
        Claim Generation
                │
                ▼
       Input Generation
                │
                ▼
        Circom Circuit
                │
                ▼
      Witness Generation
                │
                ▼
      Proof Generation
                │
                ▼
     Proof Verification
                │
                ▼
         Verification Result
```

---

## Project Structure

```
zk-document-verification
│
├── circuits/
│   ├── AgeVerifier.circom
│   ├── GenderVerifier.circom
│   ├── ResultVerifier.circom
│   ├── documentVerifier.circom
│   └── multiAttributeVerifier.circom
│
├── extractors/
│   ├── docxExtractor.js
│   ├── imageExtractor.js
│   ├── pdfExtractor.js
│   └── txtExtractor.js
│
├── processors/
│   ├── attributes/
│   ├── claims/
│   ├── circuitSelector/
│   ├── inputGenerators/
│   ├── attributeExtractor.js
│   ├── documentType.js
│   ├── hash.js
│   ├── inputGenerator.js
│   └── preprocess.js
│
├── samples/
├── documents/
├── main.js
├── package.json
├── README.md
└── .gitignore
```

---

## Technologies Used

- Circom
- SnarkJS
- Groth16 zk-SNARKs
- Poseidon Hash
- Node.js
- JavaScript
- OCR
- PDF Parsing

---

## Workflow

1. Upload a document.
2. Detect the document type.
3. Extract text using the appropriate extractor.
4. Extract relevant attributes.
5. Generate the verification claim.
6. Create Circom inputs.
7. Generate the witness.
8. Produce a Zero-Knowledge Proof.
9. Verify the proof without exposing sensitive information.

---

## Supported Verification

- Age Verification
- Gender Verification
- Multi-Attribute Verification
- Generic Document Verification

---

## Future Enhancements

- Digital Signature Verification
- QR Code Verification
- Blockchain Smart Contract Verification
- Batch Proof Generation
- Selective Disclosure of Attributes
- Support for Additional Document Types

---

## Author

**Adithya Gaddam**

B.Tech Computer Science and Engineering

SRM University AP