const fs = require("fs");
const { execSync } = require("child_process");

const circuits = require("../../config/circuits");

function verifyProof(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;

    const verificationKey = `verification_key_${circuit}.json`;
    const proofFile = `${circuit}_proof.json`;
    const publicSignalsFile = `${circuit}_public.json`;

    if (!fs.existsSync(verificationKey)) {
        throw new Error(`Verification key not found: ${verificationKey}`);
    }

    if (!fs.existsSync(proofFile)) {
        throw new Error(`Proof file not found: ${proofFile}`);
    }

    if (!fs.existsSync(publicSignalsFile)) {
        throw new Error(`Public signals file not found: ${publicSignalsFile}`);
    }

    console.log("\n========== Proof Verification ==========\n");

    execSync(
        `snarkjs groth16 verify ${verificationKey} ${publicSignalsFile} ${proofFile}`,
        { stdio: "inherit" }
    );

    console.log("\n✓ Proof Verified Successfully.");
}

module.exports = verifyProof;