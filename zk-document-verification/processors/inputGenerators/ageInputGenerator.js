const fs = require("fs");

function generateAgeInput(attributes) {

    const birthYear = parseInt(attributes.dob.split("/")[2]);

    const input = {

        birthYear: birthYear,

        currentYear: new Date().getFullYear()

    };

    fs.writeFileSync(

        "inputs/ageInput.json",

        JSON.stringify(input, null, 4)

    );

    console.log("\nAge Circuit Input Generated.");

}

module.exports = generateAgeInput;