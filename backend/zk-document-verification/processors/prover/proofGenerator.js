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

    console.log("\n[ZKP] Starting proof generation");
    console.log(`[ZKP] Circuit: ${circuit}`);
    console.log(`[ZKP] Witness: ${witnessFile}`);
    console.log(`[ZKP] ZKey: ${zkeyFile}`);
    console.log("[ZKP] Starting snarkjs groth16 prove");

    try {
        const { proof, publicSignals } = await snarkjs.groth16.prove(
            zkeyFile,
            witnessFile,
            {
                debug: (msg) => console.log(`[ZKP snarkjs debug] ${msg}`),
                info: (msg) => console.log(`[ZKP snarkjs info] ${msg}`),
                warn: (msg) => console.warn(`[ZKP snarkjs warn] ${msg}`),
                error: (msg) => console.error(`[ZKP snarkjs error] ${msg}`),
            }
        );

        fs.writeFileSync(proofFile, JSON.stringify(proof, null, 2));
        fs.writeFileSync(publicSignalsFile, JSON.stringify(publicSignals, null, 2));

        console.log("[ZKP] Proof generation completed");
        console.log(`[ZKP] Proof file: ${proofFile}`);

        return {
            proof: proofFile,
            publicSignals: publicSignalsFile
        };
    } catch (err) {
        console.error(`[ZKP] Proving failed for ${circuit}:`, err.message || err);
        throw new Error(`Groth16 proving failed for ${circuit}: ${err.message || err}`);
    } finally {
        if (fs.existsSync(witnessFile)) {
            try {
                fs.unlinkSync(witnessFile);
                console.log(`[ZKP] Temporary witness file cleaned up: ${witnessFile}`);
            } catch (cleanupErr) {
                console.warn(`[ZKP] Could not remove witness file: ${cleanupErr.message}`);
            }
        }
        if (global.gc) {
            try { global.gc(); } catch (e) {}
        }
    }
}

module.exports = generateProof;