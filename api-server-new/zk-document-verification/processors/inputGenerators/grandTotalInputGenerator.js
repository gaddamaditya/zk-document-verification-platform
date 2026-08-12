const fs = require("fs");
const path = require("path");
const { ZKP_ROOT } = require("../../config/circuits");

function generateGrandTotalInput(attributes) {
    const val = parseInt(attributes.grandTotal) || 0;
    const input = {
        grandTotal: val,
        requiredGrandTotal: val
    };

    const inputsDir = path.join(ZKP_ROOT, "inputs");
    if (!fs.existsSync(inputsDir)) {
        fs.mkdirSync(inputsDir, { recursive: true });
    }

    const outputPath = path.join(inputsDir, "grandTotalInput.json");
    fs.writeFileSync(outputPath, JSON.stringify(input, null, 4));

    console.log("Grand Total Circuit Input Generated.");
}

module.exports = generateGrandTotalInput;