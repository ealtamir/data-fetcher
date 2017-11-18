import * as async from "async"
import * as request from "request"
import * as _ from "lodash"

import * as bf from "./bitfinex_interfaces"
import { ErrorPayload } from "./common_interfaces"
import { BitfinexDataFetcher } from "./data_fetcher"
import { knex } from './database'
import {
    BitfinexAPIPayload, TickerPayload, TradesPayload,
    BitfinexTradeEntry, BookPayload, StandardCallback 
} from "./bitfinex_interfaces"
import { Manager } from "./manager"
import { setTimeout } from "timers";
import { config } from './config'
import * as http from 'http';
import { logger } from "./logger";


const fetcher = new BitfinexDataFetcher()
const symbols: bf.BitfinexSymbols[] = <bf.BitfinexSymbols[]>config.symbols
const manager: Manager = new Manager(symbols)


manager.start()
if (config.environment === 'development') {
    setTimeout(() => {
        manager.stop()
    }, 3 * 1000 * 60)
} else {
    http.createServer((request, response) => {
        response.end("I'm up!")
    }).listen(config.uptime_port, (err: any) => {
        if (err) {
            return logger.error(`Server listen triggered an error: ${JSON.stringify(err)}`)
        }
        return logger.info(`Started uptime server at port ${config.uptime_port}`)
    })
}
