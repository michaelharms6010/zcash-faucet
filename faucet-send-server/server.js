const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios")
const rpcCreds = process.env.ZCASH_RPC_CREDS;
const creds = 'Basic ' + Buffer.from(rpcCreds).toString('base64').trim()
const {canGetTx, saveTx} = require("./transactions/transaction-model")

const TESTING_ZADDR = "ztestsapling18ul4pykvaglhjtfvgad7prgsks8fnx906xtjmq6vx3p8njqpurwhsndvf06yvw09ct7cwandp7w"



const server = express();

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
                "params": [process.env.MASTER_ZADDR, [{"address": zaddr ,"amount": amount, "memo": "00"}]] 
            }
        })
    
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
                "method": "z_sendmany", 
                "params": [process.env.MASTER_ZADDR, [{"address": zaddr ,"amount": amount, "memo": "00"}]] 
            }
        })
    
        return r
    } catch (err) {
        console.log(err.response.data.error)
    }
}


server.post("/sendtaz", async (req,res) => {
    let zaddr = req.body.address;
    var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

    let amount = (Math.random() / 1000 + 0.0001 ).toFixed(8) 
    if (await canGetTx(ip)) {
        sendZcash(zaddr, amount)
            .then(r => {
                const opid = r.data.result;
                saveTx(zaddr, ip, opid, amount).then(r => {
                    res.status(200).json({message: "success"})
                }).catch(err => res.status(500))
            })
            .catch(err => {
                console.log(err)
                res.status(500).json({message: "failed"})})
    } else {
        res.status(400).json({err: "You can only tap the faucet once an hour."})
    }
    
})


server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})

module.exports = server;