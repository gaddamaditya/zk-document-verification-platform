const fs = require("fs");

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

    fs.writeFileSync(
        "inputs/studentNameInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Student Name Circuit Input Generated.");
}

module.exports = generateStudentNameInput;