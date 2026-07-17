const fs = require("fs");

function generateGrandTotalInput(attributes) {
    const val = parseInt(attributes.grandTotal) || 0;
    const input = {
        grandTotal: val,
        requiredGrandTotal: val
    };

    fs.writeFileSync(
        "inputs/grandTotalInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Grand Total Circuit Input Generated.");
}

module.exports = generateGrandTotalInput;