import { ErrorPayload } from "./common_interfaces";
import * as bf from "./bitfinex_interfaces"

type StandardCallback = (errPayload: ErrorPayload, payload: bf.BitfinexAPIPayload) => void;

enum BitfinexSymbols {
    bitcoin = 'btcusd',
    litecoin = "ltcusd",
    ethereum = "ethusd",
    ethereumClassic = "etcusd",
    zcash = "zecusd",
    monero = "xmrusd",
    dash = "dshusd",
    ripple = "xrpusd",
    iota = "iotusd",
    eosToken = "eosusd",
    santiment = "sanusd", // Scam?
    omiseToken = "omgusd", // Token?
    bitcoinCash = "bchusd",
    neo = "neousd",
    metaverse = "etpusd",
    qtumToken = "qtmusd",
    aventus = "avtusd",
    eidoo = "edousd", // Wallet technology
    bitcoinGold = "btgusd",
    streamr = "datusd"
}

interface BitfinexAPIPayload {
    symbol: BitfinexSymbols;
}

interface TickerPayload extends BitfinexAPIPayload {
    last_price: number;
    bid: number;
    ask: number;
    mid: number;
    low: number;
    high: number;
    volume: number;
    timestamp: number;
}

interface BitfinexBookEntry {
    price: number;
    amount: number;
    timestamp: number;
}

interface BookPayload extends BitfinexAPIPayload {
    bids: Array<BitfinexBookEntry>,
    asks: Array<BitfinexBookEntry>
}

interface BitfinexTradeEntry {
    timestamp: number;
    tid: string;
    price: number;
    amount: number;
    type: 'buy' | 'sell'
    exchange?: string
}

interface TradesPayload extends BitfinexAPIPayload {
    trades: BitfinexTradeEntry[]
}

interface BitfinexAPIParams {
    symbol: BitfinexSymbols,
    callback: StandardCallback,
    timestamp?: number,
    limit_trades?: number,
    limit_bids?: number;
    limit_asks?: number;
    group?: 0 | 1;
}

export {
    BitfinexAPIPayload,
    TickerPayload,
    BookPayload,
    TradesPayload,
    BitfinexAPIParams,
    BitfinexSymbols,
    BitfinexTradeEntry,
    BitfinexBookEntry,
    StandardCallback
}