exports.up = function(knex) {
    return knex.schema.createTable("transactions", tbl => {
        tbl.string("txid").notNullable().primary();
        tbl.decimal("amount", 14, 8).notNullable();
        tbl.string("memo", 550);
        tbl.integer("user_id").references("id").inTable("users")
        .onDelete("CASCADE").onUpdate("CASCADE");
        tbl.datetime('datetime').defaultTo(knex.fn.now(6))
        

    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("transactions");
};
