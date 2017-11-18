import { config } from './config'


module.exports = {
  development: config.database,
  staging: config.database,
  production: config.database
};
