const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function convertToAsciiArray(text, len = 16) {
    if (!text) text = "";
    text = text.trim().toUpperCase();
    let asciiArray = [];
    for (const ch of text) {
        asciiArray.push(ch.charCodeAt(0));
    }
    if (asciiArray.length > len) {
        asciiArray = asciiArray.slice(0, len);
    }
    while (asciiArray.length < len) {
        asciiArray.push(0);
    }
    return asciiArray;
}

function generateMarksheetMultiAttributeInput(attributes, selectedClaims = []) {
    const studentNameStr = attributes.studentName || attributes.name || "";
    const genderVal = (attributes.gender || "").toUpperCase() === "MALE" ? 1 : 0;
    const birthYr = 2000;

    const input = {
        actualName: convertToAsciiArray(studentNameStr, 16),
        birthYear: birthYr,
        gender: genderVal,

        claimedName: convertToAsciiArray(studentNameStr, 16),
        currentYear: new Date().getFullYear(),
        requiredGender: genderVal,
    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "marksheetMultiAttributeInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("\n[MarksheetMultiAttributeInput] Generated successfully.");
}

module.exports = generateMarksheetMultiAttributeInput;
