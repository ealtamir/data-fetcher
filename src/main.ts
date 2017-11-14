import * as async from "async";
import * as request from "request";
import * as _ from "lodash";
import * as bf from "./bitfinex_interfaces";
import { ErrorPayload } from "./common_interfaces";
import { BitfinexDataFetcher } from "./data_fetcher";
import { knex } from './database';
import { error } from "util";
import { BitfinexAPIPayload, TickerPayload, TradesPayload, BitfinexTradeEntry, BookPayload } from "./bitfinex_interfaces";
import { Ticker, Book } from './models'
import { QueryResult } from "pg";


const fetcher = new BitfinexDataFetcher()
const symbols: Array<bf.BitfinexSymbols> = [
    bf.BitfinexSymbols.bitcoin,
    bf.BitfinexSymbols.litecoin,
    bf.BitfinexSymbols.ethereum,
    bf.BitfinexSymbols.iota,
    bf.BitfinexSymbols.aventus,
]

async.parallel(_.reduce(symbols, (state: any, symbol: bf.BitfinexSymbols) => {
    const makeApiCallbacks = (cb: any) => {
        const PARALLEL_LIMIT = 2
        async.parallelLimit({
            tickerData: (callback: any) => {
                let tickerParams: bf.BitfinexAPIParams = {
                    symbol: symbol,
                    callback: (errors: ErrorPayload, payload: TickerPayload): void => {
                        payload.symbol = symbol
                        callback(errors, payload)
                    }
                }
                fetcher.getTickerData(tickerParams)
            },
            tradesData: (callback: any) => {
                let tradeParams: bf.BitfinexAPIParams = {
                    symbol: symbol,
                    limit_trades: 100,
                    callback: (errors: ErrorPayload, payload: any): void => {
                        let tradesPayload: TradesPayload = {
                            trades: payload,
                            symbol
                        }
                        callback(errors, tradesPayload)
                    }
                }
                fetcher.getTradesData(tradeParams)
            },
            bookData: (callback: any) => {
                let bookParams: bf.BitfinexAPIParams = {
                    symbol: symbol,
                    limit_asks: 10000,
                    limit_bids: 10000,
                    callback: (errors: ErrorPayload, payload: BookPayload): void => {
                        callback(errors, payload)
                    }
                }
                fetcher.getBookData(bookParams)
            }
        }, PARALLEL_LIMIT, (errors, results) => {
            cb(errors, results)
        })
    }
    let obj: any = {}
    obj[symbol] = makeApiCallbacks
    return _.extend(state, obj)
}, {}), (errors, results: any) => {
    if (errors) {
        return console.log(`Got error: ${JSON.stringify(errors)}`)
    }
    async.parallel(_.map(symbols, (symbol: bf.BitfinexSymbols) => {
        return (cb: any) => {
            let {tickerData, tradesData, bookData} = results[symbol]
            let tickerObject = new Ticker(tickerData, tradesData)
            let bookObject = new Book(bookData)
            async.parallel([
                callback => {
                    tickerObject.saveModel(callback)
                }, 
                callback => {
                    bookObject.saveModel(callback)
                }
            ], (errors, results) => {
                cb(errors, results)
            })
        }
    }), (errors, results) => {
        if (errors) {
            console.log(`Got error when storing data: ${JSON.stringify(errors)}`)
        } else {
            console.log(`Stored data with ids: ${JSON.stringify(results)}`)
        }
        knex.destroy()
    })

})
