exports.up = function(knex) {
    return knex.schema.createTable("turns", tbl => {
        tbl.increments();
        

        tbl.integer("user_id")
            .references("id")
            .inTable("hands")
            .onDelete("CASCADE")
            .onUpdate("CASCADE")
            .notNullable();

        tbl.integer("position")
            .notNullable();

        tbl.decimal("bet_amount")
            .notNullable(); // -1 = fold
            
        tbl.decimal("total_pot")
            .notNullable();

        tbl.integer("hand_id")
            .references("id")
            .inTable("hands")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("turns");
};
