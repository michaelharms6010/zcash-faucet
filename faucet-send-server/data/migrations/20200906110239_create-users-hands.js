exports.up = function(knex) {
    return knex.schema.createTable("users_hands", tbl => {
        tbl.increments();

        tbl.integer("user_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        tbl.integer("hand_id")
            .references("id")
            .inTable("hands")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        
        tbl.decimal("amount_wagered");
        tbl.decimal("amount_won");
        tbl.integer("hand_type");
        tbl.integer("hand_rank");
        tbl.string("hand_name");
        tbl.string("hand");


    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users_hands");
};
