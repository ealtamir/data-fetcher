import * as fs from 'fs'
import * as process from 'process'
import * as _ from 'lodash'


const SETTINGS_FILE = './settings.json'
const ENVIRONMENT: string = process.env['ENVIRONMENT'] || 'development'
let settings: any = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))


if (ENVIRONMENT == 'production') {
    settings[ENVIRONMENT]['database']['connection'] = {
        "host": process.env['DATABASE_HOST'],
        "port": process.env['DATABASE_PORT'],
        "user": process.env['DATABASE_USER'],
        "password": process.env['DATABASE_PASSWORD'],
        "database": process.env['DATABASE_NAME']
    }
}

const config: any = _.extend(settings[ENVIRONMENT], settings.global)

export {
    config
}