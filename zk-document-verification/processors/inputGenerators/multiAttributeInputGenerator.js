const fs = require("fs");

function convertToAsciiArray(text) {

    text = text.trim().toUpperCase();

    let asciiArray = [];

    for (const ch of text) {
        asciiArray.push(ch.charCodeAt(0));
    }

    if (asciiArray.length > 16) {
        asciiArray = asciiArray.slice(0, 16);
    }

    while (asciiArray.length < 16) {
        asciiArray.push(0);
    }

    return asciiArray;
}

function generateMultiAttributeInput(attributes) {

    const input = {

        // ---------- Name ----------

        actualName: convertToAsciiArray(attributes.name),

        claimedName: convertToAsciiArray(attributes.name),

        // ---------- Age ----------

        birthYear: parseInt(attributes.dob.split("/")[2]),

        currentYear: 2026,

        // ---------- Gender ----------

        gender: attributes.gender === "MALE" ? 1 : 0,

        requiredGender: attributes.gender === "MALE" ? 1 : 0

    };

    fs.writeFileSync(
        "inputs/multiAttributeInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("\nMulti Attribute Input Generated.");

}

module.exports = generateMultiAttributeInput;