const fs = require("fs");

function generateStudentNameInput(attributes) {

    const input = {

        studentName: attributes.studentName

    };

    fs.writeFileSync(
        "inputs/studentNameInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Student Name Circuit Input Generated.");
}

module.exports = generateStudentNameInput;