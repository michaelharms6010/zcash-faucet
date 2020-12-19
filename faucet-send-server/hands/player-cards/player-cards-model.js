const db = require("../../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    update,
    deal,
    getPlayersInHand,
    
}

const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1068054',
  key: '1a9449ac1ed7cf81afbd',
  secret: 'c50b0be1590efe508389',
  cluster: 'us2',
  useTLS: true
});


function getAll() {
    return db('player_cards')
}

async function deal(hand_id) {
    const playerCards = await db("player_cards").where({hand_id})
    if (playerCards.length) return playerCards;
    const [hand] = await db("hands").where({id: hand_id});
    let {deck, deck_index} = hand;
    deck = JSON.parse(deck)
    let seats = await db("seats").where({table_id: hand.table_id});
    seats = seats.filter(seat => seat.user_id)

    for (let i = 0; i < seats.length * 2; i++) {
            let newCard = {
                user_id: seats[i % seats.length].user_id,
                value: deck[deck_index],
                hand_id: hand.id
            }
            console.log(newCard)
            let nextDeal = await db("player_cards").insert(newCard);
            deck_index += 1
    } 
    return db("hands").where({id: hand_id}).update({deck_index}).returning("*");

}
async function getPlayersInHand(hand_id) {
  let cards = await db("player_cards").where({hand_id});
  cards = cards.map(card => card.user_id);
  return [ ...new Set(cards) ];
}

function findById(id) {
    return db('player_cards')
        .where({id})
        .first()
}

function remove(id) {
    return db('player_cards')
    .where({ id })
    .first()
    .del();
  }


  function update(id, changes) {
    return db('player_cards')
      .where({id})
      .update(changes, '*').returning("*");
  }

  function setAsComplete(id) {
    return db('player_cards')
      .where({id})
      .update({complete: true}, '*').returning("*");
  }

