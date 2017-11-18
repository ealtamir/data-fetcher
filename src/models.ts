import * as _ from 'lodash'
import * as stats from 'simple-statistics'
import * as Bluebird from 'bluebird'
import { knex } from './database'
import { 
    TickerPayload, TradesPayload, BitfinexTradeEntry, 
    BookPayload, BitfinexBookEntry
} from './bitfinex_interfaces'
import { Transaction } from 'knex'
import { QueryResult } from 'pg'
import { logger } from './logger'


abstract class Model {

    protected abstract getTableName(): string

    public saveModel(callback: (error: Error, result: QueryResult) => any): void {
        let sql = knex(this.getTableName())
            .insert(this)
            .asCallback((errors: any, result: any) => {
                if (errors) {
                    logger.error(`Failed to save data to DB: ${JSON.stringify(errors)}.`)
                    return callback(null, null)
                }
                return callback(null, result)
            })
    }
}

class Ticker extends Model {
    coin_id: string
    last_price: number
    bid: number
    ask: number
    mid: number
    low: number
    high: number
    volume: number
    transactions_buy_qty: number
    transactions_buy_coin_qty: number
    transactions_buy_mean_price: number
    transactions_buy_median_price: number
    transactions_buy_stdev_price: number
    transactions_sell_qty: number
    transactions_sell_coin_qty: number
    transactions_sell_mean_price: number
    transactions_sell_median_price: number
    transactions_sell_stdev_price: number
    timestamp: number

    constructor(tickerPayload: TickerPayload, tradesPayload: TradesPayload) {
        super()
        if (tickerPayload.symbol !== tradesPayload.symbol) {
            Error('TickerPayload and TradesPayload belong to different currencies.')
        }
        this.coin_id = tickerPayload.symbol
        this.extractTickerPayloadData(tickerPayload)
        this.extractTradesPayloadData(tradesPayload)
    }

    protected getTableName(): string {
        return 'ticker_values'
    }

    private extractTradesPayloadData(payload: TradesPayload): void {
        let buy_qty: number = 0
        let buy_coin_qty: number = 0
        let buy_prices: Array<number> = []
        let buy_amounts: Array<number> = []
        let sell_qty: number = 0
        let sell_coin_qty: number = 0
        let sell_prices: Array<number> = []
        let sell_amounts: Array<number> = []
        _.each(payload.trades, (trade: BitfinexTradeEntry) => {
            if (trade.type === 'buy') {
                buy_qty += 1
                buy_coin_qty += +trade.amount
                buy_prices.push(+trade.price)
                buy_amounts.push(+trade.amount)
            } else {
                sell_qty += 1
                sell_coin_qty += +trade.amount
                sell_prices.push(+trade.price)
                sell_amounts.push(+trade.amount)
            }
        })
        buy_prices = _.sortBy(buy_prices)
        buy_amounts = _.sortBy(buy_amounts)
        sell_prices = _.sortBy(sell_prices)
        sell_amounts = _.sortBy(sell_amounts)
        if (buy_prices.length === 0) {
            buy_prices.push(0)
        }
        if (buy_amounts.length === 0) {
            buy_amounts.push(0)
        }
        if (sell_prices.length === 0) {
            sell_prices.push(0)
        }
        if (sell_amounts.length === 0) {
            sell_amounts.push(0)
        }
        this.transactions_buy_qty = buy_qty
        this.transactions_buy_coin_qty = buy_coin_qty
        this.transactions_buy_mean_price = stats.mean(buy_prices)
        this.transactions_buy_stdev_price = stats.standardDeviation(buy_prices)
        this.transactions_buy_median_price = stats.medianSorted(buy_prices)

        this.transactions_sell_qty = sell_qty
        this.transactions_sell_coin_qty = sell_coin_qty
        this.transactions_sell_mean_price = stats.mean(sell_prices)
        this.transactions_sell_stdev_price = stats.standardDeviation(sell_prices)
        this.transactions_sell_median_price = stats.medianSorted(sell_prices)
    }

    private extractTickerPayloadData(payload: TickerPayload): void {
        this.last_price = +payload.last_price
        this.bid = +payload.bid
        this.ask = +payload.ask
        this.mid = +payload.mid
        this.low = +payload.low
        this.high = +payload.high
        this.volume = +payload.volume
    }

}


class Book extends Model {
    coin_id: string
    asks: string
    bids: string

    constructor(bookPayload: BookPayload) {
        super();
        this.extractBookPayloadData(bookPayload)
    }

    extractBookPayloadData(bookPayload: BookPayload): void {
        type accumulator = [number[], number[]]
        const reducerFunction = (accumulator: accumulator, item: BitfinexBookEntry): accumulator => {
            accumulator[0].push(+item.amount)
            accumulator[1].push(+item.price)
            return accumulator
        }
        this.coin_id = bookPayload.symbol
        this.asks = JSON.stringify(_.reduce(bookPayload.asks, reducerFunction, [[], []]))
        this.bids = JSON.stringify(_.reduce(bookPayload.bids, reducerFunction, [[], []]))
    }

    protected getTableName(): string {
        return 'book_entries'
    }
    
}

export {
    Ticker,
    Book
}