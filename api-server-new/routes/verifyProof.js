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
    { name: "public", maxCount: 1 }
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

        // Read claims metadata saved during proof generation
        const metaPath = path.join(ZKP_PROOFS_DIR, "claims_metadata.json");
        let claims = [];
        try {
            if (fs.existsSync(metaPath)) {
                const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                claims = meta.claims || [];
            }
        } catch (metaErr) {
            console.error(`[Verify] Could not read claims metadata: ${metaErr.message}`);
        }

        // Determine verification key filename using explicit mappings
        let keyFilename = null;
        if (claims.length === 1) {
            const claim = claims[0];
            if (claim === "NAME") {
                keyFilename = "verification_key_NameVerifier.json";
            } else if (claim === "AGE_18_PLUS") {
                keyFilename = "verification_key_AgeVerifier.json";
            } else if (claim === "GENDER") {
                keyFilename = "verification_key_GenderVerifier.json";
            } else if (claim === "RESULT") {
                keyFilename = "verification_key_ResultVerifier.json";
            } else if (claim === "STUDENT_NAME") {
                keyFilename = "verification_key_StudentNameVerifier.json";
            } else if (claim === "GRADE") {
                keyFilename = "verification_key_GradeVerifier.json";
            } else if (claim === "GRAND_TOTAL") {
                keyFilename = "verification_key_GrandTotalVerifier.json";
            }
        } else if (
            claims.length === 3 &&
            claims.includes("NAME") &&
            claims.includes("AGE_18_PLUS") &&
            claims.includes("GENDER")
        ) {
            keyFilename = "verification_key_MultiAttributeVerifier.json";
        }

        if (!keyFilename) {
            return res.status(400).json({
                success: false,
                message: "Unsupported claim combination"
            });
        }

        const sourceVkeyPath = path.join(ZKP_ENGINE_DIR, keyFilename);
        if (!fs.existsSync(sourceVkeyPath)) {
            return res.status(400).json({
                success: false,
                message: `Server-side verification key not found: ${keyFilename}`
            });
        }

        // Read JSON files for in-process verification
        const vkey = JSON.parse(fs.readFileSync(sourceVkeyPath, "utf-8"));
        const proof = JSON.parse(fs.readFileSync(proofPath, "utf-8"));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath, "utf-8"));

        console.log(`[Verify] Starting in-process verification run: ${verifyId}`);
        console.log(`[Verify] Using verification key: ${keyFilename}`);
        console.log(`[Verify] Claims: ${JSON.stringify(claims)}`);

        // ── In-process verification using snarkjs Node.js API ───
        const isValid = await snarkjs.groth16.verify(vkey, publicSignals, proof);

        console.log(`[Verify] Result: ${isValid ? "VALID" : "INVALID"}`);

        if (isValid) {
            return res.status(200).json({
                success: true,
                verified: true,
                claims,
                message: "Proof verified successfully"
            });
        } else {
            return res.status(200).json({
                success: true,
                verified: false,
                message: "Invalid proof"
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
