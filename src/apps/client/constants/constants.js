export const LANGS = ['ru']; // need to add lang maps
export const DEFAULT_LANG = LANGS[0];
export const LANG_REGEX = LANGS
    .slice(1)
    .join('|');
export const DEFAULT_LANG_ROUTE = '';
export const SCROLL_TOP_LOCKED_EVENT_NAME = 'SCROLL_TOP_LOCKED_EVENT_NAME';
export const COOKIE_AGREEMENT_NAME = 'pl-finance-cookies-agreement';
export const TOKEN_CLIENT_LOCAL_STORAGE_NAME = 'pl-finance-client-token';
// export const TOKEN_LOCAL_STORAGE_NAME = 'pl-finance-token';

export const INITIAL_BALANCE = 5000;
export const COMMISSION = 0.0125;

export const CHART_TYPES = [
    { id: 1, name: 'Candlesticks', value: 'candlesticks' },
    { id: 2, name: 'Heikinashi', value: 'heikinashi' },
    { id: 3, name: 'HLC', value: 'hlc' },
    { id: 4, name: 'Line', value: 'line' },
    { id: 5, name: 'Area', value: 'area' },
    { id: 6, name: 'Dots', value: 'dots' }
];

export const CHART_TIMEFRAMES = [
    { id: 1, label: '1', value: '1' },
    { id: 2, label: '5', value: '5' },
    { id: 3, label: '15', value: '15' },
    { id: 4, label: '30', value: '30' },
    { id: 5, label: '1h', value: '60' },
    { id: 6, label: '1d', value: 'D' },
    { id: 7, label: '1w', value: 'W' },
    { id: 8, label: '1m', value: 'M' }
];

export const COUNTRY_INFO = [
    { id: 1, name: 'ru', callingCode: '+7', flag: '/src/apps/client/constants/images/ru_flag.svg' },
    { id: 2, name: 'ua', callingCode: '+380', flag: '/src/apps/client/constants/images/ua_flag.svg' },
    { id: 3, name: 'by', callingCode: '+375', flag: '/src/apps/client/constants/images/by_flag.svg' }
];

export const AMOUNT = [
    { id: 1, name: 'gold', value: 500 },
    { id: 2, name: 'platinum', value: 1000 },
    { id: 3, name: 'diamond', value: 5000 },
    { id: 4, name: 'vip', value: 10000 }
];
