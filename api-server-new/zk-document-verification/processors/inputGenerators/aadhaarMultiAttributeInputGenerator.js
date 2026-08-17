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

function parseBirthYear(dobStr) {
    if (!dobStr) return 2000;
    const parts = dobStr.split(/[\/\-\.]/);
    if (parts.length >= 3) {
        const yearCandidate = parseInt(parts[2], 10);
        if (!isNaN(yearCandidate)) return yearCandidate;
    }
    return 2000;
}

function generateAadhaarMultiAttributeInput(attributes, selectedClaims = []) {
    const actualNameStr = attributes.name || "";
    const actualDOBStr = attributes.dob || "";
    const actualGenderVal = (attributes.gender || "").toUpperCase() === "MALE" ? 1 : 0;
    const birthYr = parseBirthYear(actualDOBStr);

    const input = {
        actualName: convertToAsciiArray(actualNameStr, 16),
        birthYear: birthYr,
        gender: actualGenderVal,

        claimedName: convertToAsciiArray(actualNameStr, 16),
        currentYear: new Date().getFullYear(),
        requiredGender: actualGenderVal,
    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "aadhaarMultiAttributeInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("\n[AadhaarMultiAttributeInput] Generated successfully.");
}

module.exports = generateAadhaarMultiAttributeInput;
