import * as async from "async"
import * as request from "request"
import * as _ from "lodash"
import { error } from "util"

import * as bf from "./bitfinex_interfaces"
import { ErrorPayload } from "./common_interfaces"
import { BitfinexDataFetcher } from "./data_fetcher"
import { knex } from './database'
import {
    BitfinexAPIPayload, TickerPayload, TradesPayload,
    BitfinexTradeEntry, BookPayload, StandardCallback 
} from "./bitfinex_interfaces"
import { CryptoPipeline } from "./manager"



const fetcher = new BitfinexDataFetcher()
const symbols: Array<bf.BitfinexSymbols> = [
    bf.BitfinexSymbols.bitcoin,
    bf.BitfinexSymbols.litecoin,
    bf.BitfinexSymbols.ethereum,
    bf.BitfinexSymbols.iota,
    bf.BitfinexSymbols.aventus,
]

let pipelines = _.map(symbols, symbol => {
    return new CryptoPipeline(symbol)
})

const PARALLEL_LIMIT = 20

async.parallelLimit(_.map(pipelines, pipeline => {
    return (cb: StandardCallback) => {
        pipeline.runPipeline(cb)
    }
}), PARALLEL_LIMIT, (errors, results) => {
    if (errors) {
        console.log(`Got errors: ${JSON.stringify(errors)}`)
    } else {
        console.log(`Succeeded storing all data: ${JSON.stringify(results)}`)
    }
    knex.destroy()
})