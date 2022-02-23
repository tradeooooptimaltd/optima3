import uniqid from 'uniqid';

import { OKEY_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../../../constants/constants';

import prepareTransaction from '../utils/prepareTransaction';

import saveTransactionQuery from '../../../client/transaction/queries/saveTransaction';
import getUserByIdQuery from '../../../client/user/queries/getUserById';
import editUserQuery from '../../../client/user/queries/editUser';
import getAllUsers from '../../../client/user/queries/getAllUsers';
import getStatus from '../../../../helpers/getStatus';
import checkBalance from '../utils/checkBalance';
import getAllTransactions from '../../../client/transaction/queries/getAllTransactions';

export default function saveTransaction (req, res) {
    const transaction = prepareTransaction(req.body);
    const id = uniqid();

    saveTransactionQuery({ ...transaction, id, createdAt: Date.now() })
        .then(transaction => {
            getUserByIdQuery(transaction.userId)
                .then(user => {
                    const balance = user.balance;
                    user.balance = checkBalance(balance + transaction.value);
                    user.accountStatus = getStatus(checkBalance(user.balance, user.isVipStatus));

                    editUserQuery({
                        id: user.id,
                        balance: user.balance,
                        accountStatus: user.accountStatus
                    })
                        .then(() => {
                            getAllUsers()
                                .then(users => {
                                    getAllTransactions()
                                        .then(transactions => {
                                            res.status(OKEY_STATUS_CODE).send({ users, transactions });
                                        });
                                })
                                .catch(() => {
                                    res.status(SERVER_ERROR_STATUS_CODE).end();
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
}
