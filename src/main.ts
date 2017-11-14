import * as async from "async";
import * as request from "request";
import * as _ from "lodash";
import * as bf from "./bitfinex_interfaces";
import { ErrorPayload } from "./common_interfaces";
import { BitfinexDataFetcher } from "./data_fetcher";
import { knex } from './database';
import { error } from "util";
import { BitfinexAPIPayload, TickerPayload, TradesPayload, BitfinexTradeEntry } from "./bitfinex_interfaces";


const fetcher = new BitfinexDataFetcher()
const symbols: Array<bf.BitfinexSymbols> = [
    bf.BitfinexSymbols.bitcoin,
    bf.BitfinexSymbols.litecoin,
    // bf.BitfinexSymbols.ethereum,
    // bf.BitfinexSymbols.iota,
    // bf.BitfinexSymbols.aventus,
]

async.parallel(_.reduce(symbols, (state: any, symbol: bf.BitfinexSymbols) => {
    const makeApiCallbacks = (cb: any) => {
        async.parallel({
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
                    limit_trades: 3,
                    callback: (errors: ErrorPayload, payload: any): void => {
                        let tradesPayload: TradesPayload = {
                            trades: payload,
                            symbol
                        }
                        callback(errors, tradesPayload)
                    }
                }
                fetcher.getTradesData(tradeParams)
            }
        }, (errors, results) => {
            cb(errors, results)
        })
    }
    let obj: any = {}
    obj[symbol] = makeApiCallbacks
    return _.extend(state, obj)
}, {}), (errors, results) => {
    if (errors) {
        return console.log(`Got error: ${JSON.stringify(errors)}`)
    }
    console.log(`Got result: ${JSON.stringify(results)}`)
})