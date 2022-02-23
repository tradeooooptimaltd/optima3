import uniqid from 'uniqid';
import each from '@tinkoff/utils/object/each';

import saveOrderQuery from '../queries/saveOrder';
import numeral from 'numeral';

import {
    BAD_REQUEST_STATUS_CODE,
    OKEY_STATUS_CODE,
    SERVER_ERROR_STATUS_CODE
} from '../../../../constants/constants';

import {
    CHART_SYMBOL_INFO_MAP
} from '../../../../constants/symbols';
import { orderFieldsValidatorsMap } from '../utils/fieldsAndValidation';
import { getOpeningSlotPrice, getPledge } from '../../../../../src/apps/client/utils/getAssetValues';
import getOrdersByUserId from '../queries/getOrdersByUserId';

import pricesController from '../../../../controllers/pricesController';

import calculateBuyingPrice from '../../../../../src/apps/client/utils/calculateBuyPrice';

const validate = (fields, fieldsValidatorsMap) => {
    let isValid = true;

    each((value, key) => {
        const validators = fieldsValidatorsMap[key];

        validators && validators.forEach(validator => {
            if (!validator(value)) {
                isValid = false;
            }
        });
    }, fields);

    return isValid;
};

export default function saveOrder (req, res) {
    try {
        const {
            assetName,
            amount,
            type
        } = req.body;
        const openingPrice = pricesController.prices[assetName];
        const openingPriceReal = type === 'sell' ? openingPrice : calculateBuyingPrice(assetName, openingPrice);
        const asset = CHART_SYMBOL_INFO_MAP[assetName];

        if (!asset) {
            return res.status(BAD_REQUEST_STATUS_CODE).end();
        }

        const { id: userId } = res.locals.user;
        const openingSlotPrice = getOpeningSlotPrice(asset, openingPriceReal);
        const pledge = +numeral(getPledge(amount, openingSlotPrice)).format('0.00');
        const orderObj = {
            assetName,
            amount,
            openingPrice: openingPriceReal,
            pledge,
            userId,
            type,
            id: uniqid(),
            isClosed: false,
            createdAt: Date.now()
        };
        const isOrderValid = validate(orderObj, orderFieldsValidatorsMap);

        if (!isOrderValid) {
            return res.status(BAD_REQUEST_STATUS_CODE).send({ error: 'Значения не являются допустимыми' });
        }

        return saveOrderQuery(orderObj)
            .then(() => {
                return getOrdersByUserId(userId)
                    .then(orders => {
                        const openOrders = orders.filter(order => !order.isClosed);
                        const closedOrders = orders.filter(order => order.isClosed);

                        res.status(OKEY_STATUS_CODE).send({ openOrders, closedOrders });
                    });
            })
            .catch(() => {
                res.status(SERVER_ERROR_STATUS_CODE).end();
            });
    } catch (e) {
        res.status(SERVER_ERROR_STATUS_CODE).end();
    }
}
