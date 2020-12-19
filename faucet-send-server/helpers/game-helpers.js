const db = require("../data/db-config");
const Tables = require("../tables/tables-model");


module.exports = {
    checkTables,

}

const checkTables = _ => {
    const tables = await db("tables")
    const filledSeats = await db("seats").whereNotNull("user_id")

    let tableArrays = tables.map(table => {return {table_id: table.id, seats: filledSeats.filter(seat => seat.table_id = table.id)} })

    tableArrays = tableArrays.filter( table => table.seats.length < 2 )

    for (let i = 0 ; i < tableArrays.length; i++) {
        const table_id = tableArrays[i].table_id;

        const hand = await db("hands").where({table_id, complete: true}).first()

        if (!hand) {
            // start a new hand, post blinds, request bet from utg
            Tables.startNewHand(table_id);
        }

    }
}