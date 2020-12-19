const router = require('express').Router();
const Users = require('./users-model');
const restricted = require("../auth/restricted-middleware");
const { exec } = require("child_process")

router.get("/", (req,res) => {
    Users.getAll().then(users => {
        res.status(201).json(users)
    })
    .catch(err => {
        exec("touch error.txt", (err, stdout, stderr) => {
            res.status(500).json({message: "yo"})
        })
    })
})

router.get("/balance", restricted, (req,res) => {
    Users.getWalletBalance(req.decodedJwt.id).then(balance => {
        console.log("Balance endpoint", balance)
        res.status(201).json(balance)
    })
})

router.post("/withdraw", async (req,res) => {
    // TODO: this will need checking for admin token
    // checking valid withdrawls (> threshold) is key
    const newTxn = req.body;
    newTxn.datetime = Date.now();
    newTxn.amount = Math.abs(newTxn.amount) * -1;
    newTxn.user_id = req.decodedJwt.id;
    
    try {
        const user = await Users.findById(req.decodedJwt.id)
        if (user && Number(user.balance) + newTxn.amount < 0) {
            res.status(400).json({message: "insufficient funds"})
        } else {
            
            exec(`./zecwallet-cli send ${newTxn.to} ${Math.abs(newTxn.amount) - 10000}`, async (err, stdout, stderr) => {
                if (err) {
                    console.log(stderr)
                    res.status(500).json({message: "error creating transaction. Please contact an administrator"})
                }
                else if (stdout.includes("txid")) {
                    const idLine = stdout.split("\n").find(item => item.includes("txid"))
                    const txid = JSON.parse(idLine.split(":")[1])
                    newTxn.txid = txid;
                    
                    await Txns.add(newTxn)
                   
                    
                    res.status(200).json({message: "Withdrawl Sent", transaction: newTxn})

                    
                }
                else {
                    res.status(500).json({message: "error generating transaction"})
                }
            })
        }
    } catch {
        res.status(500).json({error: "error adding new transaction"})
    }
})



router.put('/', restricted, (req,res) => {
    
    if (req.body.password) {
        delete req.body.password
    }
    Users.updateUser(id, req.body)
    .then( _ => Users.findById(id)).then(user => {
        delete user.password;
        res.status(200).json(user);
    })
    .catch(err => {
        res.status(500).json({message: 'Unable to update', error: err})
    })}

)

router.delete('/', restricted, (req, res) => {

        Users.remove(req.decodedJwt.id)
        .then(user => {
            if (!user) {
                res.status(404).json({message: "No user exists by that ID!"})
            } else {
                res.status(200).json({message: "deleted"})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        })

})

router.delete('/:id', restricted, (req, res) => {
    if (req.decodedJwt.id === admin_id) {
        Users.remove(req.params.id)
        .then(user => {
            if (!user) {
                res.status(404).json({message: "No user exists by that ID!"})
            } else {
                res.status(200).json({message: "deleted"})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        })
    } else {
        res.status(500).json({bro: "cmon now"})
    }
})

router.put('/:id', restricted, (req,res) => {
       
    if (req.body.password) {
        delete req.body.password
    }
    Users.updateUser(id, req.body)
    .then( _ => Users.findById(id)).then(user => {
        delete user.password;
        res.status(200).json(user);
    })
    .catch(err => {
        res.status(500).json({message: 'Unable to update', error: err})
    })
    
})
  

module.exports = router;