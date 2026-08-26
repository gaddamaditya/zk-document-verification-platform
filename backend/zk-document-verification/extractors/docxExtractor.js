const fs = require('fs');
const pdf = require('pdf-parse');

async function main() {

    let dataBuffer = fs.readFileSync('documents/aadhaar.pdf');

    let data = await pdf(dataBuffer);

    let text = data.text;

    let lines = text.split("\n");

    for(let line of lines){

        if(line.includes("GADDAM")){

            console.log("Name Found:");
            console.log(line);

        }

        if(line.includes("DOB:")){

            console.log("DOB:");
            console.log(line);

        }

        if(line.includes("MALE") || line.includes("FEMALE")){

            console.log("Gender:");
            console.log(line);

        }

    }

}

main();