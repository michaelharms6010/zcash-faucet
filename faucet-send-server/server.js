const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios")
const rpcCreds = process.env.ZCASH_RPC_CREDS;
const creds = 'Basic ' + Buffer.from(rpcCreds).toString('base64').trim()
const {canGetTx, saveTx, addTxId} = require("./transactions/transaction-model")
const sleep = require("./helpers/sleep")
const lightwallet = require("./helpers/lightwallet")

const server = express();

const Pusher = require("pusher");


// todos - shuffle and env pusher creds
// move model / endpoint functions to helper file

const pusher = new Pusher({
  appId: "1126204",
  key: "4e18f1b8741914d03145",
  secret: "3d2e94c5b0a7d3af6e76",
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
    let time = req.body.time;
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

     if (await canGetTx(ip, zaddr)) {
        saveTx(zaddr, ip).then(r => {
            lightWallet.sendFaucet(zaddr, time)
            res.status(200).json({message: "Sending TAZ..."})
        }).catch(err => console.log(err))
    } else {
        res.status(400).json({err: "You can only tap the faucet once every 15 minutes."})
    }  
})


server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})

module.exports = server;
