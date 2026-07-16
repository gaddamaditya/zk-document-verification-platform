const fs = require("fs");

function generateGradeInput(attributes) {

    const input = {

        grade: attributes.grade

    };

    fs.writeFileSync(
        "inputs/gradeInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Grade Circuit Input Generated.");
}

module.exports = generateGradeInput;