const db = require('../data/db-config')
const Seats = require("../tables/seats/seats-model")
const Users = require("../users/users-model");
const PlayerCards = require("../hands/player-cards/player-cards-model");
const Hands = require('../hands/hands-model');
const Pusher = require('pusher');


const pusher = new Pusher({
  appId: '1068054',
  key: '1a9449ac1ed7cf81afbd',
  secret: 'c50b0be1590efe508389',
  cluster: 'us2',
  useTLS: true
});

module.exports = {
    add,
    getAll,
    findById,
    findBy,
    remove,
    postBlinds,
    getActivePlayerIds,
    getNextUsersBet,
    getRound

}




async function getActivePlayerIds(hand_id) {
    try {
    const usersInHand = await PlayerCards.getPlayersInHand(hand_id);
    const bets = await db("bets").where({hand_id}).orderBy("id", "desc");
    const usersFolded = bets.filter(bet => bet.amount === -1).map(bet => bet.user_id);
    console.log("bets", bets)
    console.log("usersInHand", usersInHand)
    const activePlayers = usersInHand.filter(userId => !usersFolded.includes(userId));
    return activePlayers
    } catch (err) {
        console.log(err)
    }
}





async function getRound(hand_id) {
    try {
        
    const hand = await db("hands").where({id: hand_id}).first();
    const table = await db("tables").where({id: hand.table_id}).first();
    const {big_blind} = table;
    const bets = await db("bets").where({hand_id}).orderBy("id", "desc");
    let users = await PlayerCards.getPlayersInHand(hand_id);
    const userCount = users.length;
    const usersFolded = bets.filter(bet => bet.amount === -1).map(bet => bet.user_id);
    const numberFolded = usersFolded.length;
    const numberAllIn = bets.filter(bet => bet.all_in).length
    const activeUsers = users.filter(user => !usersFolded.includes(user.id))
     // we need to total the active user's bets here to figure out if we go to turn etc

    for (let i = 0; i < activeUsers.length ; i ++) {
        activeUsers[i].total_bet = bets.filter(bet => bet.user_id === activeUsers[i].id ).reduce((acc, item) => acc + item.amount, 0);
    }

    const numberPlaying = activeUsers.length;

    console.log(bets)

    let newestRound = Math.max(...bets.map(bet => bet.round))
    const maxBet = Math.max(...bets.map(bet => bet.round === newestRound && bet.amount))

    console.log('newestRound', newestRound)
    console.log('maxBet', maxBet)


    console.log("numberPlaying", numberPlaying)


    // if everyones bet AND its not the preflop big blind
    if (bets.filter(bet => (bet.amount === maxBet && bet.round === newestRound)  || bet.all_in).length === numberPlaying 
        && !(maxBet === big_blind && newestRound === 1)) {
        newestRound += 1
    }
    // if big blind checked
    if (bets.filter(bet => (bet.amount === maxBet && bet.amount === big_blind) || bet.all_in ).length === numberPlaying + 1 ) {
        newestRound += 1
    }
    return newestRound
    }
    catch (err) {
        console.log(err)
        return err
    }
}

async function getActiveBettor(table_id) {
    const hand = await db("hands").where({table_id, complete: false}).first();
    let seats = await db("seats").whereNotNull("user_id").where({table_id});
    if (!hand || !seats) return null;
    let bets = await db("bets").where({hand_id: hand.id}).orderBy("id", "desc");
    
    foldedPlayerIds = bets.filter(bet => bet.amount === -1).map(bet => bet.user_id);
    seats = seats.filter(seat => !foldedPlayerIds.includes(seat.user_id));
    seats = seats.sort((a,b) => a.position - b.position);
    if (bets.length === 2) {
        return seats[2 % seats.length].user_id
    }
    lastBet = bets[0];
    let activeIndex = seats.findIndex(seat => seat.user_id === lastBet.user_id)
    return seats[(activeIndex + 1) % seats.length].user_id
}

function flatten(arr) {
    return [].concat(...arr)
  }

async function postBlinds(table_id) {
    try {
        const table = await db("tables").where({id: table_id}).first();
        const hand = await db("hands").where({table_id, complete: false}).first();
        const bigBlind = table.big_blind;
        const smallBlind = bigBlind / 2;
        let seats = await db("seats").whereNotNull("user_id").where({table_id}).orderBy("id", "desc");
        if (!hand || !seats) return null;
        const startIndex = (hand.id % seats.length);
        const SB = await Users.findById(seats[startIndex].user_id)
        const BB = await Users.findById(seats[(startIndex+1) % seats.length].user_id)
        let bets = []
        await db("users").where({id: SB.id}).update({ balance: Number(SB.balance) - smallBlind })
        bets.push(await db("bets").insert({round: 1, user_id: SB.id, hand_id: hand.id, amount: smallBlind }).returning("*"))
        await db("users").where({id: BB.id}).update({ balance: Number(BB.balance) -  bigBlind })
        bets.push(await db("bets").insert({round: 1, user_id: BB.id, hand_id: hand.id, amount: bigBlind }).returning("*"))
        bets = flatten(bets)
        const utgId = seats[(startIndex+2) % seats.length].user_id
        return {bets, utgId};
    }
    catch (err) {
        console.log(err)
        return {bets: [], utgId: 0}
    }

}


async function add(bet) {

    try {
        let {user_id, table_id, amount} = bet;

        amount = Math.abs(+amount);

        const hand = await db("hands").where({table_id, complete: false}).first();
        bet.hand_id = hand.id;
        const user = await db("users").where({id: bet.user_id}).first();
        const seats = await Seats.getTableSeats(table_id);
        // make sure user is at the correct table
        const user_ids = seats.map(seat => seat.user_id);

        const bets = await db("bets").where({hand_id: bet.hand_id})

        if (bets.find(bet => bet.user_id === user_id && bet.all_in))  {
            return getNextUsersBet(user_id, bet.hand_id);
            
        }
        bet.round = await getRound(hand.id);

        const currentBet = await db("bets").where({hand_id: hand.id, round: bet.round}).orderBy("id", "desc").first()
        if (currentBet) {
            const minimumBet = currentBet.amount;
            if (bet.amount < minimumBet && bet.amount !== -1) {
                // some kinda all-in handling belongs here
                console.log("bet.amount", bet.amount)
                console.log("minimumBet", minimumBet)
                console.log("bet below minimum")
                return
            }
        }    
        const oldBet = await db("bets").where({hand_id: hand.id, round: bet.round, user_id}).orderBy("amount", "desc").orderBy("id", "desc").first()

        if (oldBet) {
            console.log("amount", amount)
            amount -= oldBet.amount
            console.log("oldBet", oldBet)
            console.log("new amount", amount)
        }
        
        // make sure the user is at the table
        
        if (!user_ids.includes(user_id)) {
            console.log("user ", user_id, " is not in ", seats)
            return
        }
        // make sure the user has enough balance, put them all in if not
        if (amount >= Number(user.balance)) {
            amount = Number(user.balance) - (oldBet ? oldBet.amount : 0);
            bet.all_in = true;
        }

        // make sure it's the user's turn

        const activePlayers = await getActivePlayerIds(hand.id)
        let allSeats = await db("seats").whereNotNull("user_id").where({table_id}).orderBy("id", "desc");
        if (currentBet) {
            const nextPlayerIndex = (activePlayers.indexOf(currentBet.user_id) + 1) % activePlayers.length
            const nextPlayerId = activePlayers[nextPlayerIndex];
            if (nextPlayerId != user.id) {
                console.log("it isn't your turn", user, "nextPlayerId", nextPlayerId)
            }
        } 
        const startIndex = hand.id % seats.length;
        let nextUserIndex = startIndex;
        console.log(allSeats)
        let count = 0
        
        while (bets.find(bet => bet.user_id === allSeats[nextUserIndex].user_id && bet.amount === -1) && count <= allSeats.length) {
            nextUserIndex = (nextUserIndex + 1) % allSeats.length
            count += 1
        }
        if (count > allSeats.length) {
            // everyone's folded but someones betting
            console.log("everyones folded but someones betting")
    
        }
        if (user.id !== allSeats[nextUserIndex].user_id) {
            console.log("not your turn to open betting")
        }
        // else if () {   }
        

        


        const newBalance = Number(user.balance) - amount;
        console.log("newBalance", newBalance)
        await db("users").where({id: user_id}).update({balance: newBalance})
        
        delete bet.table_id 
        console.log(bet);
        
        const [newBet] = await db('bets').insert(bet).returning("*")
        const round = await getRound(bet.hand_id)
        pusher.trigger(`table-${table_id}`, 'newbets', {bets: [...bets, newBet], round});
        await getNextUsersBet(user_id, bet.hand_id)
        return newBet
    }
    catch (err) {
        console.log(err)
        return err
    }
}

function findBy(filter) {
    return db('bets').where(filter).first()
}

function getAll() {
    return db('bets')
}

function findById(id) {
    return db('bets')
        .where({id})
        .first()
}
function remove(id) {
    return db('bets')
    .where({ id })
    .first()
    .del();
  }

  async function getNextUsersBet(lastUserId, hand_id) {
    const Table = require("../tables/tables-model")
    const {table_id} = await db("hands").where({id: hand_id}).first();
    const activePlayerIds = await getActivePlayerIds(hand_id)
    // gotta get this specific to hand and user
    let activePlayersBets = await db("bets").where({hand_id}).whereIn("user_id", activePlayerIds)

    const nextPlayerIndex = (activePlayerIds.indexOf(lastUserId) + 1) % activePlayerIds.length
    let nextPlayerId = activePlayerIds[nextPlayerIndex];
    const board = await db("boards").where({ hand_id}).first();

    console.log("activePlayerIds", activePlayerIds)
    console.log("activePlayersBets", activePlayersBets)

    let nextPlayerAllIn = await db("bets").where({id: nextPlayerId, all_in: true}).first()

    let count = 0

    while (nextPlayerAllIn && count < activePlayerIds.length) {
        nextPlayerId = (nextPlayerId + 1) % activePlayerIds.length
        nextPlayerAllIn = await db("bets").where({id: nextPlayerId, all_in: true}).first()
        count += 1
    }


    if (activePlayerIds.length === 1) {
        console.log("detected one active player")
        const winnings = await Hands.getPotValue(hand_id);
        const user = await db("users").where({id: activePlayerIds[0]}).first()
        const bets = await db("bets").where({hand_id});
        console.log("winnings", winnings)
        console.log("bets", bets)
        console.log("user", user)
        await db("users").where({id: user.id}).update({balance: Number(user.balance) + winnings });
        // push out table state
        // pusher.trigger(`user-${nextPlayerId}`, 'user_won', {table_id});
        pusher.trigger(`table-${table_id}`, 'newbets', { bets, message: "one-remaining", user_id: user.id, winnings: winnings });
        setTimeout( async _ => {
            await Table.startNewHand(table_id)
        }, 2000)
        
        // get the max bet
        // get the all in bet
        // if winnings = the all in bet + (max_bet * (activePlayerIds.length -1))
    } else if (activePlayersBets.filter(bet => bet.all_in).length >= activePlayerIds.length -1 || winnings >= bet.all_in * activePlayerIds.length ) {
        console.log("detected all but one player all in, running hand")
        const initialRound = await getRound(hand_id);
        let round = initialRound;
        
        if ( [1,2].includes(round) ) {

            // this could be passed all at once and handled on the front end

            setTimeout( async _ => {
                const board = await Hands.flop(hand_id);
                pusher.trigger(`table-${table_id}`, 'newcards', {board, table: table_id});
            }, (round - initialRound) * 2000 + 2000 )
            round = 3
            
        } if( round === 3 ) {
            
            setTimeout( async _ => {
                const board = await Hands.turn(hand_id);
                pusher.trigger(`table-${table_id}`, 'newcards', {board, table: table_id});
            }, (round - initialRound) * 2000 + 2000 )
            
            round += 1
            
        } if (round === 4 ) {

            setTimeout( async _ => {
                const board = await Hands.river(hand_id);
                pusher.trigger(`table-${table_id}`, 'newcards', {board, table: table_id});
            }, (round - initialRound) * 2000 + 2000 )
            round += 1

        } if (round === 5 ) {

            setTimeout( async _ => {
                const cards = await Hands.showdown(hand_id);
                pusher.trigger(`table-${table_id}`, 'newcards', { action: "showdown", cards, table: table_id});
            }, (round - initialRound) * 2000 + 2000 )
            round += 1

        } 

        setTimeout( async _  => {
            await Table.startNewHand(table_id)
        }, (round - initialRound) * 2000 + 2000 )

        
        
    }
    
    else {
        let round = await getRound(hand_id);
        console.log("round", round)
        
        if (round === 2 && !board.flop_3) {
            const board = await Hands.flop(hand_id);
            pusher.trigger(`table-${table_id}`, 'newcards', {board, table: table_id});
        } else if(round === 3 && !board.turn) {
            const board = await Hands.turn(hand_id);
            pusher.trigger(`table-${table_id}`, 'newcards', {board, table: table_id});
        } else if (round === 4 && !board.river) {
            const board = await Hands.river(hand_id);
            pusher.trigger(`table-${table_id}`, 'newcards', {board, table: table_id});
        } else if (round === 5 ) {
            const cards = await Hands.showdown(hand_id);
            pusher.trigger(`table-${table_id}`, 'newcards', { action: "showdown", cards, table: table_id});
        }


        pusher.trigger(`user-${nextPlayerId}`, 'request-bet', {table_id});
    }
}