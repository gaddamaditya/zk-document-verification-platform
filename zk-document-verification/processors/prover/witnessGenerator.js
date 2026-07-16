const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const circuits = require("../../config/circuits");

function generateWitness(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;
    const inputFile = config.inputFile;

    const wasmFile = path.join(`${circuit}_js`, `${circuit}.wasm`);
    const witnessGenerator = path.join(`${circuit}_js`, "generate_witness.js");
    const witnessFile = `${circuit}.wtns`;

    if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
    }

    if (!fs.existsSync(wasmFile)) {
        throw new Error(`WASM file not found: ${wasmFile}`);
    }

    if (!fs.existsSync(witnessGenerator)) {
        throw new Error(`Witness generator not found: ${witnessGenerator}`);
    }

    console.log("\n========== Witness Generation ==========\n");

    execSync(
        `node ${witnessGenerator} ${wasmFile} ${inputFile} ${witnessFile}`,
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