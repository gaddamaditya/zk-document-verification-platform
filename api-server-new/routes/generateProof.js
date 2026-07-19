/**
 * Generate Proof route.
 * POST /api/generate-proof
 *
 * Executes the existing zk-document-verification pipeline by spawning
 * `node main.js <document>` as a child process and piping claim
 * selections to stdin.
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const router = express.Router();

// ─── Paths ──────────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
const ZKP_ENGINE_DIR = path.resolve(__dirname, "..", "zk-document-verification");
const ZKP_DOCUMENTS_DIR = path.join(ZKP_ENGINE_DIR, "documents");
const ZKP_PROOFS_DIR = path.join(ZKP_ENGINE_DIR, "proofs");

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
};

// ─── Claim → menu index mapping ────────────────────────────────
// Derived from claimGenerator.js — the order claims are pushed
// determines their 1-based index in the interactive menu.

const AADHAAR_CLAIMS = ["NAME", "AGE_18_PLUS", "GENDER"];
const MARKSHEET_CLAIMS = ["STUDENT_NAME", "RESULT", "GRADE", "GRAND_TOTAL"];

function getClaimIndices(claims) {
    // Try AADHAAR mapping first
    let allAadhaar = claims.every((c) => AADHAAR_CLAIMS.includes(c));
    if (allAadhaar) {
        return claims.map((c) => AADHAAR_CLAIMS.indexOf(c) + 1);
    }

    // Try MARKSHEET mapping
    let allMarksheet = claims.every((c) => MARKSHEET_CLAIMS.includes(c));
    if (allMarksheet) {
        return claims.map((c) => MARKSHEET_CLAIMS.indexOf(c) + 1);
    }

    return null;
}

// ─── Claim → circuit name mapping ──────────────────────────────
// Mirrors the logic in main.js and config/circuits.js

const CLAIM_TO_CIRCUIT = {
    NAME: "NameVerifier",
    AGE_18_PLUS: "AgeVerifier",
    GENDER: "GenderVerifier",
    STUDENT_NAME: "StudentNameVerifier",
    RESULT: "ResultVerifier",
    GRADE: "GradeVerifier",
    GRAND_TOTAL: "GrandTotalVerifier",
};

function getCircuitName(claims) {
    // Single claim → direct mapping
    if (claims.length === 1) {
        return CLAIM_TO_CIRCUIT[claims[0]] || null;
    }

    // Multi-attribute: exactly NAME + AGE_18_PLUS + GENDER
    if (
        claims.length === 3 &&
        claims.includes("NAME") &&
        claims.includes("AGE_18_PLUS") &&
        claims.includes("GENDER")
    ) {
        return "MultiAttributeVerifier";
    }

    return null;
}

// ─── Helper: find uploaded file by fileId ───────────────────────
function findUploadedFile(fileId) {
    const files = fs.readdirSync(UPLOADS_DIR);
    const match = files.find((f) => f.startsWith(fileId));
    return match ? path.join(UPLOADS_DIR, match) : null;
}

// ─── Helper: run main.js natively ───────────────────────────────
function runZKPPipeline(documentFileName, claimIndicesStr) {
    return new Promise((resolve, reject) => {
        console.log(`[ZKP] Executing: node main.js "${path.join("documents", documentFileName)}" in ${ZKP_ENGINE_DIR}`);

        const child = spawn("node", ["main.js", path.join("documents", documentFileName)], {
            cwd: ZKP_ENGINE_DIR,
            env: {
                ...process.env,
                PATH: `${path.resolve(ZKP_ENGINE_DIR, "node_modules", ".bin")}${path.delimiter}${process.env.PATH || ""}`
            }
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
            stdout += data.toString();
            console.log(`[ZKP] ${data.toString().trim()}`);
        });

        child.stderr.on("data", (data) => {
            stderr += data.toString();
            console.error(`[ZKP ERR] ${data.toString().trim()}`);
        });

        // Pipe claim indices to stdin after a short delay to let the
        // menu prompt appear
        setTimeout(() => {
            if (child.writable || child.stdin?.writable) {
                child.stdin.write(claimIndicesStr + "\n");
                child.stdin.end();
            }
        }, 2000);

        child.on("close", (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(
                    new Error(
                        `ZKP pipeline exited with code ${code}.\n` +
                            `stdout: ${stdout}\n` +
                            `stderr: ${stderr}`
                    )
                );
            }
        });

        child.on("error", (err) => {
            reject(new Error(`Failed to start ZKP pipeline: ${err.message}`));
        });
    });
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

        const { fileId, claims } = req.body;

        // ── Validate request ────────────────────────────────────
        if (!fileId) {
            return res.status(400).json({
                success: false,
                message: "fileId is required",
            });
        }

        if (!claims || !Array.isArray(claims) || claims.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one claim must be selected",
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
                message: `Uploaded file not found for fileId: ${fileId}`,
            });
        }

        console.log(`\n[GenerateProof] File found: ${uploadedFilePath}`);

        // ── Map claims to menu indices ──────────────────────────
        const claimIndices = getClaimIndices(normalizedClaims);
        if (!claimIndices) {
            return res.status(400).json({
                success: false,
                message: `Unsupported claim combination: ${normalizedClaims.join(", ")}. Claims must all be from the same document type.`,
            });
        }

        // ── Determine circuit name for output file lookup ───────
        const circuitName = getCircuitName(normalizedClaims);
        if (!circuitName) {
            return res.status(400).json({
                success: false,
                message: `Unsupported claim combination: ${normalizedClaims.join(", ")}`,
            });
        }

        console.log(`[GenerateProof] Claims: ${normalizedClaims.join(", ")}`);
        console.log(`[GenerateProof] Claim indices: ${claimIndices.join(" ")}`);
        console.log(`[GenerateProof] Circuit: ${circuitName}`);

        // ── Copy file to zk-document-verification/documents/ ────
        const originalName = path.basename(uploadedFilePath).replace(/^[a-f0-9-]+-/, "");
        const destPath = path.join(ZKP_DOCUMENTS_DIR, originalName);

        // Ensure documents directory exists
        if (!fs.existsSync(ZKP_DOCUMENTS_DIR)) {
            fs.mkdirSync(ZKP_DOCUMENTS_DIR, { recursive: true });
        }

        fs.copyFileSync(uploadedFilePath, destPath);
        console.log(`[GenerateProof] Copied to: ${destPath}`);

        // ── Execute ZKP pipeline ────────────────────────────────
        const claimIndicesStr = claimIndices.join(" ");

        console.log(`[GenerateProof] Starting pipeline: node main.js documents/${originalName}`);
        console.log(`[GenerateProof] Stdin input: "${claimIndicesStr}"`);

        await runZKPPipeline(originalName, claimIndicesStr);

        console.log(`[GenerateProof] Pipeline completed successfully`);

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
                message: `Pipeline completed but output files are missing: ${missingFiles.join(", ")}`,
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

        console.log(`[GenerateProof] Output files copied to proofs/`);

        // ── Return success ──────────────────────────────────────
        return res.status(200).json({
            success: true,
            message: "Proof generated successfully",
            claims: normalizedClaims,
            generatedFiles: [
                "proof.json",
                "public.json",
                "verification_key.json",
            ],
        });
    } catch (error) {
        console.error(`[GenerateProof] Error: ${error.message}`);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;