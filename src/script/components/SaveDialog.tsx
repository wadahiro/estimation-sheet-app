import * as React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { PurchaseDetailItem } from '../selectors';
import { RootState, Column } from '../reducers';
import { format } from './Utils';

const { Combobox } = require('react-input-enhancements');

interface Props {
    columns: Column[];
    value: {
        [index: string]: string;
    };
    onChange: (name: string, value: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export class SaveDialog extends React.Component<Props, void> {
    handleSave = () => {
        this.props.onClose();
        this.props.onSave();
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleChange = (name: string) => (e) => {
        this.props.onChange(name, e.target.value);
    };

    handleValueChange = (name: string) => (value: string) => {
        this.props.onChange(name, value);
    };

    render() {
        const actions = [
            <FlatButton
                label='キャンセル'
                primary={true}
                onTouchTap={this.handleClose}
                />,
            <FlatButton
                label='保存'
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleSave}
                />,
        ];

        return (
            <Dialog open={true}
                title='概算見積もりの保存'
                actions={actions}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                className='save-dialog'>
                {this.renderColumns()}
            </Dialog>
        );
    }

    renderColumns() {
        const { columns, value } = this.props;
        const style = {

        }

        return columns.map(x => {
            if (x.options) {
                return (
                    <div>
                        <Combobox
                            defaultValue={value[x.name]}
                            options={x.options}
                            dropdownProps={{ style: { width: '100%' } }}
                            onValueChange={this.handleValueChange(x.name)}
                            onChange={this.handleChange(x.name)}
                            style={style}
                            >
                            {inputProps => {
                                return <TextField
                                    {...inputProps}
                                    className='select-item'
                                    style={{ width: '100%' }}
                                    hintText='選択してください'
                                    />;
                            } }
                        </Combobox>
                    </div>
                );
            }
            return (
                <div>
                    <TextField hintText={x.label} value={value[x.name]} onChange={this.handleChange(x.name)} style={style} />
                </div>
            );
        });
    }
}

function calcCost(item: PurchaseDetailItem) {
    if (item.suppliersPrice === 0) {
        return item.price / 4;
    } else {
        return item.suppliersPrice;
    }
}