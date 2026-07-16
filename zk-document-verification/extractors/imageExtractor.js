const tesseract = require("node-tesseract-ocr");

const config = {
    lang: "eng"
};

async function extractImage(filePath) {

    try {

        const text = await tesseract.recognize(filePath, config);

        return text;

    } catch (error) {

        console.error("OCR Error:", error);

        return "";

    }

}

module.exports = extractImage;