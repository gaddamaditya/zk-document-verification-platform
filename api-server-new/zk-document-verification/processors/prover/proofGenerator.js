const fs = require("fs");
const path = require("path");
const snarkjs = require("snarkjs");

const circuits = require("../../config/circuits");
const { ZKP_ROOT } = circuits;

async function generateProof(selectedClaim) {
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

    console.log("\n========== Proof Generation (In-Process Memory Efficient) ==========");
    console.log(`[ProofGenerator] Circuit name     : ${circuit}`);
    console.log(`[ProofGenerator] zKey path        : ${zkeyFile}`);
    console.log(`[ProofGenerator] Witness path     : ${witnessFile}`);
    console.log("[ProofGenerator] Starting Groth16 proving...");

    try {
        const { proof, publicSignals } = await snarkjs.groth16.prove(zkeyFile, witnessFile);

        fs.writeFileSync(proofFile, JSON.stringify(proof, null, 2));
        fs.writeFileSync(publicSignalsFile, JSON.stringify(publicSignals, null, 2));

        console.log("[ProofGenerator] ✓ Groth16 proof generated in-process.");
        console.log(`[ProofGenerator] Proof file          : ${proofFile}`);
        console.log(`[ProofGenerator] Public signals file : ${publicSignalsFile}`);

        return {
            proof: proofFile,
            publicSignals: publicSignalsFile
        };
    } catch (err) {
        console.error(`[ProofGenerator] ❌ Proving failed for circuit ${circuit}:`, err.message);
        throw new Error(`Groth16 proving failed for ${circuit}: ${err.message}`);
    } finally {
        // Clean up temporary witness file after proof generation
        if (fs.existsSync(witnessFile)) {
            try {
                fs.unlinkSync(witnessFile);
                console.log(`[ProofGenerator] ✓ Temporary witness file cleaned up: ${witnessFile}`);
            } catch (cleanupErr) {
                console.warn(`[ProofGenerator] ⚠ Could not remove witness file: ${cleanupErr.message}`);
            }
        }
    }
}

module.exports = generateProof;