const db = require("../data/db-config")

module.exports = {
    canGetTx,
    saveTx,
    addTxId
}

async function canGetTx(ip) {
    const timeThreshold = Math.floor(Date.now() / 1000) - (60 * 60 * 1)
    const txs = await db("transactions").where("ip", "=", ip).orderBy("datetime", "desc")
    console.log("timeThreshold", timeThreshold)
    console.log("txs[0].datetime", +txs[0].datetime > timeThreshold)
    if (!txs[0]) return true
    return  !(+txs[0].datetime > timeThreshold)

}

function addTxId(opid, txid) {
    return db("transactions").where({opid}).update({txid})
}

async function saveTx(zaddr, ip, opid, amount) {
    const datetime = Math.floor(Date.now() / 1000) 
    const newTx = {zaddr, ip, opid, amount, datetime}
    try {
        tx = await db("transactions").insert(newTx)
    } catch(err) {
        console.log(err)
    }

    return tx
    
}