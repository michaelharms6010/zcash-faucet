const blake3 = require("blake3");

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }



class Deck {
    constructor() {
        // generate random deck string... "shuffle"
        this.cards = shuffle(this.create());
        this.hashCount = this.getHashCount();
        this.proof = this.proofHash()
        this.validationString = `Deck:\n${JSON.stringify(this.cards)}\nProof:\n${this.proof.toString("hex")}\nHash Count: ${this.hashCount}`
    }
    proofHash() {
        let count = this.hashCount;
        let hash = JSON.stringify(this.cards);
        
        for (let i = 0; i < count; i++) {


            hash = blake3.hash(hash);

        }

        return hash
    }

    getHashCount() {
        return Math.floor(Math.random() * 90000) + 10000
    }




    create() {
        const newDeck = [];
        ["h", "c", "d", "s"].map(suit => {
            for (let i = 2; i < 10; i++) {
                newDeck.push(`${i}${suit}`)
            }
            ["a","k","q","j","t"].map(highCard => newDeck.push(`${highCard}${suit}`))

        })
        return newDeck
    }

    validate(deckString, proof, hashCount) {
        let hash = deckString;
        for (let i = 0; i < hashCount; i++) {
            hash = blake3.hash(hash);
        }
        console.log("hash", hash)
        console.log("proof", proof)
        console.log(deckString)
        return hash.toString("hex") === proof

    }

     

}

let x = new Deck();

// these should be tests

// console.log(JSON.stringify(x.cards).length)
// console.log(x.validationString)
// console.log(JSON.stringify(x.cards))
// console.log(x.validate(JSON.stringify(x.cards), x.proof.toString("hex"), x.hashCount))

module.exports = Deck;