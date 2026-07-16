const circomlib = require("circomlibjs");

async function main(){

    const poseidon = await circomlib.buildPoseidon();

    let name = "GADDAM ADITHYA";

    let asciiArray = [];

    for(let ch of name){

        asciiArray.push(
            ch.charCodeAt(0)
        );

    }

   while(asciiArray.length < 16){

    asciiArray.push(0);
    }

    console.log("ASCII Array:");

    console.log(asciiArray);

    console.log(asciiArray.length);

    let hash = poseidon(asciiArray);

    console.log("Poseidon Hash:");

    console.log(
        poseidon.F.toString(hash)
    );

}

main();