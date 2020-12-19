
exports.up = function(knex) {
    return knex.schema.createTable("player_cards", tbl => {
        tbl.increments();
        tbl.string("value", 3).notNullable();
        tbl.integer("hand_id").notNullable();
        tbl.integer("user_id").notNullable();
    })
  
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("player_cards")
};
