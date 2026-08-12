const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function generateAgeInput(attributes) {

    const birthYear = parseInt(attributes.dob.split("/")[2]);

    const input = {

        birthYear: birthYear,

        currentYear: new Date().getFullYear()

    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "ageInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("\nAge Circuit Input Generated.");

}

module.exports = generateAgeInput;