const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function buildCircuit(circuitName) {

    const circuitFile = path.join("circuits", `${circuitName}.circom`);
    const r1csFile = `${circuitName}.r1cs`;
    const wasmDirectory = `${circuitName}_js`;
    const zkeyInitial = `${circuitName}_0000.zkey`;
    const zkeyFinal = `${circuitName}_final.zkey`;
    const verificationKey = `verification_key_${circuitName}.json`;

    if (!fs.existsSync(circuitFile)) {
        throw new Error(`Circuit file not found: ${circuitFile}`);
    }

    console.log("\n========== Circuit Build ==========\n");

    // Step 1: Compile Circuit
    if (!fs.existsSync(r1csFile) || !fs.existsSync(wasmDirectory)) {

        console.log("Compiling Circuit...\n");

        execSync(
            `circom ${circuitFile} --r1cs --wasm --sym`,
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
            `snarkjs groth16 setup ${r1csFile} pot12_final.ptau ${zkeyInitial}`,
            { stdio: "inherit" }
        );

        execSync(
            `snarkjs zkey contribute ${zkeyInitial} ${zkeyFinal} --name="First Contribution" -v -e="zkp-demo-entropy"`,
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
            `snarkjs zkey export verificationkey ${zkeyFinal} ${verificationKey}`,
            { stdio: "inherit" }
        );

        console.log("\n✓ Verification Key Exported\n");

    } else {

        console.log("✓ Verification key already exists.");

    }

    console.log("\n========== Circuit Ready ==========\n");

}

module.exports = buildCircuit;