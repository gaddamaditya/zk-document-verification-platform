/**
 * Download routes for generated proof files.
 *
 * GET /api/download/proof            → proof.json
 * GET /api/download/public           → public.json
 * GET /api/download/verification-key → verification_key.json
 */

const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const ZKP_PROOFS_DIR = path.resolve(
    __dirname,
    "..",
    "..",
    "zk-document-verification",
    "proofs"
);

// ─── Helper ─────────────────────────────────────────────────────
function sendProofFile(res, filename, downloadName) {
    const filePath = path.join(ZKP_PROOFS_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            success: false,
            message: `File not found: ${downloadName}. Generate a proof first.`,
        });
    }

    return res.download(filePath, downloadName, (err) => {
        if (err) {
            console.error(`[Download] Error sending ${downloadName}:`, err.message);
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    message: `Error downloading ${downloadName}`,
                });
            }
        }
    });
}

// ─── Routes ─────────────────────────────────────────────────────
router.get("/proof", (req, res) => {
    sendProofFile(res, "proof.json", "proof.json");
});

router.get("/public", (req, res) => {
    sendProofFile(res, "public.json", "public.json");
});

router.get("/verification-key", (req, res) => {
    sendProofFile(res, "verification_key.json", "verification_key.json");
});

module.exports = router;
