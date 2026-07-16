function selectCircuit(claim) {

    switch (claim) {

        case "NAME":
            return {
                circuitName: "documentVerifier",
                inputFile: "inputs/nameInput.json",
                zkey: "documentVerifier_final.zkey",
                verificationKey: "verification_key.json"
            };

        case "AGE_18_PLUS":
            return {
                circuitName: "AgeVerifier",
                inputFile: "inputs/ageInput.json",
                zkey: "AgeVerifier_final.zkey",
                verificationKey: "verification_key_age.json"
            };

        case "GENDER":
            return {
                circuitName: "GenderVerifier",
                inputFile: "inputs/genderInput.json",
                zkey: "GenderVerifier_final.zkey",
                verificationKey: "verification_key_gender.json"
            };

        case "RESULT":
            return {
                circuitName: "ResultVerifier",
                inputFile: "inputs/resultInput.json",
                zkey: "ResultVerifier_final.zkey",
                verificationKey: "verification_key_result.json"
            };

        case "GRADE":
            return {
                circuitName: "ResultVerifier",
                inputFile: "inputs/gradeInput.json",
                zkey: "ResultVerifier_final.zkey",
                verificationKey: "verification_key_result.json"
            };

        case "GRAND_TOTAL":
            return {
                circuitName: "ResultVerifier",
                inputFile: "inputs/grandTotalInput.json",
                zkey: "ResultVerifier_final.zkey",
                verificationKey: "verification_key_result.json"
            };

        case "STUDENT_NAME":
            return {
                circuitName: "ResultVerifier",
                inputFile: "inputs/studentNameInput.json",
                zkey: "ResultVerifier_final.zkey",
                verificationKey: "verification_key_result.json"
            };

        default:
            return null;
    }
}

module.exports = selectCircuit;