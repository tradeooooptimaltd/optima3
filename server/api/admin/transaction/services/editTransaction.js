import { OKEY_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../../../constants/constants';

import prepareTransaction from '../utils/prepareTransaction';

import editTransactionQuery from '../../../client/transaction/queries/editTransaction';
import getTransactionById from '../../../client/transaction/queries/getTransactionById';
import editUser from '../../../client/user/queries/editUser';
import checkBalance from '../utils/checkBalance';
import getStatus from '../../../../helpers/getStatus';
import getAllUsers from '../../../client/user/queries/getAllUsers';
import getAllTransactions from '../../../client/transaction/queries/getAllTransactions';
import getUserById from '../../../client/user/queries/getUserById';

export default function editTransaction (req, res) {
    const updatedTransaction = prepareTransaction(req.body.transaction);
    const { user } = req.body;

    getTransactionById(updatedTransaction.id)
        .then(transaction => {
            getUserById(user.id)
                .then(user => {
                    const diff = +updatedTransaction.value - transaction[0].value;
                    const balance = user.balance + diff;
                    user.balance = checkBalance(balance);
                    user.accountStatus = getStatus(user.balance, user.isVipStatus);

                    editTransactionQuery(updatedTransaction)
                        .then(() => {
                            editUser({
                                id: user.id,
                                balance: user.balance,
                                accountStatus: user.accountStatus
                            })
                                .then(() => {
                                    getAllUsers()
                                        .then((users) => {
                                            getAllTransactions()
                                                .then(transactions => {
                                                    res.status(OKEY_STATUS_CODE).send({ transactions, users });
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
}
