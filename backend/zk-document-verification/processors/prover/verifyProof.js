const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const circuits = require("../../config/circuits");
const { ZKP_ROOT, getSnarkjsCmd } = circuits;

function verifyProof(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error(`No configuration found for claim: ${selectedClaim}`);
    }

    const circuit = config.circuit;

    const verificationKey = path.join(ZKP_ROOT, `verification_key_${circuit}.json`);
    const proofFile = path.join(ZKP_ROOT, `${circuit}_proof.json`);
    const publicSignalsFile = path.join(ZKP_ROOT, `${circuit}_public.json`);

    if (!fs.existsSync(verificationKey)) {
        throw new Error(`Verification key not found: ${verificationKey}`);
    }

    if (!fs.existsSync(proofFile)) {
        throw new Error(`Proof file not found: ${proofFile}`);
    }

    if (!fs.existsSync(publicSignalsFile)) {
        throw new Error(`Public signals file not found: ${publicSignalsFile}`);
    }

    // Resolve local snarkjs executable via Node resolution / local bin
    const snarkjsBin = getSnarkjsCmd();

    console.log("\n========== Proof Verification ==========\n");

    execSync(
        `${snarkjsBin} groth16 verify "${verificationKey}" "${publicSignalsFile}" "${proofFile}"`,
        { stdio: "inherit" }
    );

    console.log("\n✓ Proof Verified Successfully.");
}

module.exports = verifyProof;