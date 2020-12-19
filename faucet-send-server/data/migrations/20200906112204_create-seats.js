exports.up = function(knex) {

    return knex.schema.createTable("seats", tbl => {
        tbl.increments();
        tbl.integer("table_id").notNullable()
            .references("id")
            .inTable("tables")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");
        tbl.integer("position").notNullable(); // 1 - 6

        tbl.integer("user_id")
            .references("id")
            .inTable("users")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        // a balance here? or a bridge table for seat balances?
    })

};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("seats");
};
