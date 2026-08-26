const path = require("path");

const extractPDF = require("./extractors/pdfExtractor");
const extractImage = require("./extractors/imageExtractor");

const detectDocumentType = require("./processors/documentType");
const extractAttributes = require("./processors/attributeExtractor");

const generateClaims = require("./processors/claims/claimGenerator");
const claimMenu = require("./processors/claims/claimMenu");

const generateInput = require("./processors/inputGenerators/universalInputGenerator");

const circuits = require("./config/circuits");

const buildCircuit = require("./processors/compiler/buildCircuit");
const generateWitness = require("./processors/prover/witnessGenerator");
const generateProof = require("./processors/prover/proofGenerator");
const verifyProof = require("./processors/prover/verifyProof");

async function main() {

    try {

        const filePath = process.argv[2];

        if (!filePath) {
            console.log("\nUsage:");
            console.log("node main.js <document>\n");
            process.exit(1);
        }

        console.log("\n========================================");
        console.log(" PRIVACY PRESERVING DOCUMENT VERIFICATION ");
        console.log("========================================\n");

        const extension = path.extname(filePath).toLowerCase();

        let extractedText = "";

        switch (extension) {

            case ".pdf":
                console.log("Extracting text from PDF...\n");
                extractedText = await extractPDF(filePath);
                break;

            case ".jpg":
            case ".jpeg":
            case ".png":
                console.log("Extracting text from Image...\n");
                extractedText = await extractImage(filePath);
                break;

            default:
                throw new Error("Unsupported document format.");
        }

        console.log("✓ Text Extraction Completed");

        const documentType = detectDocumentType(extractedText);

        console.log(`✓ Document Type: ${documentType}`);

        const attributes = extractAttributes(documentType, extractedText);

        console.log("✓ Attribute Extraction Completed");

        const claims = generateClaims(attributes);

        const selectedClaims = await claimMenu(claims);

        if (!selectedClaims || selectedClaims.length === 0) {
            throw new Error("No claim selected.");
        }

        let selectedClaim;
        let circuitName;

        // -------------------------------
        // SINGLE CLAIM
        // -------------------------------
        if (selectedClaims.length === 1) {

        selectedClaim = selectedClaims[0];

        console.log(`\nSelected Claim : ${selectedClaim}`);

        await generateInput(selectedClaim, attributes);

        console.log("✓ Input Generated");

        circuitName = circuits[selectedClaim].circuit;

    }

    else if (

        selectedClaims.length === 3 &&
        selectedClaims.includes("NAME") &&
        selectedClaims.includes("AGE_18_PLUS") &&
        selectedClaims.includes("GENDER")

    ) {

        console.log("\nRunning Multi Attribute Verification...\n");

        selectedClaim = "MULTI_ATTRIBUTE";

        await generateInput(selectedClaim, attributes);

        console.log("✓ Multi Attribute Input Generated");

        circuitName = circuits.MULTI_ATTRIBUTE.circuit;

    }

    else {

        console.log("\nSelected combination is not supported yet.");

        process.exit(1);

    }

        console.log(`Circuit Selected : ${circuitName}`);

        buildCircuit(circuitName);

        generateWitness(selectedClaim);

        generateProof(selectedClaim);

        verifyProof(selectedClaim);

        console.log("\n========================================");
        console.log(" DOCUMENT VERIFIED SUCCESSFULLY");
        console.log("========================================\n");

    }

    catch (error) {

        console.error("\n========================================");
        console.error(" PIPELINE FAILED");
        console.error("========================================");
        console.error(error.message);

        process.exit(1);

    }

}

main();