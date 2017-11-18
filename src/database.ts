import * as Knex from "knex"
import { config } from './config'
import { logger } from './logger'

logger.info('Starting database connection')
const knex = Knex({
    dialect: 'pg',
    connection: config.database.connection,
})


export {
    knex
}