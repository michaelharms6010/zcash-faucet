
exports.up = function(knex) {
  return knex.schema.createTable("transactions", tbl => {
      tbl.string("opid").unique()
      tbl.string("txid").unique()
      tbl.string("amount")
      tbl.integer("datetime")
      tbl.string("ip")
      tbl.string("zaddr")
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("transactions")
};
