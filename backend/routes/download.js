/**
 * Download routes for generated proof files.
 *
 * GET /api/download/proof            → proof.json
 * GET /api/download/public           → public.json
 * GET /api/download/verification-key → verification_key.json
 * GET /api/download/:filename        → safe filename lookup (e.g. proof.json, public.json)
 */

const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const ZKP_ENGINE_DIR = path.resolve(__dirname, "..", "zk-document-verification");
const ZKP_PROOFS_DIR = path.join(ZKP_ENGINE_DIR, "proofs");

/**
 * Helper to safely resolve and send proof files.
 * Prevents path traversal security vulnerabilities.
 */
function sendProofFile(req, res, targetFilename, downloadName) {
    if (!targetFilename || typeof targetFilename !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid filename parameter.",
        });
    }

    // 1. Sanitize filename to prevent directory traversal
    const safeFilename = path.basename(targetFilename);

    // Only allow alphanumeric, underscores, hyphens, and dots
    if (!/^[a-zA-Z0-9._-]+$/.test(safeFilename)) {
        return res.status(400).json({
            success: false,
            message: "Invalid file name format.",
        });
    }

    // 2. Check locations (proofs/ directory first, then ZKP_ENGINE_DIR root as fallback)
    let filePath = path.join(ZKP_PROOFS_DIR, safeFilename);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(ZKP_ENGINE_DIR, safeFilename);
    }

    if (!fs.existsSync(filePath)) {
        console.error(`[Download] File not found: ${filePath}`);
        return res.status(404).json({
            success: false,
            message: `File not found: ${downloadName || safeFilename}. Please generate a proof first.`,
        });
    }

    const finalDownloadName = downloadName || safeFilename;

    console.log(`[Download] Sending file: ${filePath} as ${finalDownloadName}`);

    // Set CORS expose header and response headers
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", "application/json");

    return res.download(filePath, finalDownloadName, (err) => {
        if (err) {
            console.error(`[Download] Error sending ${finalDownloadName}:`, err.message);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: `Error downloading ${finalDownloadName}`,
                });
            }
        }
    });
}

// ─── Specific Named Endpoint Aliases ──────────────────────────────
router.get("/proof", (req, res) => sendProofFile(req, res, "proof.json", "proof.json"));
router.get("/proof.json", (req, res) => sendProofFile(req, res, "proof.json", "proof.json"));

router.get("/public", (req, res) => sendProofFile(req, res, "public.json", "public.json"));
router.get("/public.json", (req, res) => sendProofFile(req, res, "public.json", "public.json"));

router.get("/verification-key", (req, res) => sendProofFile(req, res, "verification_key.json", "verification_key.json"));
router.get("/verification_key.json", (req, res) => sendProofFile(req, res, "verification_key.json", "verification_key.json"));

// ─── Generic Endpoint with Path Traversal Protection ─────────────
router.get("/:filename", (req, res) => {
    const filename = req.params.filename;
    sendProofFile(req, res, filename, filename);
});

module.exports = router;

