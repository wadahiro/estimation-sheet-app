import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';

import { ExchangeRate } from '../reducers';
import { CurrencyType } from '../utils/Money';

interface Props {
    value: ExchangeRate[];
    onChangeRate: (type: CurrencyType, rate: number) => void;
    showExchangeRate: CurrencyType[];
}

export class ExchangeRateBox extends React.Component<Props, void> {
    handleChangeRate = (type: CurrencyType) => (e) => {
        const rate = Number(e.target.value);
        if (Number.isNaN(rate)) {
            return;
        }
        this.props.onChangeRate(type, rate);
    };

    render() {
        const { value, showExchangeRate } = this.props;

        const rowStyle = {
            height: 25
        };
        const columnStyle = {
            height: 20,
            whiteSpace: 'normal'
        };

        if (showExchangeRate.length === 0) {
            return <div />;
        }

        return (
            <Paper>
                <Table style={{ width: '100%' }}>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn colSpan={2} >
                                為替レート
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {value.filter(x => showExchangeRate.find(y => y === x.type) !== undefined).map(x => {
                            return (
                                <TableRow selectable={false} style={rowStyle}>
                                    <TableRowColumn style={columnStyle}>{x.type}</TableRowColumn>
                                    <TableRowColumn style={columnStyle}>
                                        <TextField fullWidth value={x.rate} onChange={this.handleChangeRate(x.type)} />
                                    </TableRowColumn>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}
