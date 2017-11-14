import * as Knex from "knex"
import * as config from './config'
import { Client } from 'pg'

const connectionParams = {
    user: 'enzo',
    database: 'default_db'
}

const knex = Knex({
    dialect: 'pg',
    connection: connectionParams,
})

const client = new Client(connectionParams)

export {
    knex,
    client
}