function selectClaims(userClaims) {

    const claimMap = {
        age: "AGE_18_PLUS",
        gender: "GENDER",
        name: "NAME",
        result: "RESULT",
        grade: "GRADE",
        total: "GRAND_TOTAL",
        student: "STUDENT_NAME"
    };

    const selectedClaims = [];

    for (const claim of userClaims) {

        const selected = claimMap[claim.toLowerCase()];

        if (!selected) {
            throw new Error(`Unsupported claim: ${claim}`);
        }

        selectedClaims.push(selected);
    }

    return selectedClaims;
}

module.exports = selectClaims;