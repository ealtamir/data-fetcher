import * as winston from 'winston'

const w: any = <any>winston;

const myFormat = w.format.printf((info: any) => {
    return `${info.timestamp} [${info.level}] ${info.message}`
})

const logger = new w.createLogger({
    level: 'info',
    format: w.format.combine(w.format.timestamp(), myFormat),
    transports: [
        new w.transports.Console(),
        new w.transports.File({ filename: 'general.log' }),
    ]
})

export {
    logger
}

