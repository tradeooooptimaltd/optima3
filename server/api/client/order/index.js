import express from 'express';

import verification from '../../../middlewares/verificationClient';

import saveOrder from './services/saveOrder';
import closeOrder from './services/closeOrder';
import getOrders from './services/getOrders';

const router = express.Router();

router.use(verification);

router.route('/new')
    .post(saveOrder);

router.route('/all')
    .get(getOrders);

router.route('/close/:id')
    .get(closeOrder);

export default router;
