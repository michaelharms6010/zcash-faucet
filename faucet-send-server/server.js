const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios")
const rpcCreds = process.env.ZCASH_RPC_CREDS;
const creds = 'Basic ' + Buffer.from(rpcCreds).toString('base64').trim()
const {canGetTx, saveTx, addTxId} = require("./transactions/transaction-model")
const sleep = require("./helpers/sleep")

const TESTING_ZADDR = "ztestsapling18ul4pykvaglhjtfvgad7prgsks8fnx906xtjmq6vx3p8njqpurwhsndvf06yvw09ct7cwandp7w"



const server = express();

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1126204",
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: "us2",
  useTLS: true
});



server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(morgan("dev"));

async function sendZcash(zaddr, amount) {
    let r;
    try {
        r = await axios({
            method: 'post',
            // url: "http://localhost:8232",
            url: "http://localhost:18232",
            headers: {
                "Authorization": creds, 
                'content-type': "application/json"
            }, 
            data: {
                "jsonrpc": "1.0",
                "id":"curltest", 
                "method": "z_sendmany", 
                "params": [process.env.MASTER_ZADDR, [{"address": zaddr ,"amount": amount }]] 
            }
        })
        console.log(r)
        return r
    } catch (err) {
        console.log(err.response.data.error)
    }
}

async function getStatus(opid) {
    let r;
    try {
        r = await axios({
            method: 'post',
            // url: "http://localhost:8232",
            url: "http://localhost:18232",
            headers: {
                "Authorization": creds, 
                'content-type': "application/json"
            }, 
            data: {
                "jsonrpc": "1.0",
                "id":"curltest", 
                "method": "z_getoperationstatus", 
                "params": [[opid]] 
            }
        })
        console.log(r.data.result.status)
        return r
    } catch (err) {
        console.log(err.response.data.error)
    }
}


server.post("/sendtaz", async (req,res) => {
    let zaddr = req.body.address;
    console.log(req)
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    let amount = (Math.random() / 1000 + 0.0001 ).toFixed(8) 
    if (await canGetTx(ip)) {
        sendZcash(zaddr, amount)
            .then(r => {
                const opid = r.data.result;
                saveTx(zaddr, ip, opid, amount).then(async r => {
                    let txComplete = false;
                    let result;
                    res.status(200).json({message: "Sending", opid })
                    while (!txComplete) {
                        let status = await getStatus(opid);
                        console.log(status.data.result)
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
        res.status(400).json({err: "You can only tap the faucet once an hour."})
    }
    
})


server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})

module.exports = server;