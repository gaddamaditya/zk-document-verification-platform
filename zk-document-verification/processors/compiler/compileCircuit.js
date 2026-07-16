const fs = require("fs");
const { execSync } = require("child_process");

function compileCircuit(circuitName) {

    const wasmFolder = `${circuitName}_js`;

    if (fs.existsSync(wasmFolder)) {

        console.log("\nCircuit already compiled.");

        return;

    }

    console.log("\n========== Compiling Circuit ==========\n");

    execSync(

        `circom circuits/${circuitName}.circom --r1cs --wasm --sym`,

        { stdio: "inherit" }

    );

    console.log("\nCircuit Compilation Completed.");

}

module.exports = compileCircuit;