import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';

import { RootState, Column, PurchaseDetailItem, CostItem } from '../reducers';
import { ExchangeRate } from '../utils/Money';
import { format, formatCurrency } from './Utils';

const style = require('./style.css');

interface Props {
    costItems?: CostItem[];
    exchangeRate: ExchangeRate[];
}

export class CostItems extends React.Component<Props, void> {

    renderPrice = (item: CostItem) => {
        const { exchangeRate } = this.props;

        const price = formatCurrency(item.price, exchangeRate);

        return this.renderMultiValues(price);
    };

    renderMultiValues(value: string[], label = '') {
        return (
            <span>
                {label}{value.map(x => <div>{x}</div>)}
            </span>
        );
    }

    render() {
        const { costItems, exchangeRate } = this.props;

        const idColStyle = {
            width: 30,
            whiteSpace: 'normal'
        };
        const priceColStyle = {
            width: 200,
            whiteSpace: 'normal'
        };
        const columnStyle = {
            whiteSpace: 'normal'
        };

        return (
            <Paper zDepth={2} >
                <Table
                    style={{ width: '100%', tableLayout: 'fixed' }}
                    fixedHeader={true}
                    >
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn style={columnStyle}>説明</TableHeaderColumn>
                            <TableHeaderColumn style={priceColStyle}>価格</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>

                    <TableBody displayRowCheckbox={false}>
                        {costItems.map(x => {
                            return (
                                <TableRow key={x.id} selectable={false}>
                                    <TableRowColumn style={columnStyle}>{x.name}</TableRowColumn>
                                    <TableRowColumn style={priceColStyle}>{this.renderPrice(x)}</TableRowColumn>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}