/**
 * extractOnly.js — Standalone OCR + attribute extraction script.
 *
 * Usage:  node extractOnly.js <document-path>
 *
 * Runs the existing text extraction, document-type detection, and
 * attribute extraction pipeline, then prints a single JSON line to
 * stdout with the structure:
 *
 *   { "documentType": "AADHAAR", "attributes": { ... } }
 *
 * This script is meant to be invoked from the API server via WSL
 * so the API server does not need Tesseract or pdf-parse installed.
 */

const path = require("path");

const extractPDF = require("./extractors/pdfExtractor");
const extractImage = require("./extractors/imageExtractor");

const detectDocumentType = require("./processors/documentType");
const extractAttributes = require("./processors/attributeExtractor");

async function main() {
    const filePath = process.argv[2];

    if (!filePath) {
        process.stderr.write("Usage: node extractOnly.js <document>\n");
        process.exit(1);
    }

    const extension = path.extname(filePath).toLowerCase();

    let extractedText = "";

    switch (extension) {
        case ".pdf":
            extractedText = await extractPDF(filePath);
            break;

        case ".jpg":
        case ".jpeg":
        case ".png":
            extractedText = await extractImage(filePath);
            break;

        default:
            process.stderr.write(`Unsupported format: ${extension}\n`);
            process.exit(1);
    }

    const documentType = detectDocumentType(extractedText);
    const attributes = extractAttributes(documentType, extractedText);

    // Single JSON line to stdout — the API server parses this.
    const result = { documentType, attributes };
    process.stdout.write(JSON.stringify(result) + "\n");
}

main().catch((err) => {
    process.stderr.write(`Extraction failed: ${err.message}\n`);
    process.exit(1);
});
