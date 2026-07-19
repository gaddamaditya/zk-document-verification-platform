const fs = require("fs");

function generateGradeInput(attributes) {
    let gradeVal = attributes.grade ? attributes.grade.trim().toUpperCase().charCodeAt(0) : 0;
    const input = {
        grade: gradeVal,
        requiredGrade: gradeVal
    };

    fs.writeFileSync(
        "inputs/gradeInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Grade Circuit Input Generated.");
}

module.exports = generateGradeInput;