const db = require("../../data/db-config.js");

module.exports = {
    getAll,
    findById,
    remove,
    update,
}

function getAll() {
    return db('turns');
}

function findById(id) {
    return db('turns')
        .where({id})
        .first()
}

function remove(id) {
    return db('turns')
    .where({ id })
    .first()
    .del();
  }


  function update(id, changes) {
    return db('turns')
      .where({id})
      .update(changes, '*').returning("*");
  }
