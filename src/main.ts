import * as async from "async";
import * as request from "request";
import * as _ from "lodash";
import * as bf from "./bitfinex_interfaces";
import { ErrorPayload } from "./common_interfaces";
import { BitfinexDataFetcher } from "./data_fetcher";
import { knex } from './database';


const fetcher = new BitfinexDataFetcher()
const symbols: Array<bf.BitfinexSymbols> = [
    bf.BitfinexSymbols.bitcoin,
    bf.BitfinexSymbols.litecoin,
    bf.BitfinexSymbols.ethereum,
    bf.BitfinexSymbols.iota,
    bf.BitfinexSymbols.aventus,
]

async.parallel(_.map(symbols, (symbol: bf.BitfinexSymbols) => {
    return (cb: any) => {
        let tickerParams: bf.BitfinexAPIParams = {
            symbol: symbol,
            callback: (err: ErrorPayload, payload: bf.BitfinexAPIPayload) => {
                cb(err, payload);
            },
        }
        let bookParams: bf.BitfinexAPIParams = {
            symbol: symbol,
            callback: (err: ErrorPayload, payload: bf.BitfinexAPIPayload) => {
                cb(err, payload)
            },
            limit_bids: 20,
            limit_asks: 20,
            group: 0
        }
        let tradeParams: bf.BitfinexAPIParams = {
            symbol: symbol,
            callback: (err: ErrorPayload, payload: bf.BitfinexAPIPayload) => {
                cb(err, payload)
            },
            limit_trades: 20
        }
        fetcher.getTradesData(tradeParams)
    }
}), (errors, results) => {
    if (errors) {
        return console.log(errors)
    }
    console.log(results)
})