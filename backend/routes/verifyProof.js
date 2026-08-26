/**
 * Verify Proof route.
 * POST /api/verify-proof
 *
 * Receives multipart/form-data containing proof and public.
 * Saves them to api-server-new/temp-verification/verify-<uuid>/,
 * uses the snarkjs Node.js API to verify in-process, and returns verification status.
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const snarkjs = require("snarkjs");

const router = express.Router();

const TEMP_DIR = path.join(__dirname, "..", "temp-verification");
const ZKP_ENGINE_DIR = path.resolve(__dirname, "..", "zk-document-verification");
const ZKP_PROOFS_DIR = path.join(ZKP_ENGINE_DIR, "proofs");

// Ensure main temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Map verification key filenames to claim arrays
const VKEY_TO_CLAIMS = {
    "verification_key_NameVerifier.json": ["NAME"],
    "verification_key_AgeVerifier.json": ["AGE_18_PLUS"],
    "verification_key_GenderVerifier.json": ["GENDER"],
    "verification_key_StudentNameVerifier.json": ["STUDENT_NAME"],
    "verification_key_ResultVerifier.json": ["RESULT"],
    "verification_key_GradeVerifier.json": ["GRADE"],
    "verification_key_GrandTotalVerifier.json": ["GRAND_TOTAL"],
    "verification_key_MultiAttributeVerifier.json": ["NAME", "AGE_18_PLUS", "GENDER"],
    "verification_key_AadhaarMultiAttributeVerifier.json": ["NAME", "DOB", "AGE_18_PLUS", "GENDER"],
    "verification_key_MarksheetMultiAttributeVerifier.json": ["STUDENT_NAME", "GENDER", "RESULT", "GRADE", "GRAND_TOTAL", "CGPA"],
};

// Set up multer disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const runDir = path.join(TEMP_DIR, `verify-${req.verifyId}`);
        if (!fs.existsSync(runDir)) {
            fs.mkdirSync(runDir, { recursive: true });
        }
        cb(null, runDir);
    },
    filename: (req, file, cb) => {
        let filename;
        if (file.fieldname === "proof") {
            filename = "proof.json";
        } else if (file.fieldname === "public") {
            filename = "public.json";
        } else if (file.fieldname === "verificationKey") {
            filename = "verification_key.json";
        } else {
            filename = file.originalname;
        }
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

const uploadFields = upload.fields([
    { name: "proof", maxCount: 1 },
    { name: "public", maxCount: 1 },
    { name: "verificationKey", maxCount: 1 }
]);

// Middleware to assign a unique verify ID
const attachVerifyId = (req, res, next) => {
    req.verifyId = uuidv4();
    next();
};

// POST endpoint for verifying proofs
router.post("/", attachVerifyId, uploadFields, async (req, res) => {
    if (!global.ZKP_ENGINE_AVAILABLE) {
        return res.status(503).json({
            success: false,
            message: "ZKP Engine is not available on this deployment."
        });
    }

    let runDir = null;
    try {
        if (!req.files || !req.files.proof || !req.files.public) {
            return res.status(400).json({
                success: false,
                message: "Missing required files. Please upload proof and public."
            });
        }

        const verifyId = req.verifyId;
        runDir = path.join(TEMP_DIR, `verify-${verifyId}`);

        const proofPath = path.join(runDir, "proof.json");
        const publicPath = path.join(runDir, "public.json");

        if (!fs.existsSync(proofPath) || !fs.existsSync(publicPath)) {
            return res.status(400).json({
                success: false,
                message: "Failed to upload all required verification files correctly."
            });
        }

        // Parse uploaded proof and public signals
        const proof = JSON.parse(fs.readFileSync(proofPath, "utf-8"));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf-8"));

        // Build list of candidate verification key files to try
        const candidates = [];

        // 1. If custom verificationKey was uploaded in request
        const uploadedVkeyPath = path.join(runDir, "verification_key.json");
        if (fs.existsSync(uploadedVkeyPath)) {
            candidates.push({ name: "Uploaded Key", path: uploadedVkeyPath, claims: [] });
        }

        // 2. Read claims_metadata.json if present
        let metaClaims = [];
        const metaPath = path.join(ZKP_PROOFS_DIR, "claims_metadata.json");
        if (fs.existsSync(metaPath)) {
            try {
                const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                if (Array.isArray(meta.claims) && meta.claims.length > 0) {
                    metaClaims = meta.claims;
                }
            } catch (mErr) {}
        }

        // Add key candidates
        const availableKeys = fs.readdirSync(ZKP_ENGINE_DIR).filter(f => f.startsWith("verification_key_") && f.endsWith(".json"));
        for (const kf of availableKeys) {
            const fullP = path.join(ZKP_ENGINE_DIR, kf);
            if (!candidates.some(c => c.path === fullP)) {
                candidates.push({ name: kf, path: fullP, claims: VKEY_TO_CLAIMS[kf] || [] });
            }
        }

        console.log(`[Verify] Starting in-process verification run: ${verifyId}`);
        console.log(`[Verify] Trying ${candidates.length} candidate verification keys...`);

        let verifiedMatch = null;

        for (const cand of candidates) {
            try {
                const vkey = JSON.parse(fs.readFileSync(cand.path, "utf-8"));
                const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);
                if (isValid) {
                    verifiedMatch = cand;
                    console.log(`[Verify] ✓ Valid proof matched with key: ${cand.name}`);
                    break;
                }
            } catch (err) {
                // Ignore curve math dimension mismatch errors for non-matching keys
            }
        }

        if (verifiedMatch) {
            const finalClaims = metaClaims.length > 0 ? metaClaims : (verifiedMatch.claims.length > 0 ? verifiedMatch.claims : VKEY_TO_CLAIMS[verifiedMatch.name] || []);
            return res.status(200).json({
                success: true,
                verified: true,
                claims: finalClaims,
                message: "Proof verified successfully",
            });
        } else {
            console.log(`[Verify] ✗ Verification failed — no candidate key validated this proof`);
            return res.status(200).json({
                success: true,
                verified: false,
                message: "Invalid proof",
            });
        }

    } catch (error) {
        console.error(`[Verify] Error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (runDir && fs.existsSync(runDir)) {
            try {
                fs.rmSync(runDir, { recursive: true, force: true });
                console.log(`[Verify] Cleaned up temporary directory: ${runDir}`);
            } catch (cleanupErr) {
                console.error(`[Verify] Failed to clean up temp dir: ${cleanupErr.message}`);
            }
        }
    }
});

module.exports = router;
