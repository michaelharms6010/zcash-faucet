const hand = [ '2c', '6c' ]
const keys = ["flop_1","flop_2","flop_3","turn","river"]
const board = {
  id: 28,
  flop_1: '2s',
  flop_2: 'qs',
  flop_3: '3h',
  turn: '3c',
  river: 'Th',
  hand_id: 30
}

const sevenCards = [...hand, ...keys.map(key => board[key] )].map(str => str.replace("10","T"))


console.log(sevenCards)



console.log(PokerEvaluator.evalHand(sevenCards));