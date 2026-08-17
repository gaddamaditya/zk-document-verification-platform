/**
 * Generate Proof route.
 * POST /api/generate-proof
 *
 * Runs the ZKP pipeline in-process by directly requiring and calling
 * the ZKP engine modules. Supports document-specific multi-attribute verification
 * for Aadhaar (AadhaarMultiAttributeVerifier) and Marksheet (MarksheetMultiAttributeVerifier).
 */

const express = require("express");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ─── Paths ──────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const ZKP_ENGINE_DIR = path.resolve(__dirname, "..", "zk-document-verification");
const ZKP_DOCUMENTS_DIR = path.join(ZKP_ENGINE_DIR, "documents");
const ZKP_PROOFS_DIR = path.join(ZKP_ENGINE_DIR, "proofs");

// ─── ZKP Engine modules (loaded in-process) ─────────────────────
const extractPDF = require(path.join(ZKP_ENGINE_DIR, "extractors", "pdfExtractor"));
const extractImage = require(path.join(ZKP_ENGINE_DIR, "extractors", "imageExtractor"));
const detectDocumentType = require(path.join(ZKP_ENGINE_DIR, "processors", "documentType"));
const extractAttributes = require(path.join(ZKP_ENGINE_DIR, "processors", "attributeExtractor"));
const generateClaims = require(path.join(ZKP_ENGINE_DIR, "processors", "claims", "claimGenerator"));
const generateInput = require(path.join(ZKP_ENGINE_DIR, "processors", "inputGenerators", "universalInputGenerator"));
const circuits = require(path.join(ZKP_ENGINE_DIR, "config", "circuits"));
const buildCircuit = require(path.join(ZKP_ENGINE_DIR, "processors", "compiler", "buildCircuit"));
const generateWitness = require(path.join(ZKP_ENGINE_DIR, "processors", "prover", "witnessGenerator"));
const generateProofZKP = require(path.join(ZKP_ENGINE_DIR, "processors", "prover", "proofGenerator"));
const verifyProofZKP = require(path.join(ZKP_ENGINE_DIR, "processors", "prover", "verifyProof"));

// ─── Frontend claim ID → ZKP engine claim name ─────────────────
const CLAIM_MAP = {
    name_verification: "NAME",
    age_verification: "AGE_18_PLUS",
    gender_verification: "GENDER",
    dob_verification: "DOB",
    result_verification: "RESULT",
    cgpa_verification: "GRADE",
    degree_verification: "STUDENT_NAME",
    certificate_authenticity: "GRAND_TOTAL",
    cgpa_attribute_verification: "CGPA",
};

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
                error: "ZKP Engine is not available on this deployment.",
            });
        }

        const { fileId, claims } = req.body;

        // ── Validate request ────────────────────────────────────
        if (!fileId) {
            return res.status(400).json({
                success: false,
                error: "fileId is required",
            });
        }

        if (!claims || !Array.isArray(claims) || claims.length === 0) {
            return res.status(400).json({
                success: false,
                error: "At least one claim must be selected",
            });
        }

        // ── Normalize frontend claim IDs to ZKP engine names ────
        const normalizedClaims = claims.map(
            (claim) => CLAIM_MAP[claim] || claim
        );

        console.log("[GenerateProof] Frontend claims:", claims);
        console.log("[GenerateProof] Normalized claims:", normalizedClaims);

        // ── Locate uploaded file ────────────────────────────────
        const uploadedFilePath = findUploadedFile(fileId);
        if (!uploadedFilePath) {
            return res.status(404).json({
                success: false,
                error: `Uploaded file not found for fileId: ${fileId}`,
            });
        }

        console.log(`[GenerateProof] File found: ${uploadedFilePath}`);

        // ── Copy file to ZKP documents directory ────────────────
        const originalName = path.basename(uploadedFilePath).replace(/^[a-f0-9-]+-/, "");
        const destPath = path.join(ZKP_DOCUMENTS_DIR, originalName);

        if (!fs.existsSync(ZKP_DOCUMENTS_DIR)) {
            fs.mkdirSync(ZKP_DOCUMENTS_DIR, { recursive: true });
        }

        fs.copyFileSync(uploadedFilePath, destPath);

        // ── Step 1: Extract text ────────────────────────────────
        console.log("[GenerateProof] Step 1: Extracting text...");
        const extension = path.extname(destPath).toLowerCase();
        let extractedText = "";

        switch (extension) {
            case ".pdf":
                extractedText = await extractPDF(destPath);
                break;
            case ".jpg":
            case ".jpeg":
            case ".png":
                extractedText = await extractImage(destPath);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: `Unsupported document format: ${extension}`,
                });
        }

        // ── Step 2: Detect document type ────────────────────────
        console.log("[GenerateProof] Step 2: Detecting document type...");
        const documentType = detectDocumentType(extractedText);
        console.log(`[GenerateProof] ✓ Document type: ${documentType}`);

        // ── Step 3: Extract attributes ──────────────────────────
        console.log("[GenerateProof] Step 3: Extracting attributes...");
        const attributes = extractAttributes(documentType, extractedText);
        console.log("[GenerateProof] ✓ Attributes extracted:", attributes);

        // ── Step 4: Determine pipeline circuit ─────────────────
        let pipelineClaim;
        let circuitName;

        if (documentType === "MARKSHEET" || normalizedClaims.some(c => ["STUDENT_NAME", "RESULT", "GRADE", "GRAND_TOTAL", "CGPA"].includes(c))) {
            pipelineClaim = "MARKSHEET_MULTI_ATTRIBUTE";
            circuitName = "MarksheetMultiAttributeVerifier";
        } else {
            pipelineClaim = "AADHAAR_MULTI_ATTRIBUTE";
            circuitName = "AadhaarMultiAttributeVerifier";
        }

        console.log(`[GenerateProof] Pipeline claim: ${pipelineClaim}`);
        console.log(`[GenerateProof] Circuit: ${circuitName}`);

        // ── Step 5: Generate circuit input ──────────────────────
        console.log("[GenerateProof] Step 5: Generating circuit input...");
        await generateInput(pipelineClaim, attributes, normalizedClaims);
        console.log("[GenerateProof] ✓ Input generated");

        // ── Step 6: Build circuit (skip if pre-built) ───────────
        console.log("[GenerateProof] Step 6: Checking circuit...");
        buildCircuit(circuitName);
        console.log("[GenerateProof] ✓ Circuit ready");

        // ── Step 7: Generate witness ────────────────────────────
        console.log("[GenerateProof] Step 7: Generating witness...");
        generateWitness(pipelineClaim);
        console.log("[GenerateProof] ✓ Witness generated");

        // ── Step 8: Generate proof ──────────────────────────────
        console.log("[GenerateProof] Step 8: Generating Groth16 proof...");
        generateProofZKP(pipelineClaim);
        console.log("[GenerateProof] ✓ Proof generated");

        // ── Step 9: Verify proof ────────────────────────────────
        console.log("[GenerateProof] Step 9: Verifying proof...");
        verifyProofZKP(pipelineClaim);
        console.log("[GenerateProof] ✓ Proof verified");

        // ── Verify output files exist ───────────────────────────
        const proofFile = path.join(ZKP_ENGINE_DIR, `${circuitName}_proof.json`);
        const publicFile = path.join(ZKP_ENGINE_DIR, `${circuitName}_public.json`);
        const vkeyFile = path.join(ZKP_ENGINE_DIR, `verification_key_${circuitName}.json`);

        const missingFiles = [];
        if (!fs.existsSync(proofFile)) missingFiles.push(`${circuitName}_proof.json`);
        if (!fs.existsSync(publicFile)) missingFiles.push(`${circuitName}_public.json`);
        if (!fs.existsSync(vkeyFile)) missingFiles.push(`verification_key_${circuitName}.json`);

        if (missingFiles.length > 0) {
            return res.status(500).json({
                success: false,
                error: "Pipeline completed but output files are missing",
                details: `Missing: ${missingFiles.join(", ")}`,
            });
        }

        // ── Copy to proofs/ with standardized names ─────────────
        if (!fs.existsSync(ZKP_PROOFS_DIR)) {
            fs.mkdirSync(ZKP_PROOFS_DIR, { recursive: true });
        }

        fs.copyFileSync(proofFile, path.join(ZKP_PROOFS_DIR, "proof.json"));
        fs.copyFileSync(publicFile, path.join(ZKP_PROOFS_DIR, "public.json"));
        fs.copyFileSync(vkeyFile, path.join(ZKP_PROOFS_DIR, "verification_key.json"));

        // Save claims metadata so the verify endpoint can report what was proven
        fs.writeFileSync(
            path.join(ZKP_PROOFS_DIR, "claims_metadata.json"),
            JSON.stringify({ claims: normalizedClaims }, null, 2)
        );

        console.log("[GenerateProof] ✓ Output files copied to proofs/");
        console.log("[GenerateProof] ✓ Pipeline completed successfully");

        // ── Return success ──────────────────────────────────────
        return res.status(200).json({
            success: true,
            message: "Proof generated successfully",
            fileId: fileId,
            claims: normalizedClaims,
            generatedFiles: [
                "proof.json",
                "public.json",
                "verification_key.json",
            ],
        });
    } catch (error) {
        console.error(`[GenerateProof] Error:`, error);
        return res.status(500).json({
            success: false,
            error: "ZKP pipeline failed",
            details: error.message,
        });
    }
});

module.exports = router;