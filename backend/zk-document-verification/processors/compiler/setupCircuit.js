const fs = require("fs");
const { execSync } = require("child_process");

function setupCircuit(circuitName) {

    const finalZkey = `${circuitName}_final.zkey`;
    const verificationKey = `verification_key_${circuitName}.json`;

    if (fs.existsSync(finalZkey) && fs.existsSync(verificationKey)) {

        console.log("\nTrusted setup already completed.");

        return;

    }

    const circuits = require("../../config/circuits");
    const snarkjsBin = circuits.getSnarkjsCmd();

    execSync(
        `${snarkjsBin} groth16 setup ${circuitName}.r1cs pot12_final.ptau ${circuitName}_0000.zkey`,
        { stdio: "inherit" }
    );

    execSync(
        `${snarkjsBin} zkey contribute ${circuitName}_0000.zkey ${finalZkey} --name="First contribution" -v`,
        { stdio: "inherit" }
    );

    execSync(
        `${snarkjsBin} zkey export verificationkey ${finalZkey} ${verificationKey}`,
        { stdio: "inherit" }
    );

    console.log("\nTrusted Setup Completed.");

}

module.exports = setupCircuit;