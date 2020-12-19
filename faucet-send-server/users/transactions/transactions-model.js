const db = require("../data/db-config")
const Users = require("../users-model")

module.exports = {
    getAll,
    findBy,
    add,
    remove
}

function getAll() {
    return db("transactions")
}

function findBy(filter) {
    return db("transactions")
        .where(filter)
}

async function add(txn) {
    try {
        const tx = await db("transactions").insert(txn).returning("*").first()
        if (tx && tx.txid) {
            await Users.updateUser(txn.user_id, {balance: Number(user.balance) + Number(txn.amount)})
            return tx
        }
    } catch (err) {
        console.log(err)
        return 
    }
    
}
function remove(id) {
    return db('transactions')
    .where({ id })
    .first()
    .del();
}