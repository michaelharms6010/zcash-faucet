
exports.up = function(knex) {
    return knex.schema.createTable("users", tbl => {
        tbl.increments();
        tbl.string("email").unique().notNullable();
        tbl.string("password").notNullable();
        tbl.string("deposit_id").notNullable(); // use deposit id in memo field on your deposit
        tbl.bigInteger("balance").defaultTo(0);
        
    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users");
};
