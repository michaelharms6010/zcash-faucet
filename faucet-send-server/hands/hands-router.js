const router = require('express').Router();
const Hands = require('./hands-model');
const turnsRouter = require("./turns/turns-router")
const restricted = require("../auth/restricted-middleware");
const { exec } = require("child_process")

router.get("/", (req,res) => {
    Hands.getAll().then(hands => {
        res.status(200).json({hands})
    })
    .catch(err => {
        res.status(500).json({message: "error getting all hands"})
    })
})

router.use("/:id/turns", turnsRouter)

router.get("/validate/:id", async (req, res) => {
    const message = await Hands.validate(req.params.id)
    if (message.complete) {
        res.status(200).json({message})
    } else {
        res.status(401).json({message: "That hand isn't done yet."})
    }
})

router.post("/newhand", (req,res) => {
    
    Hands.createNew(req.body.table_id).then(hand => {
        delete hand.hashCount
        res.status(201).json(hand)
    }).catch(err => res.status(500).json({message: "error creating new hand"}))
})

router.get("/:id", (req,res) => {
    Hands.findById(req.params.id).then(hand => {
        hand.complete 
            ? res.status(200).json({hand}) 
            : res.status(200).json({hand: {proof: hand.proof}}) 
    })
    .catch(err => {
        res.status(500).json({message: "couldn't find hand with that id"})
    })
})

router.put("/:id", (req,res) => {
    Hands.setAsComplete(req.params.id).then(hand => {
         res.status(200).json({hand}) 
    })
    .catch(err => {
        res.status(500).json({message: "couldn't find hand with that id"})
    })
})

router.post("/:id/deal", (req,res) => {
    Hands.deal(req.params.id).then(hand => {
         res.status(200).json({hand}) 
    })
    .catch(err => {
        res.status(500).json({message: "error dealing hand"})
    })
})

router.post("/:id/flop", (req,res) => {
    Hands.flop(req.params.id).then(hand => {
         res.status(200).json({hand}) 
    })
    .catch(err => {
        res.status(500).json({message: "error dealing hand"})
    })
})
router.post("/:id/turn", (req,res) => {
    Hands.turn(req.params.id).then(hand => {
         res.status(200).json({hand}) 
    })
    .catch(err => {
        res.status(500).json({message: "error dealing hand"})
    })
})
router.post("/:id/river", (req,res) => {
    Hands.river(req.params.id).then(hand => {
         res.status(200).json({hand}) 
    })
    .catch(err => {
        res.status(500).json({message: "error dealing hand"})
    })
})

router.get("/:id/cards", restricted,(req, res) => {
    Hands.getCards(req.params.id, req.decodedJwt.id)
        .then(cards => res.status(200).json(cards))
        .catch(err => console.error(err))

})




module.exports = router;