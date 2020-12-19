function isFlush(hand) {


    return new Set(hand.map(pair => pair[1])).size === 1
}

function getHighCard(hand) {
    const highcardValue = {"2": 2, "3":3, "4":4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "j": 11, "q": 12, "k": 13, "a": 14}
    const values = hand.map(pair => pair[0]).sort((a,b) => highcardValue[a] - highcardValue[b] )
    return values
}


function isRoyal(hand) {
    console.log(hand.map(pair => pair[0]).sort().join(""))
    return hand.map(pair => pair[0]).sort().join("") === "10ajkq"
}
function isStraight(hand) {
    console.log(hand)
    console.log(getSortedValues(hand))
    const allStraights = ["2345a", "23456", "34567", "45678", "56789","678910","78910j","8910jq", "109jkq", "910jkq", "10ajkq",]
    return allStraights.includes(getSortedValues(hand))
}

function isFourOfAKind(hash) {
    return Object.values(hash).includes(4)
}

function isFullHouse(hash) {
    console.log(hash)
    return Object.values(hash).includes(3) && Object.values(hash).includes(2)
}

function isThreeOfAKind(hash) {
    return Object.values(hash).includes(3)
}

function isTwoPair(hash) {
    return Object.values(hash).join("").includes("22")
}

function isPair(hash) {
    return Object.values(hash).includes(2)
}

function getSortedValues(hand) {
    return hand.map(pair => pair[0]).sort().join("")
}

function populateHash(hand) {
    const hash = {}
    hand.map(pair => pair[0]).forEach(value => {
        if (hash[value]) {
            hash[value] += 1
        } else {
            hash[value] = 1
        }
    })
    return hash
}

function rankHand(hand) {
    hand = hand.map(pair => [pair.toLowerCase().slice(0,-1) , pair.slice(-1)])
    hash = populateHash(hand)




    console.log(isStraight(hand))
    if (isFlush(hand)) {
        if (isRoyal(hand)) return "Royal Flush"
        if (isStraight(hand)) return "Straight Flush"
        return "Flush"
    } 
    if (isFourOfAKind(hash)) return "Four of a Kind"
    if (isFullHouse(hash)) return "Full House"
    if (isStraight(hand)) return "Straight"
    if (isThreeOfAKind(hash)) return "Three of a Kind"
    if (isTwoPair(hash)) return "Two Pair"
    if (isPair(hash)) return "Pair"
    return (getHighCard(hand))

}

console.log(rankHand(["5s", "4s", "3s", "2d", "Ah"]))
