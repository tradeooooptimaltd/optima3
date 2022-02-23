import { OKEY_STATUS_CODE, SERVER_ERROR_STATUS_CODE, BAD_REQUEST_STATUS_CODE } from '../../../../constants/constants';

import prepareOrder from '../utils/prepareOrder';

import editOrderQuery from '../../../client/order/queries/editOrder';
import editUserQuery from '../../../client/user/queries/editUser';
import getOrderById from '../../../client/order/queries/getOrderById';
import getUserById from '../../../client/user/queries/getUserById';

import { getProfit, getCommission } from '../../../../../src/apps/client/utils/getAssetValues';

import { COMMISSION } from '../../../../../src/apps/client/constants/constants';
import { CHART_SYMBOL_INFO_MAP } from '../../../../constants/symbols';

export default function editOrder (req, res) {
    const order = prepareOrder(req.body);

    if (order.isClosed) {
        getOrderById(order.id)
            .then(prevOrder => {
                getUserById(order.userId)
                    .then(user => {
                        if (!order || order.userId !== user.id) {
                            return res.status(BAD_REQUEST_STATUS_CODE).send();
                        }

                        const prevAsset = CHART_SYMBOL_INFO_MAP[prevOrder.assetName];
                        const asset = CHART_SYMBOL_INFO_MAP[prevOrder.assetName];
                        const prevProfit = getProfit(prevOrder.amount, prevOrder.openingPrice, prevOrder.closedPrice, prevOrder.type, prevAsset);
                        const profit = getProfit(order.amount, order.openingPrice, order.closedPrice, order.type, asset);

                        const prevCommission = getCommission(prevOrder.pledge, COMMISSION);
                        const commission = getCommission(order.pledge, COMMISSION);

                        const updatedUser = {
                            id: order.userId,
                            balance: user.balance - prevProfit + prevCommission + profit - commission
                        };

                        Promise.all([
                            editOrderQuery(order),
                            editUserQuery(updatedUser)
                        ])
                            .then(([order]) => {
                                res.status(OKEY_STATUS_CODE).send(order);
                            })
                            .catch(() => {
                                res.status(SERVER_ERROR_STATUS_CODE).end();
                            });
                    })
                    .catch(() => {
                        res.status(SERVER_ERROR_STATUS_CODE).end();
                    });
            })
            .catch(() => {
                res.status(SERVER_ERROR_STATUS_CODE).end();
            });
    } else {
        editOrderQuery(order)
            .then(order => {
                res.status(OKEY_STATUS_CODE).send(order);
            })
            .catch(() => {
                res.status(SERVER_ERROR_STATUS_CODE).end();
            });
    }
}
