const db = require("../data/db-config.js");
const Seats = require("./seats/seats-model");
const Hands = require("../hands/hands-model.js");
const Boards = require("../hands/board/board-model")
const Bets = require("../bets/bets-model");

const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1068054',
  key: '1a9449ac1ed7cf81afbd',
  secret: 'c50b0be1590efe508389',
  cluster: 'us2',
  useTLS: true
});

const INITIAL_BOARD = {flop_1: null, flop_2: null, flop_3: null, turn: null, river: null};

module.exports = {
    getAll,
    findById,
    remove,
    update,
    createNewTable,
    getSeats,
    getSeatCount,
    getCards,
    deal,
    flop,
    turn,
    river,
    showdown,
    handHistory,
    startNewHand
}

function getSeats(table_id) {
    return db("seats").where({table_id}).join("users", "seats.user_id", "users.id")
}

function getSeatCount(table_id) {
    return db("seats").where({table_id}).whereNotNull("user_id").count('id as CNT')
}

async function getAll() {
    tables = await db('tables');
    console.log(tables)
    for (let i = 0; i < tables.length; i ++) {
        [population] = await getSeatCount(tables[i].id)
        tables[i].population = population.CNT
    }
    return tables
}

function findById(id) {
    return db('tables')
        .where({id})
        .first()
}

function remove(id) {
    return db('tables')
    .where({ id })
    .first()
    .del();
}


function update(id, changes) {
return db('tables')
    .where({id})
    .update(changes, '*').returning("*");
}

async function createNewTable(big_blind, size) {
    const [newEntry] = await db("tables").insert({big_blind, size}).returning("*");
    for ( let i = 0; i < size; i++ ) {
        await db("seats").insert({table_id: newEntry.id, position: i})
    }
    return newEntry
}

async function getCards(table_id, user_id) {
    const hand = await db("hands").where({table_id: table_id, complete: false}).first();
    if (!hand) {
        return db("hands").where({table_id: table_id, complete: false}).orderBy("id", "desc").first();
    } else {
        const board = await db("boards").where({hand_id: hand.id}).first();
        const seats = await Seats.getTableSeats(table_id);
        const cards = await Hands.getCards(hand.id, user_id)
        return {hand_id: hand.id, cards, board, seats}
    }

}
async function deal(table_id) {
    const [hand] = await db("hands").where({table_id: table_id, complete: false});
    if (!hand) {
        Boards.getByTableId(table_id)
    } else {
        return Hands.deal(hand.id)
    }

}
async function flop(table_id) {
    const [hand] = await db("hands").where({table_id: table_id, complete: false});
    if (!hand) {
        Boards.getByTableId(table_id)
    } else {
        return Hands.flop(hand.id)
    }

}
async function turn(table_id) {
    const [hand] = await db("hands").where({table_id: table_id, complete: false});
    if (!hand) {
        Boards.getByTableId(table_id)
    } else {
        return Hands.turn(hand.id)
    }

}
async function river(table_id) {
    const [hand] = await db("hands").where({table_id: table_id, complete: false});
    if (!hand) {
        Boards.getByTableId(table_id)
    } else {
        return Hands.river(hand.id)
    }

}
async function showdown(table_id) {
    const [hand] = await db("hands").where({table_id: table_id, complete: false});
    if (!hand) {
        const hand = await db("hands").where({table_id: table_id}).orderBy("id", "desc").first()
        return db("player_cards")
    } else {
        return Hands.showdown(hand.id)
    }

}

async function newHand(table_id) {
    // TODO
    return Hands.createNew(table_id);
}

async function handHistory(table_id) {
     const hands = await db("hands").where({table_id}).orderBy("id", "desc").limit(10);
     if (hands.length) {
         hands[0].deck = null;
     }



     return hands
}

// Game handlers

async function startNewHand(table_id) {
    try {
    
    const newHandInfo = await Hands.createNew(table_id);
    const {hand} = newHandInfo
    await Hands.deal(hand.id)
    const {utgId, bets} = await Bets.postBlinds(table_id)
    const round = await Bets.getRound(hand.id)
    // request bet from utg player
    pusher.trigger(`table-${table_id}`, 'newcards', {action: "deal", cards: [], board: INITIAL_BOARD, table: table_id});
    pusher.trigger(`table-${table_id}`, 'newhand', {table: table_id});
    pusher.trigger(`table-${table_id}`, 'newbets', {bets, round});
    pusher.trigger(`user-${utgId}`, 'request-bet', {table_id});

    return {message: "hand created", hand_id: hand.id}
    }
    catch (err) {
        console.log(err)
    }
}