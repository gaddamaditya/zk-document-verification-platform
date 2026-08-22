/**
 * Document Authenticity Verification Route
 * POST /api/verify-authenticity
 *
 * Accepts multipart/form-data containing:
 *   - document:   The document file (PDF, PNG, JPG)
 *   - credential: The .credential.json file from the trusted issuer
 *
 * Process:
 *   1. Read uploaded document → compute SHA-256 hash
 *   2. Parse credential JSON (documentHash, signature, issuer, algorithm)
 *   3. Compare computed hash with credential.documentHash → integrity check
 *   4. Look up issuer in trusted registry → load public key
 *   5. Verify Ed25519 signature → authenticity check
 *
 * Returns one of:
 *   - AUTHENTIC:        Hash matches AND signature valid AND issuer trusted
 *   - TAMPERED:         Hash does NOT match (document modified after signing)
 *   - UNTRUSTED_ISSUER: Issuer not in registry OR signature invalid
 *
 * SECURITY: This endpoint does NOT create new signatures. It only
 * verifies pre-existing signatures from the trusted issuer.
 *
 * IMPORTANT: This is a research prototype. "Demo University" is a
 * simulated trusted issuer, NOT a real institution or authority.
 */

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getTrustedPublicKey, isTrustedIssuer } = require('../issuer/issuerConfig');

const router = express.Router();

// ─── Temp directory for verification uploads ────────────────────
const TEMP_DIR = path.join(__dirname, '..', 'temp-verification');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// ─── Multer storage config ──────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const runDir = path.join(TEMP_DIR, `auth-${req.authVerifyId}`);
        if (!fs.existsSync(runDir)) {
            fs.mkdirSync(runDir, { recursive: true });
        }
        cb(null, runDir);
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'credential') {
            cb(null, 'credential.json');
        } else {
            // Preserve original extension for hashing
            cb(null, `document${path.extname(file.originalname)}`);
        }
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const uploadFields = upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'credential', maxCount: 1 },
]);

// ─── Middleware: attach unique verify ID ─────────────────────────
const attachAuthVerifyId = (req, res, next) => {
    req.authVerifyId = uuidv4();
    next();
};

// ─── POST / ─────────────────────────────────────────────────────
router.post('/', attachAuthVerifyId, uploadFields, async (req, res) => {
    let runDir = null;

    try {
        // ── Validate required files ─────────────────────────────
        if (!req.files || !req.files.document || !req.files.credential) {
            return res.status(400).json({
                success: false,
                message: 'Both "document" and "credential" files are required.',
            });
        }

        runDir = path.join(TEMP_DIR, `auth-${req.authVerifyId}`);

        const documentPath = req.files.document[0].path;
        const credentialPath = req.files.credential[0].path;

        // ── Parse credential ────────────────────────────────────
        let credential;
        try {
            const raw = fs.readFileSync(credentialPath, 'utf-8');
            credential = JSON.parse(raw);
        } catch (parseErr) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credential file. Expected valid JSON.',
            });
        }

        // Validate credential structure
        if (!credential.documentHash || !credential.signature || !credential.issuer) {
            return res.status(400).json({
                success: false,
                message: 'Credential file is missing required fields (documentHash, signature, issuer).',
            });
        }

        const { documentHash: signedHash, signature, issuer, algorithm, issuedAt } = credential;

        console.log(`[AuthVerify] Verifying document authenticity...`);
        console.log(`[AuthVerify]   Issuer: ${issuer}`);
        console.log(`[AuthVerify]   Algorithm: ${algorithm || 'Ed25519-SHA256'}`);

        // ── Step 1: Compute document hash ───────────────────────
        const documentBuffer = fs.readFileSync(documentPath);
        const computedHash = crypto.createHash('sha256').update(documentBuffer).digest('hex');

        console.log(`[AuthVerify]   Signed hash:   ${signedHash.substring(0, 16)}...`);
        console.log(`[AuthVerify]   Computed hash:  ${computedHash.substring(0, 16)}...`);

        // ── Step 2: Integrity check (hash comparison) ───────────
        const hashMatches = computedHash === signedHash;

        if (!hashMatches) {
            console.log(`[AuthVerify]   ✗ TAMPERED — document hash mismatch`);
            return res.status(200).json({
                success: false,
                status: 'TAMPERED',
                issuer: issuer,
                integrity: 'FAILED',
                signature: 'INVALID',
                message: 'The document has been modified after it was issued.',
            });
        }

        console.log(`[AuthVerify]   ✓ Hash matches — document integrity verified`);

        // ── Step 3: Check if issuer is trusted ──────────────────
        if (!isTrustedIssuer(issuer)) {
            console.log(`[AuthVerify]   ✗ UNTRUSTED_ISSUER — "${issuer}" not in trusted registry`);
            return res.status(200).json({
                success: false,
                status: 'UNTRUSTED_ISSUER',
                message: 'The document could not be verified against a trusted issuer.',
            });
        }

        // ── Step 4: Verify Ed25519 signature ────────────────────
        const publicKey = getTrustedPublicKey(issuer);

        if (!publicKey) {
            console.log(`[AuthVerify]   ✗ UNTRUSTED_ISSUER — no public key for "${issuer}"`);
            return res.status(200).json({
                success: false,
                status: 'UNTRUSTED_ISSUER',
                message: 'The document could not be verified against a trusted issuer.',
            });
        }

        let signatureValid = false;
        try {
            const signatureBuffer = Buffer.from(signature, 'base64');
            signatureValid = crypto.verify(
                null,
                Buffer.from(signedHash, 'utf-8'),
                publicKey,
                signatureBuffer,
            );
        } catch (sigErr) {
            console.error(`[AuthVerify]   Signature verification error:`, sigErr.message);
            signatureValid = false;
        }

        if (!signatureValid) {
            console.log(`[AuthVerify]   ✗ UNTRUSTED_ISSUER — signature verification failed`);
            return res.status(200).json({
                success: false,
                status: 'UNTRUSTED_ISSUER',
                message: 'The document could not be verified against a trusted issuer.',
            });
        }

        // ── Step 5: AUTHENTIC ───────────────────────────────────
        console.log(`[AuthVerify]   ✓ AUTHENTIC — signature valid, issuer trusted`);

        return res.status(200).json({
            success: true,
            status: 'AUTHENTIC',
            issuer: issuer,
            integrity: 'VERIFIED',
            signature: 'VALID',
            issuedAt: issuedAt || null,
        });

    } catch (error) {
        console.error(`[AuthVerify] Error:`, error);
        return res.status(500).json({
            success: false,
            message: `Authenticity verification failed: ${error.message}`,
        });
    } finally {
        // ── Cleanup temp files ──────────────────────────────────
        if (runDir && fs.existsSync(runDir)) {
            try {
                fs.rmSync(runDir, { recursive: true, force: true });
                console.log(`[AuthVerify] Cleaned up temp dir: ${runDir}`);
            } catch (cleanupErr) {
                console.error(`[AuthVerify] Cleanup failed: ${cleanupErr.message}`);
            }
        }
    }
});

module.exports = router;
