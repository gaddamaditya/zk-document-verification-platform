function detectDocumentType(text) {

    text = text.toUpperCase();

    if (
        text.includes("UNIQUE IDENTIFICATION AUTHORITY") ||
        text.includes("AADHAAR")
    ) {
        return "AADHAAR";
    }

    if (
        text.includes("MEMORANDUM OF MARKS") ||
        text.includes("BOARD OF INTERMEDIATE")
    ) {
        return "MARKSHEET";
    }


    return "UNKNOWN";
}

module.exports = detectDocumentType;