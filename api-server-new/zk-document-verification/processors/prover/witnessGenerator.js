const fs = require("fs");
const path = require("path");

const circuits = require("../../config/circuits");
const { ZKP_ROOT } = circuits;

async function generateWitness(selectedClaim) {
    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;
    const inputFile = config.inputFile;

    const wasmFile = path.join(ZKP_ROOT, `${circuit}_js`, `${circuit}.wasm`);
    const witnessCalculatorPath = path.join(ZKP_ROOT, `${circuit}_js`, "witness_calculator.js");
    const witnessFile = path.join(ZKP_ROOT, `${circuit}.wtns`);

    if (!fs.existsSync(inputFile)) {
        throw new Error(`Input file not found: ${inputFile}`);
    }

    if (!fs.existsSync(wasmFile)) {
        throw new Error(`WASM file not found: ${wasmFile}`);
    }

    if (!fs.existsSync(witnessCalculatorPath)) {
        throw new Error(`Witness calculator script not found: ${witnessCalculatorPath}`);
    }

    console.log("\n========== Witness Generation (In-Process) ==========");
    console.log(`[WitnessGenerator] Circuit       : ${circuit}`);
    console.log(`[WitnessGenerator] WASM file     : ${wasmFile}`);
    console.log(`[WitnessGenerator] Input file    : ${inputFile}`);

    const wc = require(witnessCalculatorPath);
    const wasmBuffer = fs.readFileSync(wasmFile);
    const inputJson = JSON.parse(fs.readFileSync(inputFile, "utf-8"));

    const witnessCalculator = await wc(wasmBuffer);
    const buff = await witnessCalculator.calculateWTNSBin(inputJson, 0);
    fs.writeFileSync(witnessFile, buff);

    if (!fs.existsSync(witnessFile)) {
        throw new Error("Witness generation failed.");
    }

    console.log("[WitnessGenerator] ✓ Witness generated successfully in-process.");
    console.log(`[WitnessGenerator] Witness file : ${witnessFile}`);

    return witnessFile;
}

module.exports = generateWitness;