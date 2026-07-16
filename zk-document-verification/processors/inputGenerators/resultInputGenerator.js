const fs = require("fs");

function generateResultInput(attributes) {

    const input = {

        result: attributes.result === "QUALIFIED" ? 1 : 0,

        requiredResult: attributes.result === "QUALIFIED" ? 1 : 0

    };

    fs.writeFileSync(
        "inputs/resultInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Result Circuit Input Generated.");
}

module.exports = generateResultInput;