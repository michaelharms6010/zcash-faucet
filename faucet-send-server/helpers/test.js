const blake3 = require("blake3");
const Deck = require("./Hand");
const numberOfDeckCombinations = 8.066e+67;

const hashesToGenerateRainbowTable = numberOfDeckCombinations * 50000;
const proof = "3285e437c9e48c55fe7bde957449c6fc6f1a8c9dd0747f19ca6875ef7cd99c79"

const beforeTime = Date.now();
let deck = JSON.stringify(new Deck().cards)
let hash = proof
for (let i = 0; i < 50000 ; i ++) {
    hash = blake3.hash(hash)
}

const afterTime = Date.now();
const timeElapsed = afterTime - beforeTime;
console.log("Time elapsed:", timeElapsed)
const hashesPerSecond = (1000 / timeElapsed) * 50000;
const hashesPerMonth = hashesPerSecond * 60 * 60 * 24 * 30;
const globalEthHashrate = 300000 * 1000000000;
const gpuFarmPerMonth = hashesPerMonth * (globalEthHashrate * 1000);


console.log("----------MONTHS TO GENERATE RAINBOW TABLE---------")
console.log("my pc:", hashesToGenerateRainbowTable / hashesPerMonth)
console.log("gpu estimate:", hashesToGenerateRainbowTable / gpuFarmPerMonth)



// let hash;
// let match = false;
// let guesses = 0;
// while (!match) {
//     let deck = JSON.stringify(new Deck().cards)
//     hash = deck
//     for (let i = 0; i < 500000 ; i ++) {
//         hash = blake3.hash(hash)
//         if (hash.toString("hex") === proof) {
//             console.log("match found:", hash, proof, deck)
//             return
//         }
//     }
//     guesses += 1
//     if (guesses % 100 === 0 ) console.log(guesses)
// }
