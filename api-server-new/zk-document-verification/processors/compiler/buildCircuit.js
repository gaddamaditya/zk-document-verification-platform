const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ZKP_ROOT is imported to resolve all paths absolutely.
// However, we avoid importing from circuits.js here to prevent
// circular dependency issues if circuits.js ever imports compiler.
// Instead, derive ZKP_ROOT from __dirname.
const ZKP_ROOT = path.resolve(__dirname, "..", "..");

function buildCircuit(circuitName) {

    const circuitFile = path.join(ZKP_ROOT, "circuits", `${circuitName}.circom`);
    const r1csFile = path.join(ZKP_ROOT, `${circuitName}.r1cs`);
    const wasmDirectory = path.join(ZKP_ROOT, `${circuitName}_js`);
    const zkeyInitial = path.join(ZKP_ROOT, `${circuitName}_0000.zkey`);
    const zkeyFinal = path.join(ZKP_ROOT, `${circuitName}_final.zkey`);
    const verificationKey = path.join(ZKP_ROOT, `verification_key_${circuitName}.json`);
    const ptauFile = path.join(ZKP_ROOT, "pot12_final.ptau");

    if (
        fs.existsSync(r1csFile) &&
        fs.existsSync(wasmDirectory) &&
        fs.existsSync(zkeyFinal) &&
        fs.existsSync(verificationKey)
    ) {
        console.log(`\n✓ Circuit ${circuitName} already compiled and built. Skipping build step.\n`);
        return;
    }

    if (!fs.existsSync(circuitFile)) {
        throw new Error(`Circuit file not found: ${circuitFile}`);
    }

    // Resolve snarkjs binary
    const localSnarkjs = path.join(ZKP_ROOT, "node_modules", ".bin", "snarkjs");
    const snarkjsBin = fs.existsSync(localSnarkjs) ? `"${localSnarkjs}"` : "snarkjs";

    console.log("\n========== Circuit Build ==========\n");

    // Step 1: Compile Circuit
    if (!fs.existsSync(r1csFile) || !fs.existsSync(wasmDirectory)) {

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