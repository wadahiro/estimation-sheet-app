import * as React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import { RootState, Column, PurchaseDetailItem } from '../reducers';
import { format } from './Utils';

const { Combobox } = require('react-input-enhancements');

interface Props {
    columns: Column[];
    defaultValue: Metadata;
    onSave: (data: Metadata) => void;
    onClose: () => void;
}

interface Metadata {
    [index: string]: string;
}

interface State {
    value: Metadata;
}

export class EditEstimationMetadataDialog extends React.Component<Props, State> {
    state = {
        value: this.props.defaultValue
    };

    handleSave = () => {
        this.props.onClose();
        this.props.onSave(this.state.value);
    };

    handleClose = () => {
        this.props.onClose();
    };

    handleChange = (name: string) => (e) => {
        this.setState({
            value: Object.assign({}, this.state.value, {
                [name]: e.target.value
            })
        });
    };

    handleValueChange = (name: string) => (value: string) => {
        this.setState({
            value: Object.assign({}, this.state.value, {
                [name]: value
            })
        });
    };

    render() {
        const actions = [
            <FlatButton
                label='キャンセル'
                primary={true}
                onTouchTap={this.handleClose}
                />,
            <FlatButton
                label='設定'
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleSave}
                />
        ];

        return (
            <Dialog open={true}
                title='見積もり情報の編集'
                actions={actions}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                className='save-dialog'>
                {this.renderColumns()}
            </Dialog>
        );
    }

    renderColumns() {
        const { columns } = this.props;
        const { value } = this.state;

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