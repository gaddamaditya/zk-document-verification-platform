const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function generateGradeInput(attributes) {
    let gradeVal = attributes.grade ? attributes.grade.trim().toUpperCase().charCodeAt(0) : 0;
    const input = {
        grade: gradeVal,
        requiredGrade: gradeVal
    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "gradeInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("Grade Circuit Input Generated.");
}

module.exports = generateGradeInput;