const generateAgeInput = require("./ageInputGenerator");
const generateGenderInput = require("./genderInputGenerator");
const generateNameInput = require("./nameInputGenerator");
const generateResultInput = require("./resultInputGenerator");
const generateGradeInput = require("./gradeInputGenerator");
const generateGrandTotalInput = require("./grandTotalInputGenerator");
const generateStudentNameInput = require("./studentNameInputGenerator");
const generateMultiAttributeInput = require("./multiAttributeInputGenerator");

async function generateInput(selectedClaim, attributes) {

    switch (selectedClaim) {

        case "NAME":
            await generateNameInput(attributes);
            break;

        case "AGE_18_PLUS":
            generateAgeInput(attributes);
            break;

        case "GENDER":
            generateGenderInput(attributes);
            break;

        case "RESULT":
            generateResultInput(attributes);
            break;

        case "GRADE":
            generateGradeInput(attributes);
            break;

        case "GRAND_TOTAL":
            generateGrandTotalInput(attributes);
            break;

        case "STUDENT_NAME":
            generateStudentNameInput(attributes);
            break;

        case "MULTI_ATTRIBUTE":
            generateMultiAttributeInput(attributes);
            break;

        default:
            throw new Error(`Unsupported Claim: ${selectedClaim}`);
    }
}

module.exports = generateInput;