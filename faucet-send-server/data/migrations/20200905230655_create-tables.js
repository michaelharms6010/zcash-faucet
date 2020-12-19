exports.up = function(knex) {
    return knex.schema.createTable("tables", tbl => {
        tbl.increments();
        tbl.integer("size");
        tbl.integer("big_blind");
        // has_many seats

    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("tables");
};
