import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import getSchema from './transactionFormSchema';
import saveTransaction from '../../../services/saveTransaction';
import editTransaction from '../../../services/editTransaction';

import Form from '../Form/Form';

import noop from '@tinkoff/utils/function/noop';
import prop from '@tinkoff/utils/object/prop';
import pick from '@tinkoff/utils/object/pick';
import uniqid from 'uniqid';

const TRANSACTIONS_VALUES = ['userId', 'id'];

const mapDispatchToProps = (dispatch) => ({
    saveTransaction: payload => dispatch(saveTransaction(payload)),
    editTransaction: payload => dispatch(editTransaction(payload))
});

class TransactionForm extends Component {
    static propTypes = {
        saveTransaction: PropTypes.func.isRequired,
        editTransaction: PropTypes.func.isRequired,
        onDone: PropTypes.func,
        transaction: PropTypes.object,
        users: PropTypes.array,
        activeUser: PropTypes.object
    };

    static defaultProps = {
        onDone: noop,
        transaction: {},
        users: [],
        activeUser: {}
    };

    constructor (props) {
        super(props);

        const { transaction, activeUser } = this.props;
        this.dirName = transaction.dirName || uniqid();

        this.initialValues = {
            value: transaction.value || '',
            content: transaction.content || '',
            userId: activeUser.id,
            ...pick(TRANSACTIONS_VALUES, transaction)
        };
        this.id = prop('id', transaction);
        this.state = {
            activeUser: activeUser
        };
    }

    getTransactionPayload = (
        {
            value,
            content
        }) => {
        const { activeUser } = this.props;
        return {
            dirName: this.dirName,
            value,
            content,
            userId: activeUser.id
        };
    };

    handleSubmit = values => {
        const transactionPayload = this.getTransactionPayload(values);
        const { editTransaction, saveTransaction, onDone, activeUser } = this.props;

        (this.id ? editTransaction({ transaction: { ...transactionPayload, id: this.id }, user: activeUser }) : saveTransaction(transactionPayload))
            .then(() => {
                onDone();
            });
    };

    handleChange = (values, changes) => {
        switch (Object.keys(changes)[0]) {
        case 'userId':
            const activeUser = this.props.users.find(user => user.id === changes.userId);
            const { lang } = this.state;

            values.transactionId = activeUser.texts[lang].transaction[0].id;
            break;
        }
    };

    render () {
        return <Form
            initialValues={this.initialValues}
            schema={getSchema({
                data: {
                    title: this.id ? 'Редактирование транзакции' : 'Добавление транзакции',
                    dirName: this.dirName
                }
            })}
            onChange={this.handleChange}
            onSubmit={this.handleSubmit}
        />;
    }
}

export default connect(null, mapDispatchToProps)(TransactionForm);
