
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {id: 1, email: "a@a.com", password: "hello", deposit_id: "admin_deposit_id", balance: 0},
      ]);
    });
};
