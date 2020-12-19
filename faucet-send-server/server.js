const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const axios = require("axios")
const rpcCreds = process.env.ZCASH_RPC_CREDS;
const creds = 'Basic ' + Buffer.from(rpcCreds).toString('base64').trim()


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
    
        console.log(r)
    
    return r
    } catch (err) {
        console.log(err.response.data.error)
    }
}

server.post("/sendtaz", (req,res) => {
    let zaddr = req.body.address;
    let amount = (Math.random() / 1000).toFixed(8) + 0.0001
    sendZcash(zaddr, amount)
        .then(r => res.status(200).json(r))
        .catch(err => res.status(500).json(err))
})



server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})

module.exports = server;