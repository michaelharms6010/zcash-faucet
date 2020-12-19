const db = require("../data/db-config")

module.exports = {
    canGetTx,
    saveTx
}

async function canGetTx(ip) {
    const timeThreshold = (Date.now() / 1000) - (60 * 60 * 1)
    const recentTxs = db("transactions").where("ip", "=", ip).andWhere("datetime", ">", `${timeThreshold}`).orderBy("datetime", "desc")
    if (recentTx.length) {
        const timeFromRequest = (Time.now()/1000) - recentTxs[0].datetime
        return false
    } else {
        return true
    }
}

async function saveTx(ip) {
    const datetime = (Date.now() / 1000) 

    
    
}