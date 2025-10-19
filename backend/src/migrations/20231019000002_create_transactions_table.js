exports.up = function(knex) {
  return knex.schema.createTable('transactions', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['income', 'expense']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.string('description');
    table.string('category').notNullable();
    table.date('date').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
};