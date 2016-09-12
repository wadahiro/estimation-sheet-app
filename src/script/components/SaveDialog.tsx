import * as React from 'react';
import * as M from 'react-mdl';

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
    handleSave = (e) => {
        e.preventDefault();
        this.props.onClose();
        this.props.onSave();
    };

    handleCloseDialog = (e) => {
        e.preventDefault();
        this.props.onClose();
    };

    handleChange = (name: string) => (e) => {
        this.props.onChange(name, e.target.value);
    };

    handleValueChange = (name: string) => (value: string) => {
        this.props.onChange(name, value);
    };

    render() {
        return (
            <M.Dialog open={true} onCancel={this.handleCloseDialog} className='save-dialog'>
                <M.DialogActions>
                    <M.Button type='button' onClick={this.props.onSave}>保存</M.Button>
                    <M.Button type='button' onClick={this.handleCloseDialog}>閉じる</M.Button>
                </M.DialogActions>
                <M.DialogContent>
                    {this.renderColumns()}
                </M.DialogContent>
                <M.DialogActions>
                    <M.Button type='button' onClick={this.props.onSave}>保存</M.Button>
                    <M.Button type='button' onClick={this.handleCloseDialog}>閉じる</M.Button>
                </M.DialogActions>
            </M.Dialog>
        );
    }

    renderColumns() {
        const { columns, value } = this.props;
        const style = {

        }

        return columns.map(x => {
            if (x.options) {
                return (
                    <Combobox
                        defaultValue={value[x.name]}
                        options={x.options}
                        dropdownProps={{ style: { width: '100%' } }}
                        onValueChange={this.handleValueChange(x.name)}
                        onChange={this.handleChange(x.name)}
                        style={style}
                        >
                        {inputProps => {
                            return <M.Textfield
                                {...inputProps}
                                className='select-item'
                                label=''
                                style={{ width: '100%' }}
                                placeholder='選択してください'
                                />
                        } }
                    </Combobox>
                );
            }
            return <M.Textfield label={x.label} value={value[x.name]} onChange={this.handleChange(x.name)} style={style} />;
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