const router = require('express').Router();
const Turns = require('./turns-model');

const restricted = require("../../auth/restricted-middleware");
const { exec } = require("child_process")

router.get("/", (req,res) => {
    Turns.getAll().then(turns => {
        res.status(200).json({turns})
    })
    .catch(err => {
        res.status(500).json({message: "error getting all turns"})
    })
})



module.exports = router;