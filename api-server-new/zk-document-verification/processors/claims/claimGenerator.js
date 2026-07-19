function generateClaims(attributes) {

    const claims = [];

    switch (attributes.type) {

        case "AADHAAR":

            claims.push("NAME");

            claims.push("AGE_18_PLUS");

            claims.push("GENDER");

            break;

        case "MARKSHEET":

            claims.push("STUDENT_NAME");

            claims.push("RESULT");

            claims.push("GRADE");

            claims.push("GRAND_TOTAL");

            break;

    }

    return claims;

}

module.exports = generateClaims;