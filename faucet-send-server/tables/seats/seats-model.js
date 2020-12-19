const db = require("../../data/db-config.js");

module.exports = {
    getAll,
    findById,
    remove,
    update,
    sit,
    stand,
    getTableSeats,
    clearAll,
}
function getAll() {
    return db('seats');
}

function getTableSeats(table_id) {
    return db('seats').where({table_id}).join("users", "seats.user_id", "users.id")
}

function clearAll() {
    return db("seats").update({user_id: null})
}


function findById(id) {
    return db('seats')
        .where({id})
        .first()
}

function remove(id) {
    return db('seats')
    .where({ id })
    .first()
    .del();
}


function update(id, changes) {
return db('seats')
    .where({id})
    .update(changes, '*').returning("*");
}

async function sit(tableId, position, userId) {


    const tableSeats = await db('seats')
                                .where({table_id: tableId});
    if (tableSeats.map(seat => seat.user_id).includes(userId)) {
        return {error: "You cannot sit again at the same table."}
    }

    const selectedSeat = tableSeats.find(seat => seat.position === +position)
    

    console.log(selectedSeat)
    if (selectedSeat.user_id === null) {
        return db('seats').where({table_id: tableId, position}).update({user_id: userId})
    } else {
        return {error: "That seat is taken."}
    }
}

async function stand(tableId, position, userId) {
    const selectedSeat = await db('seats')
                                .where({table_id: tableId, position})
                                .first();
    if (selectedSeat.user_id === userId) {
        return db('seats')
            .where({table_id: tableId, position})
            .update({user_id: null})
    } else {
        return {error: "You aren't in that seat."}
    }
}