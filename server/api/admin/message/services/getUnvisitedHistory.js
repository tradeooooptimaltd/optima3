import { OKEY_STATUS_CODE, SERVER_ERROR_STATUS_CODE } from '../../../../constants/constants';

import getAllUsersQuery from '../../../client/user/queries/getAllUsers';
import getMessagesQuery from '../../../client/message/queries/getMessages';

export default function getHistory (req, res) {
    const usersStatus = {
        admin: 'active'
    };
    try {
        return Promise.all([
            getMessagesQuery(),
            getAllUsersQuery()
        ])
            .then(([messages, users]) => {
                const unvisitedMessages = messages.filter((item) => {
                    let userStatus = usersStatus[item.senderId];

                    if (!userStatus) {
                        const user = users.find(user => user.id === item.senderId);
                        usersStatus[item.senderId] = user ? 'active' : 'deleted';

                        userStatus = usersStatus[item.senderId];
                    }

                    return userStatus === 'active' && item.senderId !== 'admin' && item.visited === false;
                });

                const unvisitedMessagesGoup = unvisitedMessages.reduce((acc, item) => {
                    if (acc.length === 0) { acc.push([item]); } else {
                        const index = acc.findIndex((accItem) => { return accItem[0].senderId === item.senderId; });
                        index !== -1 ? acc[index].push(item) : acc.push([item]);
                    }
                    return acc;
                }, []);

                return res.status(OKEY_STATUS_CODE).send(unvisitedMessagesGoup);
            })
            .catch(() => {
                return res.status(SERVER_ERROR_STATUS_CODE).end();
            });
    } catch (e) {
        return res.status(SERVER_ERROR_STATUS_CODE).end();
    }
}
