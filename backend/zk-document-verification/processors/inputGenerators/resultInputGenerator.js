const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function generateResultInput(attributes) {

    const input = {

        result: attributes.result === "QUALIFIED" ? 1 : 0,

        requiredResult: attributes.result === "QUALIFIED" ? 1 : 0

    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "resultInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("Result Circuit Input Generated.");
}

module.exports = generateResultInput;