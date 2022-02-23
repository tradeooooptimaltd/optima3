import { OKEY_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../../../constants/constants';
import getStatus from '../../../../helpers/getStatus';

import deleteByIdsQuery from '../../../client/transaction/queries/deleteByIds';
import getTransactionsByIds from '../../../client/transaction/queries/getTransactionsByIds';
import getAllTransactions from '../../../client/transaction/queries/getAllTransactions';

import editUser from '../../../client/user/queries/editUser';
import getAllUsers from '../../../client/user/queries/getAllUsers';
import checkBalance from '../utils/checkBalance';

export default function deleteByIds (req, res) {
    const { ids, user } = req.body;
    getTransactionsByIds(ids)
        .then(transactions => {
            const transactionsValueSumm = transactions.reduce((result, transaction) => {
                result += transaction.value;
                return result;
            }, 0);

            transactionsValueSumm >= 0
                ? checkBalance(user.balance + transactionsValueSumm)
                : checkBalance(user.balance - transactionsValueSumm);

            user.accountStatus = getStatus(user.balance, user.isVipStatus);

            deleteByIdsQuery(ids)
                .then(() => {
                    editUser({
                        id: user.id,
                        balance: user.balance,
                        accountStatus: user.accountStatus
                    })
                        .then(() => {
                            getAllUsers()
                                .then(users => {
                                    getAllTransactions()
                                        .then(transactions => {
                                            res.status(OKEY_STATUS_CODE).send({ transactions, users });
                                        });
                                })
                                .catch(() => {
                                    res.status(SERVER_ERROR_STATUS_CODE).end();
                                });
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
