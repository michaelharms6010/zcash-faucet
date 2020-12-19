
exports.up = function(knex) {
  return knex.schema.createTable("transactions", tbl => {
      tbl.string("txid")
      tbl.string("amount")
      tbl.integer("datetime")
      tbl.string("ip")
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("transactions")
};
