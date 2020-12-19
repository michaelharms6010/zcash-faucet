exports.up = function(knex) {
    return knex.schema.createTable("bets", tbl => {
        tbl.increments();
        tbl.integer("user_id").references("id").inTable("users").onDelete("CASCADE").onUpdate("CASCADE")
        tbl.integer("hand_id").references("id").inTable("hands").onDelete("CASCADE").onUpdate("CASCADE")
        tbl.integer("round").notNullable(); // preflop , flop , turn , river
        tbl.integer("amount").notNullable();
        tbl.datetime('datetime').defaultTo(knex.fn.now());
        tbl.boolean("all_in").defaultTo(false);
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("bets");
};
