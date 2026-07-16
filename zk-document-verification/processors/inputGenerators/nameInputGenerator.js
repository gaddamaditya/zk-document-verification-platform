const fs = require("fs");

function generateNameInput(attributes) {

    let name = attributes.name.trim().toUpperCase();

    let actualName = [];

    for (const ch of name) {
        actualName.push(ch.charCodeAt(0));
    }

    // Maximum 16 characters
    if (actualName.length > 16) {
        actualName = actualName.slice(0, 16);
    }

    // Pad remaining positions with 0
    while (actualName.length < 16) {
        actualName.push(0);
    }

    const input = {

        actualName: actualName,

        // For now, claim is the extracted name itself.
        // Later we'll replace this with user input.
        claimedName: [...actualName]

    };

    fs.writeFileSync(
        "inputs/nameInput.json",
        JSON.stringify(input, null, 4)
    );

    console.log("\nName Circuit Input Generated.");

}

module.exports = generateNameInput;