/**
 * OCR extraction route.
 * POST /api/ocr — runs OCR + attribute extraction on an uploaded file
 * by invoking the ZKP engine's extractOnly.js script via WSL.
 *
 * Request body:  { "fileId": "<uuid>" }
 * Response:      { "success": true, "documentType": "AADHAAR", "attributes": { ... } }
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const router = express.Router();

// ─── Paths ──────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const ZKP_ENGINE_DIR = path.resolve(__dirname, "..", "..", "zk-document-verification");
const ZKP_DOCUMENTS_DIR = path.join(ZKP_ENGINE_DIR, "documents");

// ─── Helper: find uploaded file by fileId ───────────────────────
function findUploadedFile(fileId) {
    const files = fs.readdirSync(UPLOADS_DIR);
    const match = files.find((f) => f.startsWith(fileId));
    return match ? path.join(UPLOADS_DIR, match) : null;
}

// ─── Helper: convert Windows path to WSL path ──────────────────
function windowsToWslPath(winPath) {
    const resolved = path.resolve(winPath);
    const drive = resolved.charAt(0).toLowerCase();
    const rest = resolved.slice(2).replace(/\\/g, "/");
    return `/mnt/${drive}${rest}`;
}

// ─── Helper: run extractOnly.js inside WSL ─────────────────────
function runExtraction(documentFileName) {
    return new Promise((resolve, reject) => {
        const wslZkpDir = windowsToWslPath(ZKP_ENGINE_DIR);
        const cmd = `cd '${wslZkpDir}' && node extractOnly.js 'documents/${documentFileName}'`;

        console.log(`[OCR] WSL command: wsl bash -lc "${cmd}"`);

        const child = spawn("wsl", ["bash", "-lc", cmd]);

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
            console.error(`[OCR ERR] ${data.toString().trim()}`);
        });

        child.on("close", (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            } else {
                reject(
                    new Error(
                        `Extraction exited with code ${code}.\nstderr: ${stderr}`
                    )
                );
            }
        });

        child.on("error", (err) => {
            reject(new Error(`Failed to start extraction: ${err.message}`));
        });
    });
}

// ─── POST / ─────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        const { fileId } = req.body;

        if (!fileId) {
            return res.status(400).json({
                success: false,
                message: "fileId is required",
            });
        }

        // Locate uploaded file
        const uploadedFilePath = findUploadedFile(fileId);
        if (!uploadedFilePath) {
            return res.status(404).json({
                success: false,
                message: `Uploaded file not found for fileId: ${fileId}`,
            });
        }

        // Copy to ZKP documents directory (same as generateProof does)
        const originalName = path
            .basename(uploadedFilePath)
            .replace(/^[a-f0-9-]+-/, "");
        const destPath = path.join(ZKP_DOCUMENTS_DIR, originalName);

        if (!fs.existsSync(ZKP_DOCUMENTS_DIR)) {
            fs.mkdirSync(ZKP_DOCUMENTS_DIR, { recursive: true });
        }

        fs.copyFileSync(uploadedFilePath, destPath);
        console.log(`[OCR] Copied to: ${destPath}`);

        // Run extraction via WSL
        const jsonOutput = await runExtraction(originalName);
        console.log(`[OCR] Raw output: ${jsonOutput}`);

        // Parse the JSON line from stdout
        const result = JSON.parse(jsonOutput);

        return res.status(200).json({
            success: true,
            documentType: result.documentType,
            attributes: result.attributes,
        });
    } catch (error) {
        console.error(`[OCR] Error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
