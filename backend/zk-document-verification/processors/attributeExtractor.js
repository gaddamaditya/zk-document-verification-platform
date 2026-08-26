const extractAadhaar = require("./attributes/aadhaarExtractor");
const extractMarksheet = require("./attributes/marksheetExtractor");

function extractAttributes(documentType, text) {

    switch (documentType) {

        case "AADHAAR":
            return extractAadhaar(text);

        case "MARKSHEET":
            return extractMarksheet(text);

        default:
            return {
                type: "UNKNOWN"
            };

    }

}

module.exports = extractAttributes;