import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';

import { RootState, Column, PurchaseDetailItem } from '../reducers';
import { ExchangeRate, CurrencyType } from '../utils/Money';
import { format, formatCurrency } from './Utils';

const style = require('./style.css');

interface Props {
    columns: Column[];
    purchaseDetailItems?: PurchaseDetailItem[];
    onChangeQuantity: (itemId: string, newQuantity: number) => void;
    onDeleteItem: (itemId: string) => void;
    exchangeRate: ExchangeRate[];
    mainCurrency: CurrencyType;
}

export class PurchaseItems extends React.Component<Props, void> {

    modifyQuantity = (item: PurchaseDetailItem) => (e) => {
        const value = e.target.value.replace(/[０-９]/g, str => {
            return String.fromCharCode(str.charCodeAt(0) - 0xFEE0);
        });

        let quantity;
        if (e.target.value === '') {
            quantity = 0;
        } else {
            quantity = Number(value);
        }

        if (Number.isNaN(quantity)) {
            return;
        }

        this.props.onChangeQuantity(item.itemId, quantity);
    };

    renderAction = (item: PurchaseDetailItem) => {
        return <IconButton onClick={this.deleteItem(item.itemId)}>
            <Delete />
        </IconButton>;
    };

    deleteItem = (itemId: string) => (e) => {
        this.props.onDeleteItem(itemId);
    };

    renderQuantity = (item: PurchaseDetailItem) => {
        return (
            <div className='quantity' style={{ marginLeft: 10 }}>
                <TextField fullWidth value={item.quantity} onChange={this.modifyQuantity(item)} />
            </div>
        );
    };

    renderPrice = (item: PurchaseDetailItem) => {
        const { exchangeRate, mainCurrency } = this.props;

        const sumPrice = formatCurrency(item.sumPrice, exchangeRate, mainCurrency);
        const price = formatCurrency(item.price, exchangeRate, mainCurrency, 3);

        if (item.quantity > 1) {
            return <span>
                {this.renderMultiValues(sumPrice)}
                <span style={{ fontSize: 10 }}>
                    {this.renderMultiValues(price, '単価：')}
                </span>
            </span>;

        } else {
            return this.renderMultiValues(sumPrice);
        }
    };

    renderMultiValues(value: string[], label = '') {
        return (
            <span>
                {label}{value.map(x => <div>{x}</div>)}
            </span>
        );
    }

    render() {
        const { columns, purchaseDetailItems, exchangeRate } = this.props;

        const idColStyle = {
            width: 30,
            whiteSpace: 'normal'
        };
        const priceColStyle = {
            width: 100,
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
                            <TableHeaderColumn style={idColStyle}>#</TableHeaderColumn>

                            {columns.map(x => {
                                return (
                                    <TableHeaderColumn key={x.name} style={columnStyle}>
                                        {x.label}
                                    </TableHeaderColumn>
                                );
                            })
                            }

                            <TableHeaderColumn style={columnStyle}>個数/ユーザー数</TableHeaderColumn>
                            <TableHeaderColumn style={priceColStyle}>価格</TableHeaderColumn>
                            <TableHeaderColumn style={columnStyle}></TableHeaderColumn>
                        </TableRow>
                    </TableHeader>

                    <TableBody displayRowCheckbox={false}>
                        {purchaseDetailItems.map(x => {
                            return (
                                <TableRow key={x.id} selectable={false}>
                                    <TableRowColumn style={idColStyle}>{x.id}</TableRowColumn>
                                    {columns.map(y => {
                                        const value = format(y.type, x[y.name], exchangeRate, y.decimalPlace);

                                        if (Array.isArray(value)) {
                                            return (
                                                <TableRowColumn key={y.name} style={columnStyle}>{this.renderMultiValues(value)}</TableRowColumn>
                                            );
                                        }

                                        return (
                                            <TableRowColumn key={y.name} style={columnStyle}>{value}</TableRowColumn>
                                        );
                                    })}

                                    <TableRowColumn style={columnStyle}>{this.renderQuantity(x)}</TableRowColumn>
                                    <TableRowColumn style={priceColStyle}>{this.renderPrice(x)}</TableRowColumn>
                                    <TableRowColumn>{this.renderAction(x)}</TableRowColumn>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }
}