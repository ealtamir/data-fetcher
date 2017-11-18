import * as Knex from "knex";

exports.up = function (knex: Knex): Promise<any> {
    return Promise.all([
        knex.schema.createTable('ticker_values', table => {
            table.increments()
            table.string('coin_id', 10).notNullable()
            table.float('last_price')
            table.float('bid')
            table.float('ask')
            table.float('mid')
            table.float('low')
            table.float('high')
            table.float('volume')
            table.float('transactions_buy_qty')
            table.float('transactions_sell_qty')
            table.float('transactions_buy_coin_qty')
            table.float('transactions_sell_coin_qty')
            table.float('transactions_buy_mean_price')
            table.float('transactions_buy_stdev_price')
            table.float('transactions_buy_median_price')
            table.float('transactions_sell_mean_price')
            table.float('transactions_sell_stdev_price')
            table.float('transactions_sell_median_price')
            table.timestamp('timestamp').defaultTo(knex.fn.now())

            table.index(['coin_id'], 'crypto_coin')
        }),
        knex.schema.createTable('book_entries', table => {
            table.increments()
            table.string('coin_id', 10).notNullable()
            table.json('asks')
            table.json('bids')
            table.timestamp('timestamp').defaultTo(knex.fn.now())

            table.index(['coin_id'], 'crypto_coin')
        })
    ])
};

exports.down = function (knex: Knex): Promise<any> {
    return Promise.all([
        knex.schema.dropTableIfExists('ticker_values'),
        knex.schema.dropTableIfExists('book_entries'),
    ])
};
