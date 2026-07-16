const fs = require("fs");

function generateGrandTotalInput(attributes) {

    const input = {

        grandTotal: parseInt(attributes.grandTotal)

    };

    fs.writeFileSync(
        "inputs/grandTotalInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("Grand Total Circuit Input Generated.");
}

module.exports = generateGrandTotalInput;