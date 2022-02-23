import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import propOr from '@tinkoff/utils/object/propOr';

import styles from './Header.css';
import AuthorizationPanel from '../AuthorizationPanel/AuthorizationPanel';
import MenuButton from '../MenuButton/MenuButton';
import ChartLineButton from '../ChartLineButton/ChartLineButton';
import TimingScaleButton from '../TimingScaleButton/TimingScaleButton';
import BuyAndSellComponent from '../BuyAndSellComponent/BuyAndSellComponent';

import setPaymentsPopup from './../../../actions/setPaymentsPopup';

const mapStateToProps = ({ application, data }) => {
    return {
        langMap: application.langMap,
        user: data.user
    };
};

const mapDispatchToProps = (dispatch) => ({
    setPaymentsPopup: (payload) => dispatch(setPaymentsPopup(payload))
});

class Header extends Component {
    static propTypes = {
        langMap: PropTypes.object.isRequired,
        events: PropTypes.object.isRequired,
        user: PropTypes.object,
        setPaymentsPopup: PropTypes.func.isRequired
    }

    static defaultProps = {
        user: {}
    };

    state = {
        time: new Date()
    }

    componentDidMount () {
        setInterval(() => {
            this.setState({ time: new Date() });
        }, 1000);
    }

    handleAccountInfoPopup = () => {
        this.props.setPaymentsPopup(true);
    };

    render () {
        const { time } = this.state;
        const { langMap, events, user } = this.props;
        const text = propOr('header', {}, langMap);

        const CURRENT_TIME = ('0' + time.getHours()).slice(-2) + ':' + ('0' + time.getMinutes()).slice(-2) + ':' + ('0' + time.getSeconds()).slice(-2);

        return <div className={styles.root}>
            <div className={styles.mobileNavBarItems}>
                <MenuButton events={events} />
                <ChartLineButton events={events} />
                <TimingScaleButton events={events} />
            </div>
            <a href="/">
                <img className={styles.logo} src="/src/apps/client/ui/components/Header/images/mainLogo.svg" alt="logo" />
            </a>
            <div className={styles.timeContainer}>
                <img className={styles.timeIcon} src="/src/apps/client/ui/components/Header/images/time.svg" alt="time" />
                <div className={styles.timeInnerContainer}>
                    <div className={styles.time}>
                        {CURRENT_TIME}
                    </div>
                </div>
                <div className={styles.timeFormat}>{text.timeFormat}</div>
            </div>
            {user && <div className={styles.buyAndSellContainer}><BuyAndSellComponent /></div>}
            {user && <div className={styles.depositButton} onClick={this.handleAccountInfoPopup}>
                {text.deposit}
            </div>}
            <AuthorizationPanel />
        </div>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
