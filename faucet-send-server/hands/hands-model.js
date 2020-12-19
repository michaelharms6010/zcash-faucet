const db = require("../data/db-config.js");
const Hand = require("../helpers/Hand.js");
const PlayerCards = require("./player-cards/player-cards-model");
const Board = require("./board/board-model");

var PokerEvaluator = require("poker-evaluator");

const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1068054',
  key: '1a9449ac1ed7cf81afbd',
  secret: 'c50b0be1590efe508389',
  cluster: 'us2',
  useTLS: true
});


module.exports = {
    getAll,
    findById,
    remove,
    update,
    createNew,
    validate,
    setAsComplete,
    getCards,
    // todo - consolidate below functions into options in one deal function
    deal,
    flop,
    turn,
    river,
    showdown,
    getPotValue
}


function getAll() {
    return db('hands');
}

function findById(id) {
    return db('hands')
        .where({id})
        .first()
}

function remove(id) {
    return db('hands')
    .where({ id })
    .first()
    .del();
  }


  function update(id, changes) {
    return db('hands')
      .where({id})
      .update(changes, '*').returning("*");
  }

  function setAsComplete(id) {
    return db('hands')
      .where({id})
      .update({complete: true}, '*').returning("*");
  }

  async function createNew(table_id) {
      const lastHand = await db("hands").where({table_id}).first()
      if (lastHand) {
        await db("hands").where({table_id, complete: false}).update({complete: true})
      }
      const hand = new Hand();
      const newHand = {
          table_id: table_id,
          proof: hand.proof.toString("hex"),
          deck: JSON.stringify(hand.cards),
          hash_count: hand.hashCount

      }
      const [newEntry] = await db("hands").insert(newHand).returning("*")
      const board = await Board.add(newEntry.id)
      console.log(newEntry)
      
      return {hand: newEntry, board}
  }


    async function flop(hand_id) {
        const [board] = await db("boards").where({hand_id});
        console.log(board)
        if (!board.flop_1) {
            const [hand] = await db("hands").where({ complete: false, id: hand_id} )
            let {deck, deck_index } = hand
            deck = JSON.parse(deck);
            for (let i = 1; i < 4; i++) {
                let newCard = { [ `flop_${i}` ] : deck[deck_index], hand_id }
                await db("boards").where({hand_id}).update(newCard)
                deck_index += 1
            }
            await db("hands").where({ complete: false, id: hand_id}).update({deck_index});
            return db("boards").where({hand_id}).first();
        } else {
            return board
        }
    }

    async function turn(hand_id) {
        const [board] = await db("boards").where({hand_id});
        if (!board.turn) {
            const [hand] = await db("hands").where({ complete: false, id: hand_id} )
            let {deck, deck_index } = hand
            deck = JSON.parse(deck);
            let newCard = { "turn" : deck[deck_index], hand_id }
            await db("boards").where({hand_id}).update(newCard)
            deck_index += 1
            await db("hands").where({ complete: false, id: hand_id}).update({deck_index}).returning("*");
            return db("boards").where({hand_id}).first();
        } else {
            return board
        }

    }

    async function river(hand_id) {
        const [board] = await db("boards").where({hand_id});
        if (board.river) return board

        const [hand] = await db("hands").where({ complete: false, id: hand_id} )
        let { deck, deck_index } = hand
        deck = JSON.parse(deck);
        let newCard = { "river" : deck[deck_index], hand_id }
        await db("boards").where({hand_id}).update(newCard)
        deck_index += 1
        await db("hands").where({ complete: false, id: hand_id}).update({deck_index}).returning("*");
        return db("boards").where({hand_id}).first();
    }

    async function getCards(hand_id, user_id) {
        const [hand] = await db("hands").where({id: hand_id});
        console.log(hand)
        if (hand.complete) {
            return db("player_cards").where({hand_id})
        } else {
            return db("player_cards").where({hand_id, user_id})
        }

    }

    async function getPotValue(hand_id) {
        try {
            let potValue = 0;
            const bets = await db("bets").where({hand_id});
            const rounds = [...new Set(bets.map(bet => bet.round))]
            const user_ids = [...new Set(bets.map(bet => bet.user_id))]
            rounds.forEach(round => {
                user_ids.forEach(user_id => {
                    const userRoundBets = bets.filter(bet => bet.round === round && bet.user_id === user_id && bet.amount != -1)
                    
                    const activeBet = !userRoundBets.length ? 0 : (Math.max(...userRoundBets.map(item => item.amount)))
                    potValue += activeBet;
                })
            })
            return potValue;
        }
        catch (err) {
            console.log(err)
        }
    }

    const Tables = require("../tables/tables-model")

    async function showdown(hand_id) {
        try {
        const cards = await db("player_cards").where({hand_id})
        const board = await db("boards").where({hand_id}).first()
        const activeUsers = [...new Set(cards.map(card => card.user_id))]
        const userHands = activeUsers.map( user => cards.filter(card => card.user_id === user ) )

        userHands.forEach(async hand => {
            
            
            let handString = hand.map(card => card.value).concat(["flop_1","flop_2","flop_3","turn","river"].map(key => board[key]))
            
            let results = PokerEvaluator.evalHand(handString)
            await db("users_hands").insert({ hand_id, 
                user_id: hand[0].user_id, 
                hand_type: results.handType, 
                hand_rank: results.handRank, 
                hand_name: results.handName,
                hand: handString })
            
            // hand_results table - user_id, hand_id, rank

            
        })

        const usersHands = await db("users_hands").where({hand_id})
        const winner = usersHands.sort((a,b) => b.hand_rank - a.hand_rank).sort((a,b) => b.hand_type - a.hand_type)[0]
        const winningHands = usersHands.filter(hand => hand.hand_rank === winner.hand_rank && hand.hand_type === winner.hand_type)
        const potValue = await getPotValue(hand_id);
        const winnings = potValue / winningHands.length;


        winningHands.forEach(async hand => {
            try {
                const user = await db("users").where({id: hand.user_id}).first()
                await db("users").where({id: hand.user_id}).update({balance: Number(user.balance) + winnings });
                } catch (err) {
                    console.log(err)
                }
        })
        
//

        const [hand] = await db("hands").where({id: hand_id}).update({complete: true}).returning("*")

        // settle bets / user balances

        
        setTimeout( async _ => Tables.startNewHand(hand.table_id), 5000 )
        



        return db("player_cards as pc").where("pc.hand_id", hand_id).join("users_hands as uh", function() {
            this.on("uh.hand_id", "pc.hand_id").andOn("uh.user_id", "pc.user_id")
          })

    }

    catch (err) {
        console.log(err)
    }
    }


  function deal(hand_id) {
    return PlayerCards.deal(hand_id)
  }

  async function validate(id) {
    const hand = await db('hands').where({id}).first()
    const validation = new Hand().validate(hand.deck, hand.proof, hand.hash_count)
    const validationObject = {
        deck: JSON.parse(hand.deck),
        proof: hand.proof, 
        hash_count: hand.hash_count,
        valid: validation,
        complete: hand.complete
    }
    
    console.log("validationString", validationObject)
    console.log(validation)
    return validation ? validationObject : "The proof appears invalid."
}