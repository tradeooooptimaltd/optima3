import jsonwebtoken from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

import { OKEY_STATUS_CODE, FORBIDDEN_STATUS_CODE, SERVER_ERROR_STATUS_CODE, NOT_FOUND_STATUS_CODE } from '../../../../constants/constants';

import getUserByIdQuery from '../../user/queries/getUserById';
import getOrdersByUserId from '../../order/queries/getOrdersByUserId';
import getTransactionsByUserId from '../../transaction/queries/getTransactionsByUserId';
import getPayments from '../../../admin/payment/queries/getPayments';

const publicKey = fs.readFileSync(path.resolve(__dirname, 'privateKeys/adminPublicKey.ppk'), 'utf8');

export default function checkAuthentication (req, res) {
    try {
        const token = req.query.token;

        if (!token) {
            return res.status(FORBIDDEN_STATUS_CODE).end();
        }

        jsonwebtoken.verify(token, publicKey, {
            algorithm: 'RS256'
        }, (err, { id: userId }) => {
            if (err) {
                return res.status(FORBIDDEN_STATUS_CODE).end();
            }

            getUserByIdQuery(userId)
                .then(user => {
                    if (!user || user.blocked) {
                        return res.status(NOT_FOUND_STATUS_CODE).end();
                    }

                    return Promise.all([
                        getOrdersByUserId(userId),
                        getTransactionsByUserId(userId),
                        getPayments()
                    ])
                        .then(([orders, transactions, payments]) => {
                            const payment = payments[0];
                            const openOrders = orders.filter(order => !order.isClosed);
                            const closedOrders = orders.filter(order => order.isClosed);

                            return res.status(OKEY_STATUS_CODE).send({
                                user,
                                openOrders,
                                closedOrders,
                                transactions,
                                payment
                            });
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
