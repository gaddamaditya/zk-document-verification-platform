const readline = require("readline");

function claimMenu(claims) {

    return new Promise((resolve) => {

        console.log("\n========== Available Claims ==========\n");

        claims.forEach((claim, index) => {
            console.log(`${index + 1}. ${claim}`);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question("\nEnter claim numbers (space separated): ", (answer) => {

            const selectedClaims = [];

            const choices = answer.trim().split(/\s+/);

            for (const choice of choices) {

                const index = parseInt(choice) - 1;

                if (isNaN(index) || index < 0 || index >= claims.length) {

                    console.log(`\nInvalid Choice: ${choice}`);

                    rl.close();

                    process.exit(1);

                }

                selectedClaims.push(claims[index]);

            }

            console.log("\n========== Selected Claims ==========\n");

            selectedClaims.forEach(claim => {

                console.log(`✓ ${claim}`);

            });

            rl.close();

            resolve(selectedClaims);

        });

    });

}

module.exports = claimMenu;