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

    // Student Name - look for line with NAME but not FATHER / MOTHER
    const lines = text.split("\n");
    for (let line of lines) {
        line = line.trim();
        if (
            line.includes("NAME") &&
            !line.includes("FATHER") &&
            !line.includes("MOTHER") &&
            !line.includes("SCHOOL") &&
            !line.includes("COLLEGE")
        ) {
            const match = line.match(/NAME[^\w]*([A-Z\s]+)/);
            if (match && match[1].trim()) {
                attributes.studentName = match[1].trim();
                break;
            }
        }
    }

    // Fallback if studentName is still empty
    if (!attributes.studentName) {
        let studentMatch = text.match(/(?:STUDENT\s+)?NAME[^\w]*([A-Z\s]+)/);
        if (studentMatch && !studentMatch[1].includes("FATHER") && !studentMatch[1].includes("MOTHER")) {
            attributes.studentName = studentMatch[1].trim();
        }
    }

    // Father Name
    let fatherMatch = text.match(/FATHER'S NAME[^\w]*([A-Z\s]+)/);
    if (fatherMatch)
        attributes.fatherName = fatherMatch[1].trim();

    // Mother Name
    let motherMatch = text.match(/MOTHER'S NAME[^\w]*([A-Z\s]+)/);
    if (motherMatch)
        attributes.motherName = motherMatch[1].trim();

    // Gender
    if (text.includes("FEMALE"))
        attributes.gender = "FEMALE";
    else if (text.includes("MALE"))
        attributes.gender = "MALE";

    // Grand Total (allows space like GRAND TOTAL: 467)
    let totalMatch = text.match(/GRAND\s*TOTAL[^\d]*([0-9]+)/);
    if (totalMatch)
        attributes.grandTotal = totalMatch[1];

    // Result
    if (
        text.includes("QUALIFIED") ||
        text.includes("PASSED") ||
        text.includes("PASS") ||
        text.includes("RESULT")
    ) {
        attributes.result = "QUALIFIED";
    }

    // Grade (e.g. RESULT: A GRADE or GRADE: A)
    let gradeMatch = text.match(/(?:RESULT|GRADE)[^\w]*([A-Z])(?:\s+GRADE)?/);
    if (gradeMatch) {
        attributes.grade = gradeMatch[1];
    } else {
        let altGradeMatch = text.match(/RESULT:\s*([A-Z]+)/);
        if (altGradeMatch)
            attributes.grade = altGradeMatch[1];
    }

    return attributes;

}

module.exports = extractMarksheet;