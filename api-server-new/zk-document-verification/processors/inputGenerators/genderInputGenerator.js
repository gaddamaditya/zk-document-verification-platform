const fs = require("fs");

function generateGenderInput(attributes) {

    const input = {
        gender: attributes.gender === "MALE" ? 1 : 0,
        requiredGender: attributes.gender === "MALE" ? 1 : 0
    };

    fs.writeFileSync(
        "inputs/genderInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Gender Circuit Input Generated.");
}

module.exports = generateGenderInput;