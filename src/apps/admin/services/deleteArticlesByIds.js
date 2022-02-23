import request from 'superagent';
import base from './base';

import setArticlesAction from '../actions/setArticles';

import { TOKEN_LOCAL_STORAGE_NAME } from '../constants/constants';

export default function deleteArticle (ids) {
    return dispatch => {
        const token = localStorage.getItem(TOKEN_LOCAL_STORAGE_NAME);

        return base(
            request
                .delete('/api/admin/article')
                .send({ ids })
                .query({ token })
        )
            .then(articles => {
                return dispatch(setArticlesAction(articles));
            });
    };
}
