const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function generateGenderInput(attributes) {

    const input = {
        gender: attributes.gender === "MALE" ? 1 : 0,
        requiredGender: attributes.gender === "MALE" ? 1 : 0
    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "genderInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("Gender Circuit Input Generated.");
}

module.exports = generateGenderInput;