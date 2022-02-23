import React, { Component } from 'react';
import PropTypes from 'prop-types';

import uniqid from 'uniqid';

import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import ReorderIcon from '@material-ui/icons/Reorder';
import FormGroup from '@material-ui/core/FormGroup';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';

import DeleteIcon from '@material-ui/icons/Delete';
import { withStyles } from '@material-ui/core/styles';

import remove from '@tinkoff/utils/array/remove';
import noop from '@tinkoff/utils/function/noop';
import arrayMove from '../../../../../utils/arrayMove';

const materialStyles = {
    feature: {
        flexWrap: 'nowrap',
        alignItems: 'center',
        zIndex: 9999
    },
    features: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '210px'
    },
    featureGroup: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
    },
    featureDelButton: {
        position: 'relative',
        top: '4px'
    },
    buttonSortable: {
        position: 'relative',
        top: '4px',
        marginRight: '12px',
        cursor: 'pointer'
    },
    addButton: {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: '80px'
    }
};

const ButtonSortable = SortableHandle(({ imageClassName }) => (
    <ReorderIcon className={imageClassName}/>
));

const Feature = SortableElement(({ index, feature, validationMessage, handleFeatureDelete, handleFeatureChange, classes, schema }) => (
    <FormGroup className={classes.feature} row>
        <ButtonSortable imageClassName={classes.buttonSortable}/>
        <div className={classes.featureGroup}>
            <TextField
                label={schema.name}
                value={feature || ''}
                onChange={handleFeatureChange(index)}
                margin='normal'
                variant='outlined'
                error={!!validationMessage}
                required
                fullWidth
                size={schema.size}
            />
        </div>
        <IconButton aria-label='Delete' className={classes.featureDelButton} onClick={handleFeatureDelete(index)}>
            <DeleteIcon/>
        </IconButton>
    </FormGroup>
));

const Features = SortableContainer(({ features, classes, ...rest }) =>
    <div>
        {features.map((feature, i) => {
            return <Feature key={i} index={i} feature={feature.name} {...rest} classes={classes}/>;
        })}
    </div>
);

class FormFieldFeaturesSingular extends Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
        value: PropTypes.array,
        onChange: PropTypes.func,
        validationMessage: PropTypes.string,
        schema: PropTypes.object
    };

    static defaultProps = {
        value: [],
        onChange: noop,
        validationMessage: '',
        schema: {}
    };

    handleFeatureAdd = () => {
        const { value } = this.props;

        this.props.onChange([
            ...value,
            {
                name: '',
                id: uniqid()
            }
        ]);
    };

    handleFeatureChange = i => event => {
        const { value } = this.props;

        value[i] = { ...value[i], name: event.target.value, id: uniqid() };

        this.props.onChange(value);
    };

    handleFeatureDelete = i => () => {
        const { value } = this.props;

        this.props.onChange(remove(i, 1, value));
    };

    onDragEnd = ({ oldIndex, newIndex }) => {
        const newValues = arrayMove(this.props.value, oldIndex, newIndex);

        this.props.onChange(newValues);
    };

    render () {
        const { classes, value, validationMessage, schema } = this.props;

        return <div>
            <Features
                axis='xy'
                features={value}
                handleFeatureDelete={this.handleFeatureDelete}
                handleFeatureChange={this.handleFeatureChange}
                onSortEnd={this.onDragEnd}
                classes={classes}
                useDragHandle
                validationMessage={validationMessage}
                schema={schema}
            />
            <div className={classes.addButton}>
                <Fab color='primary' size='small' onClick={this.handleFeatureAdd}>
                    <AddIcon/>
                </Fab>
            </div>
        </div>;
    }
}

export default withStyles(materialStyles)(FormFieldFeaturesSingular);
