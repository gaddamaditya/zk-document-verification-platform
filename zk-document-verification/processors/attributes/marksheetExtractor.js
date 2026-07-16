function extractMarksheet(text) {

    const attributes = {

        type: "MARKSHEET",

        studentName: "",
        fatherName: "",
        motherName: "",

        gender: "",

        grandTotal: "",

        result: "",

        grade: ""

    };

    text = text.toUpperCase();

    // Student Name
    let studentMatch = text.match(/NAME\s+([A-Z ]+)/);

    if (studentMatch)
        attributes.studentName = studentMatch[1].trim();

    // Father Name
    let fatherMatch = text.match(/FATHER'S NAME\s+([A-Z ]+)/);

    if (fatherMatch)
        attributes.fatherName = fatherMatch[1].trim();

    // Mother Name
    let motherMatch = text.match(/MOTHER'S NAME\s+([A-Z ]+)/);

    if (motherMatch)
        attributes.motherName = motherMatch[1].trim();

    // Gender
    if (text.includes("FEMALE"))
        attributes.gender = "FEMALE";

    else if (text.includes("MALE"))
        attributes.gender = "MALE";

    // Grand Total
    let totalMatch = text.match(/GRANDTOTAL:\s*([0-9]+)/);

    if (totalMatch)
        attributes.grandTotal = totalMatch[1];

    // Result
    if (text.includes("QUALIFIED"))
        attributes.result = "QUALIFIED";

    // Grade
    let gradeMatch = text.match(/RESULT:\s*([A-Z]+)/);

    if (gradeMatch)
        attributes.grade = gradeMatch[1];

    return attributes;

}

module.exports = extractMarksheet;