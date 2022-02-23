import io from 'socket.io-client';

import EventEmitter from 'eventemitter3';
import calcUserOrdersChanges from '../../utils/calcUserOrdersChanges';
import formatPrice from '../../utils/formatPrice';
import { CHART_SYMBOL_INFO_MAP } from '../../../../../server/constants/symbols';
import calculateBuyingPrice from '../../utils/calculateBuyPrice';

const WEBSOCKET_URL = process.env.NODE_ENV === 'production' ? 'wss://trade.plat-finance.ru:8080' : 'ws://localhost:8080';

const DISCONNECT_TIMEOUT = 2000;

class AssetPriceWebsocketController {
    events = new EventEmitter();
    prices = {};
    changes = {};
    user = null;
    prevBalance = 0;
    balance = 0;
    freeBalance = 0;
    totalPledge = 0;
    totalProfit = 0;
    orders = [];
    isConnected = false;

    setPrices (prices) {
        this.prices = prices;
    }

    setUser (user, orders) {
        this.user = user;
        this.orders = orders;

        if (user) {
            this.calcUpdatedOrders();
        }
    }

    connect () {
        if (this.socket) {
            return;
        }
        const socket = io(WEBSOCKET_URL, { transports: ['websocket'] });

        this.socket = socket;

        socket.on('message', data => {
            this.prices[data.name] = data.price;
            this.changes[data.name] = data.changes;
            this.events.emit('data', data);
            this.user && this.handleMessage(data);
        });

        socket.on('connect', () => {
            this.events.emit('status', true);
            this.isConnected = true;
        });

        socket.on('disconnect', () => {
            this.isConnected = false;
            setTimeout(() => {
                if (!this.isConnected) {
                    this.events.emit('status', false);
                }
            }, DISCONNECT_TIMEOUT);
        });
    }

    handleMessage (data) {
        const { orders } = this;
        if (!orders || !orders.length || !orders.some(order => order.assetName === data.name)) {
            return;
        }

        this.calcUpdatedOrders();
    }

    calcUpdatedOrders () {
        const { user, orders } = this;

        const { ordersInfo, balance } = calcUserOrdersChanges(user, orders, assetPriceWebsocketController.prices);
        const newOrders = orders
            .map(order => {
                const asset = CHART_SYMBOL_INFO_MAP[order.assetName];
                const updatedOrder = ordersInfo[order.id];
                const currentPrice = updatedOrder.price;
                const currentPriceReal = order.type === 'buy' ? calculateBuyingPrice(asset.name, currentPrice) : currentPrice;
                const diffPrice = formatPrice(currentPriceReal - order.openingPrice);

                return {
                    ...order,
                    currentPrice: currentPriceReal,
                    commission: updatedOrder.commission,
                    diffPrice,
                    profit: updatedOrder.profit
                };
            });

        const { pledge: totalPledge, profit: totalProfit, commission: totalCommission } = newOrders
            .reduce((result, order) => {
                return ({
                    pledge: result.pledge + order.pledge,
                    profit: result.profit + order.profit,
                    commission: result.commission + order.commission
                });
            }, { pledge: 0, profit: 0, commission: 0 });

        this.prevBalance = this.balance;
        this.balance = balance;
        this.totalPledge = totalPledge;
        this.freeBalance = balance - totalPledge - totalCommission;
        this.orders = newOrders;
        this.totalProfit = totalProfit;

        if (this.prevBalance !== this.balance) {
            this.events.emit('ordersAndBalance', {
                balance,
                freeBalance: this.freeBalance,
                orders: newOrders,
                totalPledge,
                totalProfit
            });
        }
    }

    disconnect () {
        this.socket && this.socket.disconnect();
        this.socket = null;
    }
}

const assetPriceWebsocketController = new AssetPriceWebsocketController();

export default assetPriceWebsocketController;
