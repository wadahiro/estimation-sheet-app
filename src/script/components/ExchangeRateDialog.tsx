import * as React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';

import { CurrencyPair, ExchangeRate } from '../utils/Money';

interface Props {
    exchangeRate: ExchangeRate;
    onChangeRate: (type: CurrencyPair, rate: number) => void;
    showExchangeRate: CurrencyPair[];
    onClose: () => void;
}

export class ExchangeRateDialog extends React.Component<Props, void> {
    handleClose = () => {
        this.props.onClose();
    };

    handleChangeRate = (type: CurrencyPair) => (e) => {
        const rate = Number(e.target.value);
        if (Number.isNaN(rate)) {
            return;
        }
        this.props.onChangeRate(type, rate);
    };

    render() {
        const actions = [
            <FlatButton
                label='閉じる'
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleClose}
                />
        ];

        return (
            <Dialog open={true}
                title='為替レート設定'
                actions={actions}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                className='save-dialog'>
                {this.renderColumns()}
            </Dialog>
        );
    }

    renderColumns() {
        const { exchangeRate, showExchangeRate } = this.props;

        return exchangeRate.pairs
            .filter(x => showExchangeRate.find(y => y === x.pair) !== undefined)
            .map(x => {
                return (
                    <div>
                        <TextField floatingLabelText={x.pair} value={x.rate} onChange={this.handleChangeRate(x.pair)} />
                    </div>
                );
            });
    }
}