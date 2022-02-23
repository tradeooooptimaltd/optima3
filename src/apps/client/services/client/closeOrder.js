import request from 'superagent';
import base from '../base';

import setUser from '../../actions/setUser';
import { TOKEN_CLIENT_LOCAL_STORAGE_NAME } from '../../constants/constants';

export default function closeOrder (id) {
    return dispatch => {
        const token = localStorage.getItem(TOKEN_CLIENT_LOCAL_STORAGE_NAME);

        return base(
            request
                .get(`/api/client/order/close/${id}`)
                .query({ token })
        )
            .then(payload => {
                dispatch(setUser(payload));
            });
    };
}
