import * as knexConstructor from "knex";
import * as config from './config';

const knex = knexConstructor({
    dialect: 'pg',
    connection: {
        host: 'localhost:5432',
        user: 'enzo',
        password: 'secret',
        database: 'db_default'
    }
})

const buildSchemas = (cb: any) => {
    knex.schema.createTableIfNotExists('ticker_values', table => {
        table.increments()
        table.string('coin_id', 6).notNullable()
        table.float('last_price')
        table.float('bid')
        table.float('ask')
        table.float('mid')
        table.float('low')
        table.float('high')
        table.float('volume')
        table.bigInteger('transactions_buy_qty')
        table.bigInteger('transactions_sell_qty')
        table.bigInteger('transactions_buy_coin_qty')
        table.bigInteger('transactions_sell_coin_qty')
        table.float('transactions_buy_mean_price')
        table.float('transactions_buy_stdev_price')
        table.float('transactions_sell_mean_price')
        table.float('transactions_sell_stdev_price')
        table.timestamp('timestamp').defaultTo(knex.fn.now())
        cb()
    }) 
}

export {
    knex,
    buildSchemas
}