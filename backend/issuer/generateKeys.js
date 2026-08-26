#!/usr/bin/env node
/**
 * Issuer Key Generation Utility
 * Generates an Ed25519 key pair for the simulated trusted issuer.
 *
 * Usage:
 *   node issuer/generateKeys.js [--outDir ./issuer/keys]
 *
 * Output:
 *   <outDir>/private-key.pem   — KEEP SECRET, never commit to git
 *   <outDir>/public-key.pem    — Used for verification, safe to distribute
 *
 * IMPORTANT: This is a research prototype. The generated keys represent
 * a simulated trusted issuer (e.g., "Demo University"), NOT a real
 * government authority or accredited institution.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── Parse CLI args ─────────────────────────────────────────────
const args = process.argv.slice(2);
let outDir = path.join(__dirname, 'keys');

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--outDir' && args[i + 1]) {
        outDir = path.resolve(args[i + 1]);
        i++;
    }
}

// ─── Generate Ed25519 key pair ──────────────────────────────────
console.log('─────────────────────────────────────────────');
console.log('  Ed25519 Key Pair Generator');
console.log('  Simulated Trusted Issuer (Research Prototype)');
console.log('─────────────────────────────────────────────\n');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

// ─── Write to disk ──────────────────────────────────────────────
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const privatePath = path.join(outDir, 'private-key.pem');
const publicPath = path.join(outDir, 'public-key.pem');

fs.writeFileSync(privatePath, privateKey, 'utf-8');
fs.writeFileSync(publicPath, publicKey, 'utf-8');

console.log(`  ✅ Private key saved: ${privatePath}`);
console.log(`  ✅ Public key saved:  ${publicPath}`);
console.log('');
console.log('  ⚠️  IMPORTANT:');
console.log('  • The private key must NEVER be committed to git.');
console.log('  • The private key must NEVER be exposed to the frontend.');
console.log('  • Add issuer/keys/ to .gitignore.');
console.log('');
console.log('  The public key can be safely distributed for verification.');
console.log('─────────────────────────────────────────────');
