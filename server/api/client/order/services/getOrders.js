import getOrdersByUserId from '../queries/getOrdersByUserId';

import {
    OKEY_STATUS_CODE,
    SERVER_ERROR_STATUS_CODE
} from '../../../../constants/constants';

export default function getCompanies (req, res) {
    try {
        const { id } = res.locals.user;

        getOrdersByUserId(id)
            .then(orders => {
                const openOrders = orders.filter(order => !order.isClosed);
                const closedOrders = orders.filter(order => order.isClosed);
                res.status(OKEY_STATUS_CODE).send({ openOrders, closedOrders });
            })
            .catch(() => {
                res.status(SERVER_ERROR_STATUS_CODE).end();
            });
    } catch (e) {
        res.status(SERVER_ERROR_STATUS_CODE).end();
    }
}
