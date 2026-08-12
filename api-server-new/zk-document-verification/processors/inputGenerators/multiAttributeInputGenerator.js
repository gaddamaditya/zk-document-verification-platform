const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

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

        currentYear: new Date().getFullYear(),

        // ---------- Gender ----------

        gender: attributes.gender === "MALE" ? 1 : 0,

        requiredGender: attributes.gender === "MALE" ? 1 : 0

    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "multiAttributeInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("\nMulti Attribute Input Generated.");

}

module.exports = generateMultiAttributeInput;