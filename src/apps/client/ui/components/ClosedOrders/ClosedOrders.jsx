import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styles from './ClosedOrders.css';

import ClosedOrder from '../ClosedOrder/ClosedOrder';

import { COMMISSION } from '../../../constants/constants';
import { CHART_SYMBOL_INFO_MAP } from '../../../../../../server/constants/symbols';

import { getProfit, getCommission } from '../../../utils/getAssetValues';
import formatPrice from '../../../utils/formatPrice';

const mapStateToProps = ({ data }) => {
    return {
        closedOrders: data.closedOrders
    };
};

class ClosedOrders extends Component {
    static propTypes = {
        closedOrders: PropTypes.array.isRequired
    };

    state = {
        closedOrders: []
    };

    componentDidMount () {
        this.setState({
            closedOrders: this.getClosedOrders(this.props.closedOrders)
        });
    }

    componentWillReceiveProps (nextProps, nextContext) {
        if (nextProps.closedOrders !== this.props.closedOrders) {
            this.setState({
                closedOrders: this.getClosedOrders(nextProps.closedOrders)
            });
        }
    }

    getClosedOrders = orders => {
        return orders.map(order => {
            const asset = CHART_SYMBOL_INFO_MAP[order.assetName];
            const diffPrice = formatPrice(order.closedPrice - order.openingPrice);
            const profit = getProfit(order.amount, order.openingPrice, order.closedPrice, order.type, asset);
            const commission = getCommission(order.pledge, COMMISSION);

            return ({
                ...order,
                diffPrice,
                profit,
                commission
            });
        });
    };

    render () {
        const {
            closedOrders
        } = this.state;

        return <div className={styles.closePositionInnerContaimer}>
            <div className={styles.footerHeaderTable}>
                <div className={styles.itemNum}>#</div>
                <div className={styles.itemCreateDate}>Дата создания</div>
                <div className={styles.itemCloseDate}>Дата закрытия</div>
                <div className={styles.itemAsset}>Актив</div>
                <div className={styles.itemAmount}>Объем</div>
                <div className={styles.itemPledge}>Залог</div>
                <div className={styles.itemOpeningRate}>Курс открытия</div>
                <div className={styles.itemClosingRate}>Курс закрытия</div>
                <div className={styles.itemProfit}>Прибыль</div>
                <div className={styles.itemCommission}>Комиссия</div>
                <div className={styles.itemClosingDate}>Время закрытия</div>
            </div>
            <div className={styles.footerRowsContainer}>
                {closedOrders && closedOrders
                    .sort((prev, next) => next.closedAt - prev.closedAt)
                    .map((item, i) => <ClosedOrder key={i} item={item} orderIndex={i} />)}
            </div>
        </div>;
    }
}

export default connect(mapStateToProps)(ClosedOrders);
