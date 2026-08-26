/**
 * OCR extraction route.
 * POST /api/ocr — runs text extraction + attribute extraction
 * on an uploaded file by calling the ZKP engine modules in-process.
 *
 * Request body:  { "fileId": "<uuid>" }
 * Response:      { "success": true, "documentType": "AADHAAR", "attributes": { ... } }
 */

const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ─── Paths ──────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const ZKP_ENGINE_DIR = path.resolve(__dirname, "..", "zk-document-verification");
const ZKP_DOCUMENTS_DIR = path.join(ZKP_ENGINE_DIR, "documents");

// ─── ZKP Engine modules (loaded in-process) ─────────────────────
const extractPDF = require(path.join(ZKP_ENGINE_DIR, "extractors", "pdfExtractor"));
const extractImage = require(path.join(ZKP_ENGINE_DIR, "extractors", "imageExtractor"));
const detectDocumentType = require(path.join(ZKP_ENGINE_DIR, "processors", "documentType"));
const extractAttributes = require(path.join(ZKP_ENGINE_DIR, "processors", "attributeExtractor"));

// ─── Helper: find uploaded file by fileId ───────────────────────
function findUploadedFile(fileId) {
    const files = fs.readdirSync(UPLOADS_DIR);
    const match = files.find((f) => f.startsWith(fileId));
    return match ? path.join(UPLOADS_DIR, match) : null;
}

// ─── POST / ─────────────────────────────────────────────────────
router.post("/", async (req, res) => {
    try {
        if (!global.ZKP_ENGINE_AVAILABLE) {
            return res.status(503).json({
                success: false,
                message: "ZKP Engine is not available on this deployment."
            });
        }

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

        // Copy to ZKP documents directory
        const originalName = path
            .basename(uploadedFilePath)
            .replace(/^[a-f0-9-]+-/, "");
        const destPath = path.join(ZKP_DOCUMENTS_DIR, originalName);

        if (!fs.existsSync(ZKP_DOCUMENTS_DIR)) {
            fs.mkdirSync(ZKP_DOCUMENTS_DIR, { recursive: true });
        }

        fs.copyFileSync(uploadedFilePath, destPath);
        console.log(`[OCR] Copied to: ${destPath}`);

        // Extract text in-process (no subprocess needed)
        const extension = path.extname(destPath).toLowerCase();
        let extractedText = "";

        switch (extension) {
            case ".pdf":
                console.log("[OCR] Extracting text from PDF...");
                extractedText = await extractPDF(destPath);
                break;
            case ".jpg":
            case ".jpeg":
            case ".png":
                console.log("[OCR] Extracting text from image...");
                extractedText = await extractImage(destPath);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: `Unsupported format: ${extension}`,
                });
        }

        console.log("[OCR] ✓ Text extraction completed");

        // Detect document type and extract attributes
        const documentType = detectDocumentType(extractedText);
        const attributes = extractAttributes(documentType, extractedText);

        console.log(`[OCR] ✓ Document type: ${documentType}`);
        console.log(`[OCR] ✓ Attributes extracted`);

        return res.status(200).json({
            success: true,
            documentType: documentType,
            attributes: attributes,
        });
    } catch (error) {
        console.error(`[OCR] Error:`, error);
        return res.status(500).json({
            success: false,
            message: `OCR extraction failed: ${error.message}`,
        });
    }
});

module.exports = router;
