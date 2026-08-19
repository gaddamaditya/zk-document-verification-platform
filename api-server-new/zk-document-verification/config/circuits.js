const path = require("path");
const fs = require("fs");

// ─── ZKP_ROOT ───────────────────────────────────────────────────
// The absolute path to the zk-document-verification project root.
// Derived from __dirname so it works regardless of process.cwd().
// Every module in the ZKP engine should import this and use
// path.join(ZKP_ROOT, ...) for all filesystem operations.
const ZKP_ROOT = path.resolve(__dirname, "..");

/**
 * Resolves the locally installed snarkjs executable command string.
 * Works on Linux (Render), Windows, macOS, in root or subdirectories.
 */
function getSnarkjsCmd() {
    // 1. Try Node.js resolution via require.resolve("snarkjs") -> cli.cjs
    try {
        const snarkMain = require.resolve("snarkjs");
        const cliPath = path.join(path.dirname(snarkMain), "cli.cjs");
        if (fs.existsSync(cliPath)) {
            return `"${process.execPath}" "${cliPath}"`;
        }
    } catch (e) {}

    // 2. Try local node_modules/.bin/snarkjs
    const binName = process.platform === "win32" ? "snarkjs.cmd" : "snarkjs";
    const candidates = [
        path.join(ZKP_ROOT, "node_modules", ".bin", binName),
        path.join(ZKP_ROOT, "..", "node_modules", ".bin", binName),
        path.join(process.cwd(), "node_modules", ".bin", binName),
    ];

    for (const binPath of candidates) {
        if (fs.existsSync(binPath)) {
            return `"${binPath}"`;
        }
    }

    // 3. Fallback to npx
    return "npx --no-install snarkjs";
}

module.exports = {

    ZKP_ROOT,
    getSnarkjsCmd,

    NAME: {
        circuit: "NameVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "nameInput.json"),
        description: "Verify Name"
    },

    AGE_18_PLUS: {
        circuit: "AgeVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "ageInput.json"),
        description: "Verify Age is 18+"
    },

    GENDER: {
        circuit: "GenderVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "genderInput.json"),
        description: "Verify Gender"
    },

    RESULT: {
        circuit: "ResultVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "resultInput.json"),
        description: "Verify Result"
    },

    GRADE: {
        circuit: "GradeVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "gradeInput.json"),
        description: "Verify Grade"
    },

    GRAND_TOTAL: {
        circuit: "GrandTotalVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "grandTotalInput.json"),
        description: "Verify Grand Total"
    },

    STUDENT_NAME: {
        circuit: "StudentNameVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "studentNameInput.json"),
        description: "Verify Student Name"
    },

    MULTI_ATTRIBUTE: {
        circuit: "MultiAttributeVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "multiAttributeInput.json"),
        description: "Verify Multiple Attributes"
    },

    AADHAAR_MULTI_ATTRIBUTE: {
        circuit: "AadhaarMultiAttributeVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "aadhaarMultiAttributeInput.json"),
        description: "Aadhaar Multi-Attribute Verifier"
    },

    MARKSHEET_MULTI_ATTRIBUTE: {
        circuit: "MarksheetMultiAttributeVerifier",
        inputFile: path.join(ZKP_ROOT, "inputs", "marksheetMultiAttributeInput.json"),
        description: "Marksheet Multi-Attribute Verifier"
    }

};