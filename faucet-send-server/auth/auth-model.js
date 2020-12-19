const db = require('../data/db-config')

module.exports = {
    add,
    getAll,
    findById,
    findBy,
    remove,
    makeid
}

function makeid(length) {
    var result           = '';
    var characters       = 'abcdef0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

async function add(user) {
    return db('users').insert(user).returning("*")

}

function findBy(filter) {
    return db('users').where(filter).first()
}

function getAll() {
    return db('users').select('id', 'username')
}

function findById(id) {
    return db('users')
        .where({id})
        .first()
}
function remove(id) {
    return db('users')
    .where({ id })
    .first()
    .del();
  }