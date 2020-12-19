const router = require('express').Router();
const Tables = require('./tables-model');
const Seats = require('./seats/seats-model');
const PlayerCards = require("../hands/player-cards/player-cards-model");
const Hands = require("../hands/hands-model");
const Bets = require("../bets/bets-model");

const restricted = require("../auth/restricted-middleware");
const { exec } = require("child_process");
const { table } = require('console');


const Pusher = require('pusher');

const pusher = new Pusher({
  appId: '1068054',
  key: '1a9449ac1ed7cf81afbd',
  secret: 'c50b0be1590efe508389',
  cluster: 'us2',
  useTLS: true
});

router.get("/", (req,res) => {
    Tables.getAll().then(tables => {
        res.status(200).json({tables})
    })
    .catch(err => {
        res.status(500).json({message: "error getting all turns"})
    })
})

router.post("/newtable/:size", (req,res) => {
    const {big_blind} = req.body;
    console.log(big_blind)
    Tables.createNewTable(big_blind, req.params.size).then(table => {
        pusher.trigger(`tables`, 'new-table', null);
        res.status(200).json(table)
    })
    .catch(err => {
        res.status(500).json({message: "error creating table"})
    })
})





router.get("/:table_id/seats/", (req,res) => {

    Seats.getTableSeats(req.params.table_id).then(seats => {
        Tables.findById(req.params.table_id).then(table => {

            res.status(200).json({seats, table})
        })
    })
    .catch(err => {
        res.status(500).json({message: "error getting table seats"})
    })
})

router.post("/:table_id/seats/:position/sit", restricted, (req,res) => {
    const {table_id, position} = req.params;
    const user_id = req.decodedJwt.id;

    Seats.sit(table_id, position, user_id).then(seat => {   
        pusher.trigger(`table-${table_id}`, 'sit', {position: position});
        res.status(200).json({seat})
    })
    .catch(err => {
        console.log(err)
        res.status(500).json({message: "error sitting"})
    })
})

router.post("/:table_id/seats/:position/stand", restricted, (req,res) => {
    const {table_id, position} = req.params;
    const user_id = req.decodedJwt.id;

    Seats.stand(table_id, position, user_id).then(seat => {
        pusher.trigger(`table-${table_id}`, 'stand', {position: position});
        res.status(200).json({seat})
    })
    .catch(err => {
        res.status(500).json({message: "error sitting"})
    })
})

router.delete("/seats", (req, res) => {
    Seats.clearAll()
    .then(r => res.status(200).json({message: "all seats cleared"}))
    .catch(err => console.log(err))
})



router.get("/:table_id", restricted, (req,res) => {
    const user_id = req.decodedJwt.id;
    PlayerCards.getTableCards(table_id, user_id)


    Seats.getTableSeats({table_id})
    .then(seat => res.status(200).json(seat))
    .catch(err => console.log(err.response))
})


router.post("/:table_id/newhand", restricted, (req,res) => {
    const {table_id} = req.params
    Tables.startNewHand(table_id)
    .then(r =>{ 
        res.status(201).json(r)
    })
    .catch(err => console.error(err))
})

router.get("/:table_id/cards", restricted, (req,res) => {
    const user_id = req.decodedJwt.id;
    const {table_id} = req.params;
    Tables.getCards(table_id, user_id)
    .then(r => {
        res.status(200).json(r)
    })
    .catch(err => console.error(err))
})

router.get("/:table_id/handhistory", restricted, (req,res) => {
    const {table_id} = req.params;
    Tables.handHistory(table_id)
    .then(r => {
        
        res.status(200).json(r)
    }).catch(err => console.error(err))
})


router.post("/:table_id/deal", restricted, (req,res) => {
    const {table_id} = req.params;
    Tables.deal(table_id).then(r => {
        pusher.trigger(`table-${table_id}`, 'newcards', {action: "deal", table: table_id});
        pusher.trigger(`user-${"utg-user"}`, 'request_bet', {table_id});
        res.status(200).json(r)
    }).catch(err => console.error(err))
})
router.post("/:table_id/flop", restricted, (req,res) => {
    const {table_id} = req.params;
    Tables.flop(table_id)
        .then(r => {
            pusher.trigger(`table-${table_id}`, 'newcards', {board: r, table: table_id});
            pusher.trigger(`user-${"sb-user"}`, 'request_bet', {table_id});
            res.status(200).json(r)
        })
        .catch(err => console.error(err))
})
router.post("/:table_id/turn", restricted, (req,res) => {
    const {table_id} = req.params;
    
    Tables.turn(table_id)
    .then(r => {
        pusher.trigger(`table-${table_id}`, 'newcards', {board: r, table: table_id});
        pusher.trigger(`user-${"sb-user"}`, 'request_bet', {table_id});
        res.status(200).json(r)
    }).catch(err => console.error(err))
})
router.post("/:table_id/river", restricted, (req,res) => {
    const {table_id} = req.params;

    Tables.river(table_id)
    .then(r => {
        pusher.trigger(`table-${table_id}`, 'newcards', {board: r, table: table_id});
        pusher.trigger(`user-${"sb-user"}`, 'request_bet', {table_id});
        res.status(200).json(r)
    }).catch(err => console.error(err))
})
router.post("/:table_id/showdown", restricted, (req,res) => {
    const {table_id} = req.params;
    Tables.showdown(table_id)
    .then(r => {
        
        pusher.trigger(`table-${table_id}`, 'newcards', { action: "showdown", cards: r, table: table_id});
        res.status(200).json(r)
    }).catch(err => console.error(err))
})



router.post("/:table_id/newbet", restricted, (req,res) => {
    const {table_id} = req.params;
    const user_id = req.decodedJwt.id;
    const amount = +req.body.amount;
    
    Bets.add({ amount, table_id, user_id })
    .then(bet => {
        if (!bet) {
            res.status(400)({message: "Bet rejected"})
        }
        res.status(200).json({message: "Bet created", bet})
    })
    .catch(err => res.status(500).json({err}))
})

module.exports = router;