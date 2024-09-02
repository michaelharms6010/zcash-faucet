const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const {canGetTx, saveTx, addTxId} = require("./transactions/transaction-model");
const sleep = require("./helpers/sleep");
const {sendZcash, getStatus} = require("./helpers/rpc");


const server = express();

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "us2",
  useTLS: true
});



server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(morgan("dev"));


server.post("/sendtaz", async (req,res) => {
    let zaddr = req.body.address;
    console.log(req)
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    let amount = (Math.random() / 4 + 0.0001 ).toFixed(8)
    if (await canGetTx(ip, zaddr)) {
        sendZcash(zaddr, amount)
            .then(r => {
                const opid = r.data.result; // an opid isn't a txid! We check the opid until the tx is complete, then pass back the txid
                saveTx(zaddr, ip, opid, amount).then(async r => {
                    let txComplete = false;
                    let result;
                    res.status(200).json({message: "Sending", opid })
                    while (!txComplete) {
                        let status = await getStatus(opid);
                        await sleep(2000)
                        if (status.data.result[0].status != "executing") {
                            txComplete = true;
                            result = status.data.result[0]
                        }
                    }
                    if (result.status == "success") {
                        await addTxId(opid, result.result.txid)
                        pusher.trigger("tx-notif", opid, {
                            txid: result.result.txid
                        });
                        res.status(200).json({message: "Success", txid: result.result.txid })
                    } else {
                        pusher.trigger("tx-notif", opid, {
                            error: "Zcashd failed the operation. Try again in a minute."
                        });
                        res.status(200).json({message: "success"})
                    }
                }).catch(err => res.status(500))
            })
            .catch(err => {
                console.log(err)
                `echo ${err} >> error.log`
                res.status(500).json({message: "failed"})})
    } else {
        res.status(400).json({err: "You can only tap the faucet once every 2 minutes."})
    }
})


server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})

module.exports = server;