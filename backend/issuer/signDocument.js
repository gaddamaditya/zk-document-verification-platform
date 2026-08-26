#!/usr/bin/env node
/**
 * Issuer Document Signing Utility
 * Signs a document file with the trusted issuer's Ed25519 private key.
 *
 * Usage:
 *   node issuer/signDocument.js <document-path> [options]
 *
 * Options:
 *   --issuer "Demo University"     Issuer name (default: "Demo University")
 *   --keyDir ./issuer/keys         Directory containing private-key.pem
 *   --outDir .                     Output directory for credential file
 *
 * Output:
 *   <document-name>.credential.json
 *
 * Process:
 *   Document → SHA-256 → Document Hash → Ed25519 Sign → Credential JSON
 *
 * IMPORTANT: This utility must only be run server-side by the trusted issuer.
 * The private key must never be exposed to end users.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Parse CLI args ─────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
    console.log('Usage: node issuer/signDocument.js <document-path> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --issuer "Name"    Issuer name (default: "Demo University")');
    console.log('  --keyDir <dir>     Key directory (default: ./issuer/keys)');
    console.log('  --outDir <dir>     Output directory (default: same as document)');
    process.exit(0);
}

const documentPath = path.resolve(args[0]);
let issuerName = 'Demo University';
let keyDir = path.join(__dirname, 'keys');
let outDir = null;

for (let i = 1; i < args.length; i++) {
    if (args[i] === '--issuer' && args[i + 1]) {
        issuerName = args[i + 1];
        i++;
    } else if (args[i] === '--keyDir' && args[i + 1]) {
        keyDir = path.resolve(args[i + 1]);
        i++;
    } else if (args[i] === '--outDir' && args[i + 1]) {
        outDir = path.resolve(args[i + 1]);
        i++;
    }
}

// ─── Validate inputs ────────────────────────────────────────────
if (!fs.existsSync(documentPath)) {
    console.error(`  ❌ Document not found: ${documentPath}`);
    process.exit(1);
}

const privateKeyPath = path.join(keyDir, 'private-key.pem');
if (!fs.existsSync(privateKeyPath)) {
    console.error(`  ❌ Private key not found: ${privateKeyPath}`);
    console.error('  Run "node issuer/generateKeys.js" first to generate keys.');
    process.exit(1);
}

// ─── Read document and compute hash ─────────────────────────────
console.log('─────────────────────────────────────────────');
console.log('  Document Signing Utility');
console.log('  Simulated Trusted Issuer (Research Prototype)');
console.log('─────────────────────────────────────────────\n');

const documentBuffer = fs.readFileSync(documentPath);
const documentHash = crypto.createHash('sha256').update(documentBuffer).digest('hex');

console.log(`  📄 Document: ${path.basename(documentPath)}`);
console.log(`  📏 Size:     ${documentBuffer.length} bytes`);
console.log(`  🔒 SHA-256:  ${documentHash}`);

// ─── Sign the hash with Ed25519 private key ─────────────────────
const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf-8');
const privateKey = crypto.createPrivateKey(privateKeyPem);

// Sign the hex-encoded hash string (deterministic, portable)
const signature = crypto.sign(null, Buffer.from(documentHash, 'utf-8'), privateKey);
const signatureBase64 = signature.toString('base64');

console.log(`  ✍️  Signature: ${signatureBase64.substring(0, 40)}...`);
console.log(`  🏛️  Issuer:    ${issuerName}`);

// ─── Build credential object ────────────────────────────────────
const credential = {
    documentHash,
    signature: signatureBase64,
    issuer: issuerName,
    issuedAt: new Date().toISOString(),
    algorithm: 'Ed25519-SHA256',
};

// ─── Write credential file ──────────────────────────────────────
const docBaseName = path.basename(documentPath, path.extname(documentPath));
const outputDir = outDir || path.dirname(documentPath);

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const credentialPath = path.join(outputDir, `${docBaseName}.credential.json`);
fs.writeFileSync(credentialPath, JSON.stringify(credential, null, 2), 'utf-8');

console.log(`\n  ✅ Credential saved: ${credentialPath}`);
console.log('');
console.log('  The credential file contains:');
console.log('  • Document hash (SHA-256)');
console.log('  • Ed25519 digital signature');
console.log('  • Issuer identity');
console.log('  • Timestamp');
console.log('');
console.log('  It does NOT contain the document itself or sensitive data.');
console.log('─────────────────────────────────────────────');
