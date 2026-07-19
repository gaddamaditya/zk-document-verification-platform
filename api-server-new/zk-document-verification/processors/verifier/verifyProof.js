const { execSync } = require("child_process");
const circuits = require("../../config/circuits");

function verifyProof(selectedClaim) {

    const config = circuits[selectedClaim];

    if (!config) {
        throw new Error("Unsupported Claim");
    }

    console.log("\n========== Verifying Proof ==========\n");

    const command =
        `snarkjs groth16 verify ${config.verificationKey} ${config.public} ${config.proof}`;

    execSync(command, { stdio: "inherit" });

    console.log("\nVerification Successful.");

}

module.exports = verifyProof;