const axios = require("axios")
const rpcCreds = process.env.ZCASH_RPC_CREDS;
const creds = 'Basic ' + Buffer.from(rpcCreds).toString('base64').trim();

module.exports = {
    sendZcash,
    getStatus,
    doRPC
}

async function doRPC(method, params) {
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
                "method": method,
                "params": params
            }
        })
        console.log(r)
        return r
    } catch (err) {
        console.log(err.response.data.error)
    }
}

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
                "params": [process.env.MASTER_ZADDR, [{"address": zaddr ,"amount": amount }], 10, 0.00001, "AllowRevealedRecipients" ]
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