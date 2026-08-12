const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const circuits = require("../../config/circuits");
const { ZKP_ROOT } = circuits;

function generateProof(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;

    const witnessFile = path.join(ZKP_ROOT, `${circuit}.wtns`);
    const zkeyFile = path.join(ZKP_ROOT, `${circuit}_final.zkey`);
    const proofFile = path.join(ZKP_ROOT, `${circuit}_proof.json`);
    const publicSignalsFile = path.join(ZKP_ROOT, `${circuit}_public.json`);

    if (!fs.existsSync(witnessFile)) {
        throw new Error(`Witness file not found: ${witnessFile}`);
    }

    if (!fs.existsSync(zkeyFile)) {
        throw new Error(`Final zKey not found: ${zkeyFile}`);
    }

    // Resolve snarkjs binary — prefer local node_modules, fallback to global
    const localSnarkjs = path.join(ZKP_ROOT, "node_modules", ".bin", "snarkjs");
    const snarkjsBin = fs.existsSync(localSnarkjs) ? `"${localSnarkjs}"` : "snarkjs";

    console.log("\n========== Proof Generation ==========\n");

    execSync(
        `${snarkjsBin} groth16 prove "${zkeyFile}" "${witnessFile}" "${proofFile}" "${publicSignalsFile}"`,
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