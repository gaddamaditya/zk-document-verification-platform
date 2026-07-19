module.exports = {

    NAME: {
        circuit: "NameVerifier",
        inputFile: "inputs/nameInput.json",
        description: "Verify Name"
    },

    AGE_18_PLUS: {
        circuit: "AgeVerifier",
        inputFile: "inputs/ageInput.json",
        description: "Verify Age is 18+"
    },

    GENDER: {
        circuit: "GenderVerifier",
        inputFile: "inputs/genderInput.json",
        description: "Verify Gender"
    },

    RESULT: {
        circuit: "ResultVerifier",
        inputFile: "inputs/resultInput.json",
        description: "Verify Result"
    },

    GRADE: {
        circuit: "GradeVerifier",
        inputFile: "inputs/gradeInput.json",
        description: "Verify Grade"
    },

    GRAND_TOTAL: {
        circuit: "GrandTotalVerifier",
        inputFile: "inputs/grandTotalInput.json",
        description: "Verify Grand Total"
    },

    STUDENT_NAME: {
        circuit: "StudentNameVerifier",
        inputFile: "inputs/studentNameInput.json",
        description: "Verify Student Name"
    },

    MULTI_ATTRIBUTE: {
        circuit: "MultiAttributeVerifier",
        inputFile: "inputs/multiAttributeInput.json",
        description: "Verify Multiple Attributes"
    }

};