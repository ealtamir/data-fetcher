import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return Promise.all([
        knex.schema.createTable('ticker_values', table => {
            table.increments()
            table.string('coin_id', 10).notNullable()
            table.float('last_price').notNullable()
            table.float('bid').notNullable()
            table.float('ask').notNullable()
            table.float('mid').notNullable()
            table.float('low').notNullable()
            table.float('high').notNullable()
            table.float('volume').notNullable()
            table.float('transactions_buy_qty').notNullable()
            table.float('transactions_sell_qty').notNullable()
            table.float('transactions_buy_coin_qty').notNullable()
            table.float('transactions_sell_coin_qty').notNullable()
            table.float('transactions_buy_mean_price').notNullable()
            table.float('transactions_buy_stdev_price').notNullable()
            table.float('transactions_buy_median_price').notNullable()
            table.float('transactions_sell_mean_price').notNullable()
            table.float('transactions_sell_stdev_price').notNullable()
            table.float('transactions_sell_median_price').notNullable()
            table.timestamp('timestamp').defaultTo(knex.fn.now())

            table.index(['coin_id'], 'ticker_crypto_coin')
        }),
        knex.schema.createTable('book_entries', table => {
            table.increments()
            table.string('coin_id', 10).notNullable()
            table.json('asks')
            table.json('bids')
            table.timestamp('timestamp').defaultTo(knex.fn.now())

            table.index(['coin_id'], 'books_crypto_coin')
        })
    ])
};

exports.down = function (knex: Knex): Promise<any> {
    return Promise.all([
        knex.schema.dropTableIfExists('ticker_values'),
        knex.schema.dropTableIfExists('book_entries'),
    ])
};
