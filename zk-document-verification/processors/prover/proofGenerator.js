const fs = require("fs");
const { execSync } = require("child_process");

const circuits = require("../../config/circuits");

function generateProof(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;

    const witnessFile = `${circuit}.wtns`;
    const zkeyFile = `${circuit}_final.zkey`;
    const proofFile = `${circuit}_proof.json`;
    const publicSignalsFile = `${circuit}_public.json`;

    if (!fs.existsSync(witnessFile)) {
        throw new Error(`Witness file not found: ${witnessFile}`);
    }

    if (!fs.existsSync(zkeyFile)) {
        throw new Error(`Final zKey not found: ${zkeyFile}`);
    }

    console.log("\n========== Proof Generation ==========\n");

    execSync(
        `snarkjs groth16 prove ${zkeyFile} ${witnessFile} ${proofFile} ${publicSignalsFile}`,
        { stdio: "inherit" }
    );

    if (!fs.existsSync(proofFile)) {
        throw new Error(`Proof file was not generated: ${proofFile}`);
    }

    if (!fs.existsSync(publicSignalsFile)) {
        throw new Error(`Public signals file was not generated: ${publicSignalsFile}`);
    }

    console.log("\n✓ Proof Generated Successfully.");
    console.log(`Proof File          : ${proofFile}`);
    console.log(`Public Signals File : ${publicSignalsFile}`);

    return {
        proof: proofFile,
        publicSignals: publicSignalsFile
    };
}

module.exports = generateProof;