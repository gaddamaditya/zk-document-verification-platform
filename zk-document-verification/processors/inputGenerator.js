const fs = require("fs");

function generateInput(attributes) {

    // Convert Name into ASCII values
    let privateData = [];

    for (let i = 0; i < attributes.name.length; i++) {
        privateData.push(attributes.name.charCodeAt(i));
    }

    // Pad to 16 values
    while (privateData.length < 16) {
        privateData.push(0);
    }

    // Take only first 16 characters
    privateData = privateData.slice(0,16);

    // Extract Birth Year
    let birthYear = parseInt(attributes.dob.slice(-4));

    // Convert Gender
    let gender = attributes.gender === "MALE" ? 1 : 0;

    let input = {

        privateData,

        birthYear,

        gender,

        currentYear: new Date().getFullYear()

    };

    fs.writeFileSync(
        "input.json",
        JSON.stringify(input,null,2)
    );

    console.log("input.json created successfully.");

return input;

}

module.exports = generateInput;
