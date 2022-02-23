import pick from '@tinkoff/utils/object/pick';

const VALUES = [
    'id',
    'userId',
    'dirName',
    'assetName',
    'createdAt',
    'openingPrice',
    'amount',
    'pledge',
    'closedAt',
    'closedPrice',
    'type',
    'isClosed'
];

export default function prepareOrder (body) {
    return pick(VALUES, body);
}
