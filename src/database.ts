import * as knexConstructor from "knex";
import * as config from './config';

const knex = knexConstructor({
    dialect: 'pg',
    connection: {
        user: 'enzo',
        database: 'db_default'
    }
})

export {
    knex,
}