import { OKEY_STATUS_CODE, BAD_REQUEST_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../../../constants/constants';
import editOrder from '../queries/editOrder';
import editUser from '../../user/queries/editUser';
import getOrderById from '../queries/getOrderById';
import getOrdersByUserId from '../queries/getOrdersByUserId';

import pricesController from '../../../../controllers/pricesController';
import { getCommission, getProfit } from '../../../../../src/apps/client/utils/getAssetValues';
import { COMMISSION } from '../../../../../src/apps/client/constants/constants';
import { CHART_SYMBOL_INFO_MAP } from '../../../../constants/symbols';

import calculateBuyingPrice from '../../../../../src/apps/client/utils/calculateBuyPrice';

export default function closeOrder (req, res) {
    try {
        const { id } = req.params;
        const { id: userId, balance } = res.locals.user;

        getOrderById(id)
            .then(order => {
                if (!order || order.userId !== userId) {
                    return res.status(BAD_REQUEST_STATUS_CODE).send();
                }
                const closedPrice = pricesController.prices[order.assetName];
                const closedPriceReal = order.type === 'sell' ? closedPrice : calculateBuyingPrice(order.assetName, closedPrice);

                const closedOrder = {
                    id,
                    isClosed: true,
                    closedAt: Date.now(),
                    closedPrice: closedPriceReal
                };

                const asset = CHART_SYMBOL_INFO_MAP[order.assetName];
                const profit = getProfit(order.amount, order.openingPrice, closedPriceReal, order.type, asset);
                const commission = getCommission(order.pledge, COMMISSION);
                const updatedUser = {
                    id: userId,
                    balance: balance + profit - commission
                };

                Promise.all([
                    editUser(updatedUser),
                    editOrder(closedOrder)
                ])
                    .then(([user]) => {
                        return getOrdersByUserId(userId)
                            .then(orders => {
                                const openOrders = orders.filter(order => !order.isClosed);
                                const closedOrders = orders.filter(order => order.isClosed);

                                res.status(OKEY_STATUS_CODE).send({ openOrders, closedOrders, user });
                            });
                    })
                    .catch(() => {
                        res.status(SERVER_ERROR_STATUS_CODE).end();
                    });
            });
    } catch (e) {
        res.status(SERVER_ERROR_STATUS_CODE).end();
    }
}
