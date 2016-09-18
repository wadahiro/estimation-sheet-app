import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import { RootState, Column, ExchangeRate, PurchaseDetailItem, CostItem } from '../reducers';
import { Money } from '../utils/Money';
import { format, exchangeCurrency } from './Utils';

interface Props {
    columns: Column[];
    purchaseDetailItems?: PurchaseDetailItem[];
    costItems?: CostItem[];
    exchangeRate: ExchangeRate[];
}

export class Summary extends React.Component<Props, void> {
    render() {
        const { columns, purchaseDetailItems, costItems, exchangeRate } = this.props;

        // calc sum
        const cost1 = purchaseDetailItems.reduce((s, x) => { s += exchangeCurrency(exchangeRate, x.sumCost).amount; return s; }, 0);
        const cost2 = costItems.reduce((s, x) => { s += exchangeCurrency(exchangeRate, x.supplierPrice).amount; return s; }, 0);
        const cost = new Money(cost1 + cost2, Money.JPY);

        const receipt1 = purchaseDetailItems.reduce((s, x) => { s += exchangeCurrency(exchangeRate, x.sumPrice).amount; return s; }, 0);
        const receipt2 = costItems.reduce((s, x) => { s += exchangeCurrency(exchangeRate, x.price).amount; return s; }, 0);

        const receipt = receipt1 + receipt2;
        const sum = {
            cost,
            receipt,
            profitRate: (receipt - cost.amount) / receipt
        }

        const columnStyle = {
            whiteSpace: 'normal'
        };

        return (
            <Paper>
                <Table
                    style={{ width: '100%' }}
                    >

                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            {columns.map(x => {
                                return (
                                    <TableHeaderColumn key={x.name} >
                                        {x.label}
                                    </TableHeaderColumn>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        <TableRow selectable={false}>
                            {columns.map(x => {
                                const value = format(x.type, sum[x.name], exchangeRate);
                                return (
                                    <TableRowColumn key={x.name} style={columnStyle}>
                                        {value}
                                    </TableRowColumn>
                                );
                            })}
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}
