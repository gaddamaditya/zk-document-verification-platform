const tesseractOcr = require("node-tesseract-ocr");
const { createWorker } = require("tesseract.js");

const config = {
    lang: "eng"
};

async function extractImage(filePath) {
    try {
        const text = await tesseractOcr.recognize(filePath, config);
        if (text && text.trim().length > 0) {
            return text;
        }
    } catch (error) {
        console.warn("node-tesseract-ocr CLI unavailable or failed, using tesseract.js fallback:", error.message);
    }

    try {
        const worker = await createWorker("eng");
        const ret = await worker.recognize(filePath);
        await worker.terminate();
        return ret.data.text || "";
    } catch (jsError) {
        console.error("tesseract.js OCR Error:", jsError);
        return "";
    }
}

module.exports = extractImage;