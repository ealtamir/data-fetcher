import * as _ from 'lodash'
import * as stats from 'simple-statistics'
import * as Bluebird from 'bluebird'
import { knex } from './database'
import {TickerPayload, TradesPayload, BitfinexTradeEntry} from './bitfinex_interfaces'
import { Transaction } from 'knex';


abstract class Model {

    id: number = null;

    protected abstract getTableName(): string

    public saveModel(callback: (error: any, modelIds: number | number[]) => any): void {
        knex.transaction((trx: Transaction) => {
            return trx
                .insert(this, 'id')
                .into(this.getTableName())
                .then((id: number) => {
                    this.id = id;
                })
        }).then((id) => {
            callback(null, id)
        }).catch((error) => {
            callback(error, null)
        })
    }
}

class Ticker extends Model {
    coin_id: string;
    last_price: number;
    bid: number;
    ask: number;
    mid: number;
    low: number;
    high: number;
    volume: number;
    transactions_buy_qty: number;
    transactions_buy_coin_qty: number;
    transactions_buy_mean_price: number;
    transactions_buy_median_price: number;
    transactions_buy_stdev_price: number;
    transactions_sell_qty: number;
    transactions_sell_coin_qty: number;
    transactions_sell_mean_price: number;
    transactions_sell_median_price: number;
    transactions_sell_stdev_price: number;
    timestamp: number;

    constructor(tickerPayload: TickerPayload, tradesPayload: TradesPayload) {
        super()
        this.extractTickerPayloadData(tickerPayload)
        this.extractTradesPayloadData(tradesPayload)
    }

    protected getTableName(): string {
        return 'ticker_values'
    }

    private extractTradesPayloadData(payload: TradesPayload): void {
        let buy_qty: number = 0;
        let buy_coin_qty: number = 0;
        let buy_prices: Array<number> = []
        let buy_amounts: Array<number> = []
        let sell_qty: number = 0;
        let sell_coin_qty: number = 0;
        let sell_prices: Array<number> = []
        let sell_amounts: Array<number> = []
        _.each(payload.trades, (trade: BitfinexTradeEntry) => {
            if (trade.type === 'buy') {
                buy_qty += 1
                buy_coin_qty += trade.amount
                buy_prices.concat(trade.price)
                buy_amounts.concat(trade.amount)
            } else {
                sell_qty += 1
                sell_coin_qty += trade.amount
                sell_prices.concat(trade.price)
                sell_amounts.concat(trade.amount)
            }
        })
        buy_prices = _.sortBy(buy_prices)
        buy_amounts = _.sortBy(buy_amounts)
        sell_prices = _.sortBy(sell_prices)
        sell_amounts = _.sortBy(sell_amounts)
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
        this.coin_id = payload.symbol
        this.last_price = payload.last_price
        this.bid = payload.bid
        this.ask = payload.ask
        this.mid = payload.mid
        this.low = payload.low
        this.high = payload.high
        this.volume = payload.volume
    }

}
