const db = require("../../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    update,
    add,
    getByTableId
}

function add(hand_id) {
    console.log("hand id in add", hand_id)
    return db("boards").insert({hand_id}).returning("*")
}

function getAll() {
    return db('boards')
}

function findById(id) {
    return db('board')
        .where({id})
        .first()
}

function remove(id) {
    return db('board')
    .where({ id })
    .first()
    .del();
  }

async function getByTableId(table_id) {
    const hand = await db("hands").where({table_id}).orderBy("id", "desc").first()
    return db("boards").where({hand_id: hand.id});
}


  function update(id, changes) {
    return db('board')
      .where({id})
      .update(changes, '*').returning("*");
  }

  function setAsComplete(id) {
    return db('board')
      .where({id})
      .update({complete: true}, '*').returning("*");
  }

