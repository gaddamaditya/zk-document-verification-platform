const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const circuits = require("../../config/circuits");
const { ZKP_ROOT } = circuits;

function generateWitness(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;
    const inputFile = config.inputFile; // already absolute from circuits.js

    const wasmFile = path.join(ZKP_ROOT, `${circuit}_js`, `${circuit}.wasm`);
    const witnessGeneratorScript = path.join(ZKP_ROOT, `${circuit}_js`, "generate_witness.js");
    const witnessFile = path.join(ZKP_ROOT, `${circuit}.wtns`);

    if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
    }

    if (!fs.existsSync(wasmFile)) {
        throw new Error(`WASM file not found: ${wasmFile}`);
    }

    if (!fs.existsSync(witnessGeneratorScript)) {
        throw new Error(`Witness generator not found: ${witnessGeneratorScript}`);
    }

    console.log("\n========== Witness Generation ==========\n");

    execSync(
        `node "${witnessGeneratorScript}" "${wasmFile}" "${inputFile}" "${witnessFile}"`,
        { stdio: "inherit" }
    );

    if (!fs.existsSync(witnessFile)) {
        throw new Error("Witness generation failed.");
    }

    console.log("\n✓ Witness Generated Successfully.");
    console.log(`Witness File : ${witnessFile}`);

    return witnessFile;
}

module.exports = generateWitness;