/**
 * Verify Proof route.
 * POST /api/verify-proof
 *
 * Receives multipart/form-data containing proof, public, and verificationKey.
 * Saves them to api-server-new/temp-verification/verify-<uuid>/,
 * runs `snarkjs groth16 verify` inside WSL, and returns verification status.
 */

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { spawn } = require("child_process");

const router = express.Router();

const TEMP_DIR = path.join(__dirname, "..", "temp-verification");
const ZKP_PROOFS_DIR = path.resolve(__dirname, "..", "..", "zk-document-verification", "proofs");

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
    { name: "public", maxCount: 1 },
    { name: "verificationKey", maxCount: 1 }
]);

// Middleware to assign a unique verify ID
const attachVerifyId = (req, res, next) => {
    req.verifyId = uuidv4();
    next();
};

// ─── Helper: convert Windows path to WSL path ──────────────────
function windowsToWslPath(winPath) {
    const resolved = path.resolve(winPath);
    const drive = resolved.charAt(0).toLowerCase();
    const rest = resolved.slice(2).replace(/\\/g, "/");
    return `/mnt/${drive}${rest}`;
}

// ─── Helper: run verification in WSL ──────────────────────────
function runVerification(runDir) {
    return new Promise((resolve, reject) => {
        const wslRunDir = windowsToWslPath(runDir);
        const cmd = `cd '${wslRunDir}' && snarkjs groth16 verify verification_key.json public.json proof.json`;

        console.log(`[Verify] WSL command: wsl bash -lc "${cmd}"`);

        const child = spawn("wsl", ["bash", "-lc", cmd]);

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        child.on("close", (code) => {
            resolve({ code, stdout, stderr });
        });

        child.on("error", (err) => {
            reject(new Error(`Failed to start WSL verification: ${err.message}`));
        });
    });
}

// POST endpoint for verifying proofs
router.post("/", attachVerifyId, uploadFields, async (req, res) => {
    let runDir = null;
    try {
        if (!req.files || !req.files.proof || !req.files.public || !req.files.verificationKey) {
            return res.status(400).json({
                success: false,
                message: "Missing required files. Please upload proof, public, and verificationKey."
            });
        }

        const verifyId = req.verifyId;
        runDir = path.join(TEMP_DIR, `verify-${verifyId}`);

        const proofPath = path.join(runDir, "proof.json");
        const publicPath = path.join(runDir, "public.json");
        const vkeyPath = path.join(runDir, "verification_key.json");

        if (!fs.existsSync(proofPath) || !fs.existsSync(publicPath) || !fs.existsSync(vkeyPath)) {
            return res.status(400).json({
                success: false,
                message: "Failed to upload all three verification files correctly."
            });
        }

        console.log(`[Verify] Starting verification run: ${verifyId}`);
        const result = await runVerification(runDir);

        console.log(`[Verify] Exit code: ${result.code}`);
        console.log(`[Verify] Stdout: ${result.stdout.trim()}`);
        if (result.stderr) {
            console.error(`[Verify Stderr] ${result.stderr.trim()}`);
        }

        if (result.stdout.includes("OK!")) {
            // Read claims metadata saved during proof generation
            let claims = [];
            const metaPath = path.join(ZKP_PROOFS_DIR, "claims_metadata.json");
            try {
                if (fs.existsSync(metaPath)) {
                    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
                    claims = meta.claims || [];
                }
            } catch (metaErr) {
                console.error(`[Verify] Could not read claims metadata: ${metaErr.message}`);
            }

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
