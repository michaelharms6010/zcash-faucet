const db = require("../data/db-config")

module.exports = {
    canGetTx,
    saveTx,
    addTxId
}

async function canGetTx(ip, zaddr) {
    const timeThreshold = Math.floor(Date.now() / 1000) - (60 * 2)
    let txs = await db("transactions").where("ip", "=", ip).orWhere("zaddr", "=", zaddr).orderBy("datetime", "desc")
    txs = txs.filter(tx => tx.txid && tx.datetime < Math.floor(Date.now() / 1000) - 60 )
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
        `echo ${err} >> error.log`
        console.log(err)
    }

    return tx
    
}