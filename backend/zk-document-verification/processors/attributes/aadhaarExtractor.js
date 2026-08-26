function extractAadhaar(text) {

    const attributes = {
        type: "AADHAAR",
        name: "",
        dob: "",
        gender: ""
    };

    // ---------- Name ----------
    const lines = text.split("\n");

    for (let line of lines) {

        line = line.trim();

        if (/^[A-Z]+\s+[A-Z]+$/.test(line)) {

            if (
                !line.includes("ENROLMENT") &&
                !line.includes("AUTHORITY") &&
                !line.includes("INDIA") &&
                !line.includes("ADDRESS")
            ) {

                attributes.name = line;
                break;
            }
        }
    }

    // ---------- DOB ----------

    const dobMatch = text.match(/DOB[:\s]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i);

    if (dobMatch) {
        attributes.dob = dobMatch[1];
    }

    // ---------- Gender ----------

    if (text.includes("FEMALE")) {

        attributes.gender = "FEMALE";

    } else if (text.includes("MALE")) {

        attributes.gender = "MALE";

    }

    return attributes;
}

module.exports = extractAadhaar;