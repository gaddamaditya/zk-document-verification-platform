const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ZKP_ROOT is derived from __dirname so it works regardless of process.cwd().
const ZKP_ROOT = path.resolve(__dirname, "..", "..");

function buildCircuit(circuitName) {

    const wasmFile = path.join(ZKP_ROOT, `${circuitName}_js`, `${circuitName}.wasm`);
    const witnessScript = path.join(ZKP_ROOT, `${circuitName}_js`, "generate_witness.js");
    const zkeyFinal = path.join(ZKP_ROOT, `${circuitName}_final.zkey`);
    const verificationKey = path.join(ZKP_ROOT, `verification_key_${circuitName}.json`);

    // ─── Check runtime requirement ─────────────────────────────
    // Production proof generation only requires the WASM file,
    // generate_witness.js script, final zkey, and verification key.
    // The .r1cs file is NOT required at runtime.
    if (
        fs.existsSync(wasmFile) &&
        fs.existsSync(witnessScript) &&
        fs.existsSync(zkeyFinal) &&
        fs.existsSync(verificationKey)
    ) {
        console.log(`\n✓ Circuit ${circuitName} runtime artifacts exist. Skipping compilation step.\n`);
        return;
    }

    // ─── Fallback compilation (Local Dev only) ─────────────
    const circuitFile = path.join(ZKP_ROOT, "circuits", `${circuitName}.circom`);
    const r1csFile = path.join(ZKP_ROOT, `${circuitName}.r1cs`);
    const zkeyInitial = path.join(ZKP_ROOT, `${circuitName}_0000.zkey`);
    const ptauFile = path.join(ZKP_ROOT, "pot12_final.ptau");

    // Check if circom compiler binary exists in system PATH
    let hasCircom = false;
    try {
        execSync("circom --version", { stdio: "ignore" });
        hasCircom = true;
    } catch {
        hasCircom = false;
    }

    if (!hasCircom) {
        const missing = [];
        if (!fs.existsSync(wasmFile)) missing.push(`${circuitName}_js/${circuitName}.wasm`);
        if (!fs.existsSync(witnessScript)) missing.push(`${circuitName}_js/generate_witness.js`);
        if (!fs.existsSync(zkeyFinal)) missing.push(`${circuitName}_final.zkey`);
        if (!fs.existsSync(verificationKey)) missing.push(`verification_key_${circuitName}.json`);

        throw new Error(
            `Required runtime artifacts for circuit "${circuitName}" are missing (${missing.join(", ")}), ` +
            `and circom compiler is not available in this environment.`
        );
    }

    if (!fs.existsSync(circuitFile)) {
        throw new Error(`Circuit file not found: ${circuitFile}`);
    }

    // Resolve snarkjs binary
    const localSnarkjs = path.join(ZKP_ROOT, "node_modules", ".bin", "snarkjs");
    const snarkjsBin = fs.existsSync(localSnarkjs) ? `"${localSnarkjs}"` : "snarkjs";

    console.log("\n========== Circuit Build ==========\n");

    // Step 1: Compile Circuit
    if (!fs.existsSync(r1csFile) || !fs.existsSync(path.join(ZKP_ROOT, `${circuitName}_js`))) {

        console.log("Compiling Circuit...\n");

        execSync(
            `circom "${circuitFile}" --r1cs --wasm --sym -o "${ZKP_ROOT}"`,
            { stdio: "inherit" }
        );

        console.log("\n✓ Circuit Compilation Completed\n");

    } else {

        console.log("✓ Circuit already compiled.");

    }

    // Step 2: Trusted Setup
    if (!fs.existsSync(zkeyFinal)) {

        console.log("\nGenerating zKey...\n");

        execSync(
            `${snarkjsBin} groth16 setup "${r1csFile}" "${ptauFile}" "${zkeyInitial}"`,
            { stdio: "inherit" }
        );

        execSync(
            `${snarkjsBin} zkey contribute "${zkeyInitial}" "${zkeyFinal}" --name="First Contribution" -v -e="zkp-demo-entropy"`,
            { stdio: "inherit" }
        );

        console.log("\n✓ zKey Generated\n");

    } else {

        console.log("✓ Final zKey already exists.");

    }

    // Step 3: Export Verification Key
    if (!fs.existsSync(verificationKey)) {

        console.log("\nExporting Verification Key...\n");

        execSync(
            `${snarkjsBin} zkey export verificationkey "${zkeyFinal}" "${verificationKey}"`,
            { stdio: "inherit" }
        );

        console.log("\n✓ Verification Key Exported\n");

    } else {

        console.log("✓ Verification key already exists.");

    }

    console.log("\n========== Circuit Ready ==========\n");

}

module.exports = buildCircuit;