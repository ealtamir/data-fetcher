import * as async from 'async'
import * as moment from 'moment'
import * as _ from 'lodash'

import * as bf from './bitfinex_interfaces'
import { CryptoPipeline } from './pipeline'
import { StandardCallback } from './bitfinex_interfaces'
import { knex } from './database'
import { config } from './config'
import { logger } from './logger'


const PIPELINE_INTERVAL_IN_MS = config.manager.pipeline_interval_ms
const PARALLEL_PIPELINE_EXECUTION_LIMIT = config.manager.parallel_execution_limit

class Manager {

    private pipelines: CryptoPipeline[]
    private pipelinesCount: number
    private interval: any
    private runningPipelines: boolean = false

    constructor(symbols: bf.BitfinexSymbols[]) {
        this.pipelines = _.map(symbols, (symbol: bf.BitfinexSymbols) => {
            return new CryptoPipeline(symbol)
        })
        this.pipelinesCount = this.pipelines.length
    }

    public start(): void {
        logger.info('Starting manager')
        this.performManagerProcess()
        this.interval = setInterval(() => {
            this.performManagerProcess()
        }, PIPELINE_INTERVAL_IN_MS)
    }

    public stop() {
        if (this.interval) {
            clearInterval(this.interval)
        }
        this.doIfNoPipelinesRunning(() => {
            knex.destroy()
        })
    }

    private performManagerProcess(): void {
        this.runningPipelines = true
        async.parallelLimit(_.map(this.pipelines, (pipeline: CryptoPipeline) => {
            return (cb: StandardCallback) => {
                pipeline.runPipeline(cb)
            }
        }), PARALLEL_PIPELINE_EXECUTION_LIMIT, (errors, results) => {
            const saveCount = _.sum(_.map(results, el => { return el? 1: 0}))
            logger.info(`Saved ${saveCount} out of ${this.pipelinesCount} currencies successfully`)
            this.runningPipelines = false
        })
    }

    private doIfNoPipelinesRunning(cb: any): void {
        if (this.runningPipelines === false) {
            return cb()
        }
        setTimeout(() => {
            this.doIfNoPipelinesRunning(cb)
        }, 500)
    }
}

export {
    Manager
}
