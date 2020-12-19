const db = require("../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    updateUser,
    add,
    getWalletBalance,
    findBy
}



function add(user) {
    
    return db("users").insert(user).returning("*")
}


function getAll() {
    return db('users')
}

function findById(id) {
    return db('users')
        .where({id})
        .first()
}

async function getWalletBalance(id) {
    const user = await db('users')
        .where({id})
        .first()
    console.log("user found in getWalletBalance", user)
    const {balance, deposit_id} = user;
    console.log("object returned form getWalletBalance:", {balance, deposit_id})
    return {balance, deposit_id};
}

function remove(id) {
    return db('users')
    .where({ id })
    .first()
    .del();
  }

  function findBy(filter) {
      return db("users").where(filter).first()
  }


  function updateUser(id, changes) {
    return db('users')
      .where({id})
      .update(changes, '*').returning("*");
  }

  async function deposit(id, amount) {
      const user = await db("users").where({id});
        // needs txid
      return db("users").where({id}).update({balance: user.balance + amount}).returning("*").first()
  }
  async function win(id, amount) {
      const user = await db("users").where({id});
        // needs hand_id
      return db("users").where({id}).update({balance: user.balance + amount}).returning("*").first()
  }

  async function withdraw(id, amount) {
    const user = await db("users").where({id});
    if (amount > user.balance) return user;
    // below needs txid
    return db("users").where({id}).update({balance: user.balance - amount}).returning("*" ).first()
}