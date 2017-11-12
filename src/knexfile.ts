// Update with your config settings.

const options = {
  client: 'postgresql',
  connection: {
    database: 'default_db',
    user:     'enzo',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations'
  }
}

module.exports = {

  development: options,

  staging: options,

  production: options

};
