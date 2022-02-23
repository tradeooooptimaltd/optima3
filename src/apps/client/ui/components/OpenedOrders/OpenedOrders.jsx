import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import styles from './OpenedOrders.css';

import OpenedOrder from '../OpenedOrder/OpenedOrder';

import closeOrder from '../../../services/client/closeOrder';
import getClosedOrders from '../../../services/client/getOrders';
import checkAuthentication from '../../../services/client/checkAuthentication';

import assetPriceWebsocketController from '../../../services/client/assetPriceWebsocket';

const mapDispatchToProps = (dispatch) => ({
    closeOrder: payload => dispatch(closeOrder(payload)),
    checkAuthentication: payload => dispatch(checkAuthentication(payload)),
    getClosedOrders: payload => dispatch(getClosedOrders(payload))
});

class OpenedOrders extends Component {
    static propTypes = {
        closeOrder: PropTypes.func.isRequired,
        getClosedOrders: PropTypes.func.isRequired,
        checkAuthentication: PropTypes.func.isRequired
    };

    state = {
        openOrders: [],
        closeOrderIndex: null,
        isLoading: {}
    };

    componentDidMount () {
        assetPriceWebsocketController.events.on('ordersAndBalance', this.handleOrdersAndBalanceChange);
    }

    handleOrdersAndBalanceChange = ({ balance, orders }) => {
        if (balance <= 0) {
            this.props.getClosedOrders();
            this.props.checkAuthentication();
        }

        this.setState({
            openOrders: orders
        });
    };

    handlerCloseDeal = index => () => {
        this.setState({
            closeOrderIndex: index
        });
    };

    handleConfirmCloseDeal = order => () => {
        this.setState({ isLoading: { ...this.state.isLoading, loading: true, id: order.id } });
        this.props.closeOrder(order.id)
            .then(() => this.setState({ isLoading: { ...this.state.isLoading, loading: false }, closeOrderIndex: null }));
    };

    render () {
        const {
            openOrders,
            closeOrderIndex,
            isLoading
        } = this.state;

        return <div className={styles.openPositionInnerContaimer}>
            <div className={styles.footerHeaderTable}>
                <div className={styles.itemNum}>#</div>
                <div className={styles.itemCreateDate}>Дата создания</div>
                <div className={styles.itemAsset}>Актив</div>
                <div className={styles.itemAmount}>Объем</div>
                <div className={styles.itemPledge}>Залог</div>
                <div className={styles.itemOpeningRate}>Курс открытия</div>
                <div className={styles.itemClosingRate}>Текущий курс</div>
                <div className={styles.itemProfit}>Прибыль</div>
                <div className={styles.itemCommission}>Комиссия</div>
                <div className={styles.itemClosingDate} />
            </div>
            <div className={styles.footerRowsContainer}>
                {openOrders.map((item, i) => {
                    const isConfirmDeal = closeOrderIndex === i;

                    return <OpenedOrder
                        item={item}
                        isLoading={isLoading}
                        isConfirmDeal={isConfirmDeal}
                        orderIndex={i}
                        onClose={this.handlerCloseDeal(i)}
                        onCloseConfirm={this.handleConfirmCloseDeal(item)}
                        onCloseDecline={this.handlerCloseDeal(null)}
                    />;
                })}
            </div>
        </div>;
    }
}

export default connect(undefined, mapDispatchToProps)(OpenedOrders);
