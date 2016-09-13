import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

import { PurchaseDetailItem } from '../selectors';
import { RootState, Column } from '../reducers';
import { format } from './Utils';

interface Props {
    columns: Column[];
    purchaseDetailItems?: PurchaseDetailItem[];
}

export class Summary extends React.Component<Props, void> {
    render() {
        const { columns, purchaseDetailItems } = this.props;

        // calc sum
        const cost = purchaseDetailItems.reduce((s, x) => { s += (calcCost(x) * (x.quantity)); return s; }, 0);
        const receipt = purchaseDetailItems.reduce((s, x) => { s += (x.price * (x.quantity)); return s; }, 0);
        const sum = {
            cost,
            receipt,
            profitRate: (receipt - cost) / receipt
        }

        const columnStyle = {
            height: 20,
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
                        <TableRow >
                            {columns.map(x => {
                                const value = format(x.type, sum[x.name]);
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

function calcCost(item: PurchaseDetailItem) {
    if (item.suppliersPrice === 0 || item.suppliersPrice === undefined) {
        return item.price / 4;
    } else {
        return item.suppliersPrice;
    }
}