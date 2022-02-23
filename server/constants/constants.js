export const OKEY_STATUS_CODE = 200;
export const BAD_REQUEST_STATUS_CODE = 400;
export const UNAUTHORIZED_STATUS_CODE = 401;
export const FORBIDDEN_STATUS_CODE = 403;
export const NOT_FOUND_STATUS_CODE = 404;
export const SERVER_ERROR_STATUS_CODE = 500;
export const MONGODB_DUPLICATE_CODE = 11000;
export const APP_FORM_FILE_FIELD_NAME_REGEX = /app-form-file-/g;

export const DATABASE_URL = 'mongodb://localhost/pl-finance';

export const FILES_FOLDER_PATH = 'src/apps/admin/files';

export const FINNHUB_API_KEY_DEV = 'btm723f48v6uocf279n0';
export const FINNHUB_API_KEY_PROD = 'c34deeqad3ie56g37350';
export const FINNHUB_API_KEY = process.env.NODE_ENV === 'production' ? FINNHUB_API_KEY_PROD : FINNHUB_API_KEY_DEV;

export const SYMBOL_PRICE_CHANGE_EVENT = 'symbol_price_change';

export const DEV_MAIL_CREDENTIALS = {
    login: 'tradeooooptimaltd@gmail.com',
    password: 'amitpO2202'
};
export const PROD_MAIL_CREDENTIALS = {
    login: 'tradeooooptimaltd@gmail.com',
    password: 'amitpO2202'
};
export const MAIL_CREDENTIALS = process.env.NODE_ENV === 'production' ? PROD_MAIL_CREDENTIALS : DEV_MAIL_CREDENTIALS;

export const DOC_NAMES = ['identity', 'residence', 'cardFront', 'cardBack', 'others'];

export const AMOUNT = [
    { id: 1, name: 'gold', value: 1000 },
    { id: 2, name: 'platinum', value: 5000 },
    { id: 3, name: 'diamond', value: 20000 },
    { id: 4, name: 'vip' }
];

export const REQUIRED_DOC = [
    'identity',
    'residence',
    'cardFront',
    'cardBack'
];
