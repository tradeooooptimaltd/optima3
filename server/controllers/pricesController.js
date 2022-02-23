import { FINNHUB_API_KEY, SYMBOL_PRICE_CHANGE_EVENT } from '../constants/constants';
import WebSocket from 'ws';
import EventEmitter from 'eventemitter3';

import last from '@tinkoff/utils/array/last';
import isUndefined from '@tinkoff/utils/is/undefined';

import schedule from 'node-schedule';

import {
    CURRENCIES_SYMBOLS,
    VALUES_SYMBOLS,
    COMPANY_SHARES_SYMBOLS,
    INDICES_SYMBOLS,
    CRYPTO_CURRENCIES_SYMBOLS,
    CHART_SYMBOL_GROUPS
} from '../constants/symbols';
import getPeriodByTimeframe from '../../src/apps/client/ui/pages/MainPage/utils/getPeriodByTimeframe';
import getHistoryPrice from '../../src/apps/client/services/client/getHistoryPrice';

export const pricesEvents = new EventEmitter();

class PricesController {
    prices = {};
    prevPrices = {};

    start () {
        if (process.env.NODE_ENV === 'production') {
            this.getInitPrices();
        }

        const setWebsocket = () => {
            try {
                const socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

                socket.addEventListener('open', () => {
                    CURRENCIES_SYMBOLS.forEach(({ name }) => {
                        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': name }));
                    });
                    VALUES_SYMBOLS.forEach(({ name }) => {
                        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': name }));
                    });
                    COMPANY_SHARES_SYMBOLS.forEach(({ name }) => {
                        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': name }));
                    });
                    INDICES_SYMBOLS.forEach(({ name }) => {
                        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': name }));
                    });
                    CRYPTO_CURRENCIES_SYMBOLS.forEach(({ name }) => {
                        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': name }));
                    });
                });

                socket.addEventListener('message', event => {
                    const data = JSON.parse(event.data);

                    if (!data.data) {
                        return;
                    }
                    const newPrice = data.data[0].p;
                    const symbolName = data.data[0].s;
                    const symbolTime = data.data[0].t;

                    if (newPrice === this.prices[symbolName]) {
                        return;
                    }

                    const assetPriceChange = {
                        name: symbolName,
                        price: newPrice,
                        time: symbolTime,
                        changes: newPrice > this.prices[symbolName] ? 'up' : 'down'
                    };
                    this.prevPrices[symbolName] = this.prices[symbolName];
                    this.prices[symbolName] = newPrice;

                    assetPriceChange.prevPrice = this.prevPrices[symbolName];

                    pricesEvents.emit(SYMBOL_PRICE_CHANGE_EVENT, { prices: this.prices, assetPriceChange });
                });

                socket.addEventListener('error', () => {});

                socket.addEventListener('close', () => {
                    setTimeout(() => {
                        setWebsocket();
                    }, 1000);
                });

                this.socket = socket;
            } catch (e) {}
        };

        setWebsocket();

        schedule.scheduleJob({ hour: 6 }, this.restartConnection);
        schedule.scheduleJob({ hour: 8 }, this.restartConnection);
        schedule.scheduleJob({ hour: 10 }, this.restartConnection);
        schedule.scheduleJob({ hour: 12 }, this.restartConnection);
        schedule.scheduleJob({ hour: 14 }, this.restartConnection);
        schedule.scheduleJob({ hour: 16 }, this.restartConnection);
        schedule.scheduleJob({ hour: 18 }, this.restartConnection);
        schedule.scheduleJob({ hour: 18 }, this.restartConnection);
        schedule.scheduleJob({ hour: 20 }, this.restartConnection);
        schedule.scheduleJob({ hour: 22 }, this.restartConnection);
    }

    restartConnection = () => {
        this.socket && this.socket.close();
    };

    getInitPrices () {
        try {
            const timeframe = '5';
            const symbolsInfo = CHART_SYMBOL_GROUPS.reduce((result, assetGroup) => {
                return [
                    ...result,
                    ...assetGroup.symbols.map(symbol => ({
                        ...getPeriodByTimeframe(timeframe, assetGroup.id),
                        resolution: timeframe,
                        symbolGroup: assetGroup.id,
                        symbol: symbol.name
                    }))
                ];
            }, []);
            const getHistoryFuncs = symbolsInfo.map(info => getHistoryPrice(info));
            for (let i = 0; i < Math.ceil(getHistoryFuncs.length / 10); i++) {
                const currentSymbols = symbolsInfo.slice(i * 10, (i + 1) * 10);

                setTimeout(() => {
                    Promise.all(
                        currentSymbols.map(info => getHistoryPrice(info)())
                    )
                        .then(prices => {
                            prices.forEach((data, i) => {
                                if (!data.c) {
                                    return;
                                }

                                if (isUndefined(this.prices[currentSymbols[i].symbol])) {
                                    this.prices = {
                                        ...this.prices,
                                        [currentSymbols[i].symbol]: last(data.c)
                                    };
                                }

                                if (isUndefined(this.prevPrices[currentSymbols[i].symbol])) {
                                    if (isUndefined(this.prices[currentSymbols[i].symbol])) {
                                        this.prevPrices = {
                                            ...this.prevPrices,
                                            [currentSymbols[i].symbol]: data.c[data.c.length - 2]
                                        };
                                    } else {
                                        this.prevPrices = {
                                            ...this.prevPrices,
                                            [currentSymbols[i].symbol]: data.c[data.c.length - 1]
                                        };
                                    }
                                }
                            });
                        })
                        .catch(() => {});
                }, i * 30000);
            }
        } catch (e) {}
    }
}

const pricesController = new PricesController();

export default pricesController;
