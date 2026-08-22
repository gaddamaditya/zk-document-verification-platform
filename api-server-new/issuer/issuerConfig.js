/**
 * Trusted Issuer Configuration & Registry
 *
 * Provides the public keys of trusted issuers for document authenticity
 * verification. The private key is NEVER loaded by this module — signing
 * is an offline operation performed by the issuer utility.
 *
 * Public key sources (in priority order):
 *   1. ISSUER_PUBLIC_KEY environment variable (PEM string)
 *   2. issuer/keys/public-key.pem file on disk
 *
 * IMPORTANT: This is a research prototype. "Demo University" is a
 * simulated trusted issuer, NOT a real institution.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, 'keys');
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, 'public-key.pem');

// ─── Trusted Issuer Registry ────────────────────────────────────

/**
 * Load the Demo University public key from environment or disk.
 * Returns null if no key is available.
 */
function loadDemoUniversityPublicKey() {
    // Priority 1: Environment variable
    if (process.env.ISSUER_PUBLIC_KEY) {
        try {
            let pemStr = process.env.ISSUER_PUBLIC_KEY;
            // Handle escaped newlines from env vars
            if (!pemStr.includes('\n')) {
                pemStr = pemStr.replace(/\\n/g, '\n');
            }
            return crypto.createPublicKey(pemStr);
        } catch (err) {
            console.warn('[IssuerConfig] Failed to load public key from ISSUER_PUBLIC_KEY env:', err.message);
        }
    }

    // Priority 2: PEM file on disk
    if (fs.existsSync(PUBLIC_KEY_PATH)) {
        try {
            const pem = fs.readFileSync(PUBLIC_KEY_PATH, 'utf-8');
            return crypto.createPublicKey(pem);
        } catch (err) {
            console.warn('[IssuerConfig] Failed to load public key from disk:', err.message);
        }
    }

    return null;
}

/**
 * Registry of trusted issuers.
 * Maps issuer name → { publicKey, description }
 *
 * Designed to be extensible: the same mechanism can support
 * multiple issuers (universities, institutions, etc.)
 */
const trustedIssuers = {};

// Initialize the Demo University issuer
const demoPublicKey = loadDemoUniversityPublicKey();
if (demoPublicKey) {
    trustedIssuers['Demo University'] = {
        publicKey: demoPublicKey,
        description: 'Simulated trusted issuer for research prototype demonstration',
    };
    console.log('  ✓ Loaded trusted issuer: Demo University');
} else {
    console.warn('  ⚠ No public key found for Demo University issuer.');
    console.warn('    Run "node issuer/generateKeys.js" to generate keys,');
    console.warn('    or set the ISSUER_PUBLIC_KEY environment variable.');
}

// ─── Public API ─────────────────────────────────────────────────

/**
 * Get the public key for a trusted issuer by name.
 * @param {string} issuerName
 * @returns {crypto.KeyObject|null}
 */
function getTrustedPublicKey(issuerName) {
    const entry = trustedIssuers[issuerName];
    return entry ? entry.publicKey : null;
}

/**
 * Check whether an issuer name is in the trusted registry.
 * @param {string} issuerName
 * @returns {boolean}
 */
function isTrustedIssuer(issuerName) {
    return issuerName in trustedIssuers;
}

/**
 * Get list of all trusted issuer names.
 * @returns {string[]}
 */
function getTrustedIssuerNames() {
    return Object.keys(trustedIssuers);
}

module.exports = {
    getTrustedPublicKey,
    isTrustedIssuer,
    getTrustedIssuerNames,
};
