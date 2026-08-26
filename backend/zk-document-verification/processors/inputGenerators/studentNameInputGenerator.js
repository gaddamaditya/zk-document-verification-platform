const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function generateStudentNameInput(attributes) {

    let name = attributes.studentName.trim().toUpperCase();

    let actualStudentName = [];

    for (const ch of name) {
        actualStudentName.push(ch.charCodeAt(0));
    }

    // Maximum 16 characters
    if (actualStudentName.length > 16) {
        actualStudentName = actualStudentName.slice(0, 16);
    }

    // Pad remaining positions with 0
    while (actualStudentName.length < 16) {
        actualStudentName.push(0);
    }

    const input = {
        actualStudentName: actualStudentName,
        claimedStudentName: [...actualStudentName]
    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "studentNameInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("Student Name Circuit Input Generated.");
}

module.exports = generateStudentNameInput;