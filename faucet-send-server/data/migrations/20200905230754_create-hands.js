
exports.up = function(knex) {
    return knex.schema.createTable("hands", tbl => {
        tbl.increments();
        tbl.string("proof");
        tbl.integer("hash_count");
        tbl.string("deck", 350);
        tbl.boolean("complete").defaultTo(false);

        tbl.integer("table_id")
            .references("id")
            .inTable("tables")
            .onDelete("CASCADE")
            .onUpdate("CASCADE");

        tbl.integer("deck_index").defaultTo(0);
        // hand history? results?
        
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("hands");
};
