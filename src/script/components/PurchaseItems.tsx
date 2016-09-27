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
    exchangeRate: ExchangeRate;
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
        const { exchangeRate } = this.props;

        const sumPrice = formatCurrency(item.sumPrice, exchangeRate);
        const price = formatCurrency(item.price, exchangeRate, 3);

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

        const itemColumns = columns.filter(x => x.type !== 'text');
        const textColumns = columns.filter(x => x.type === 'text');

        return (
            <Paper zDepth={2} >
                <Table
                    style={{ width: '100%', tableLayout: 'fixed' }}
                    fixedHeader={true}
                    >
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn style={idColStyle}>#</TableHeaderColumn>

                            {itemColumns.map(x => {
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
                            if (textColumns.length === 0) {
                                return this.renderRow(itemColumns, x, idColStyle, columnStyle, priceColStyle);
                            } else {
                                return this.renderMultiRow(itemColumns, textColumns, x, idColStyle, columnStyle, priceColStyle);
                            }
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

    renderRow(itemColumns: Column[], x: PurchaseDetailItem, idColStyle, columnStyle, priceColStyle) {
        const { exchangeRate } = this.props;

        return (
            <TableRow key={x.id} selectable={false}>
                <TableRowColumn style={idColStyle}>{x.id}</TableRowColumn>
                {itemColumns.map(y => {
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
    }

    renderMultiRow(itemColumns: Column[], textColumns: Column[], x: PurchaseDetailItem, idColStyle, columnStyle, priceColStyle) {
        const { exchangeRate } = this.props;

        return [
            this.renderRow(itemColumns, x, idColStyle, columnStyle, priceColStyle),

            <TableRow key={`${x.id}_text`} selectable={false}>
                <TableRowColumn style={columnStyle}></TableRowColumn>
                <TableRowColumn style={columnStyle} colSpan={itemColumns.length + 3}>
                    {textColumns.map(textCol => {
                        const value = format(textCol.type, x[textCol.name], exchangeRate, textCol.decimalPlace);
                        if (value === undefined || value === '') {
                            return null;
                        } else {
                            return (
                                <div key={textCol.name}>
                                    <h3>{textCol.label}</h3>
                                    <p>{value}</p>
                                </div>
                            );
                        }
                    })
                    }
                </TableRowColumn>
            </TableRow>
        ];
    }
}