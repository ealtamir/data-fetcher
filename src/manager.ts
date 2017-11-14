import * as async from 'async'
import * as moment from 'moment'

import * as bf from './bitfinex_interfaces'
import { DefaultCallback } from './common_interfaces'
import { BitfinexDataFetcher } from './data_fetcher'
import { ErrorPayload } from "./common_interfaces"
import { BookPayload, BitfinexSymbols, BitfinexAPIParams,
     TradesPayload, TickerPayload } from "./bitfinex_interfaces";
import { Ticker, Book } from './models';


const LIMIT_TRADES = 10000
const TIMESTAMP = moment().subtract(1, 'minutes').unix()
const LIMIT_BIDS = 10000
const LIMIT_ASKS = 10000
const GROUP = 0


class Manager {
}

class CryptoPipeline {

    static fetcher: BitfinexDataFetcher = new BitfinexDataFetcher()
    readonly symbol: bf.BitfinexSymbols

    constructor(symbol: bf.BitfinexSymbols) {
        this.symbol = symbol
    }

    public runPipeline(callback: DefaultCallback) {
        this.fetchData((errors: any, results: [TickerPayload, TradesPayload, BookPayload]) => {
            if (errors) {
                return callback(errors, null)
            }
            let [tickerData, bookData] = this.generateModels(results)
            this.storeModels(tickerData, bookData, callback)
        })
    }

    private generateModels(results: [TickerPayload, TradesPayload, BookPayload]): [Ticker, Book] {
        let [tickerPayload, tradesPayload, bookPayload] = results
        return [new Ticker(tickerPayload, tradesPayload), new Book(bookPayload)]
    }

    private storeModels(ticker: Ticker, book: Book, callback: DefaultCallback): void {
        async.parallel([
            cb => { ticker.saveModel(cb) },
            cb => { book.saveModel(cb) }
        ], callback)
    }

    private fetchData(callback: (errors: any, results: [TickerPayload, TradesPayload, BookPayload]) => void) {
        async.parallel([
            cb => {
                CryptoPipeline.fetcher.getTickerData(
                    this.tickerParamsGenerator(cb)
                )
            },
            cb => {
                CryptoPipeline.fetcher.getTradesData(
                    this.tradesParamsGenerator(LIMIT_TRADES, TIMESTAMP, cb)
                )
            },
            cb => {
                CryptoPipeline.fetcher.getBookData(
                    this.bookParamsGenerator(LIMIT_BIDS, LIMIT_ASKS, GROUP, cb)
                )
            }
        ], (error, results: any) => {
            if (error) {
                return callback(error, null)
            }
            let [tickerPayload, tradesPayload, bookPayload] = results
            callback(null, [tickerPayload, tradesPayload, bookPayload])
        })

    }

    private tickerParamsGenerator(callback: DefaultCallback): bf.BitfinexAPIParams  {
        return {
            symbol: this.symbol,
            callback: (errors: ErrorPayload, payload: TickerPayload): void => {
                callback(errors, payload)
            }
        }
    }

    private tradesParamsGenerator(limit_trades: number, timestamp: number, callback: DefaultCallback): bf.BitfinexAPIParams {
        return {
            symbol: this.symbol,
            limit_trades: limit_trades,
            timestamp: timestamp,
            callback: (errors: ErrorPayload, payload: any): void => {
                let tradesPayload: TradesPayload = {
                    trades: payload,
                    symbol: this.symbol
                }
                callback(errors, tradesPayload)
            }
        }
    }

    private bookParamsGenerator(limit_bids: number, limit_asks: number, group: 0 | 1, callback: DefaultCallback): bf.BitfinexAPIParams {
        return {
            symbol: this.symbol,
            limit_asks,
            limit_bids,
            group,
            callback: (errors: ErrorPayload, payload: BookPayload): void => {
                callback(errors, payload)
            }
        }
    }
}

export {
    CryptoPipeline
}