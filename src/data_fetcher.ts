import * as asyncLib from "async";
import * as request from "request";
import * as _ from "lodash";
import { ErrorPayload } from "./common_interfaces";
import * as bf from "./bitfinex_interfaces";
import * as buildUrl from "build-url";
import { BookPayload, BitfinexSymbols, BitfinexAPIParams,
     TradesPayload, TickerPayload } from "./bitfinex_interfaces";


class BitfinexDataFetcher {
    readonly baseV1URL: string = `https://api.bitfinex.com/v1`;

    public getTickerData(params: bf.BitfinexAPIParams): void {
        const url = buildUrl(this.baseV1URL, {
            path: `/pubticker/${params.symbol}`
        });
        this.makeRequest(url, this.responseHandler<TickerPayload>(params))
    }

    public getTradesData(params: bf.BitfinexAPIParams): void {
        const url = buildUrl(this.baseV1URL, {
            path: `/trades/${params.symbol}`,
            queryParams: {
                timestamp: params.timestamp,
                limit_trades: params.limit_trades
            }
        })
        this.makeRequest(url, this.responseHandler<TradesPayload>(params))
    }

    public getBookData(params: bf.BitfinexAPIParams): void {
        const url = buildUrl(this.baseV1URL, {
            path: `/book/${params.symbol}`,
            queryParams: {
                limit_asks: params.limit_asks,
                limit_bids: params.limit_bids,
                group: params.group
            }
        })
        this.makeRequest(url, this.responseHandler<BookPayload>(params))
    }

    private responseHandler<T extends bf.BitfinexAPIPayload>(params: BitfinexAPIParams) {
        return (error: any, responseBody: any) => {
            if (error) {
                params.callback(error, null)
            }
            responseBody.symbol = params.symbol
            params.callback(null, responseBody as T)
        }
    }

    // TODO: Think about adding retry functionality
    private makeRequest(url: string, cb: (err: ErrorPayload, payload: any) => void) {
        request(url, (error, response, body) => {
            if (error) {
                return cb({errorMsg: error, errorCode: response && response.statusCode}, null)
            }
            return cb(null, JSON.parse(body))
        })
    }

}

export {
    BitfinexDataFetcher
}