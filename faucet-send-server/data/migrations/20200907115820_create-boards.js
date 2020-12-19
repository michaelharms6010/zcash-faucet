
exports.up = function(knex) {
    return knex.schema.createTable("boards", tbl => {
        tbl.increments()
        tbl.string("flop_1");
        tbl.string("flop_2");
        tbl.string("flop_3");
        tbl.string("turn");
        tbl.string("river");
        tbl.integer("hand_id")
        .references("id")
        .inTable("hands")
        .onDelete("CASCADE")
        .onUpdate("CASCADE");
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("boards");
};
