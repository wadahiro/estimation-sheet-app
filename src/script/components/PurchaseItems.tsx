import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';

import { PurchaseDetailItem } from '../selectors';
import { RootState, Column, ExchangeRate } from '../reducers';
import { format, formatCurrency, exchangeCurrency } from './Utils';

const style = require('./style.css');

interface Props {
    columns: Column[];
    purchaseDetailItems?: PurchaseDetailItem[];
    onChangeQuantity: (id: string, newQuantity: number) => void;
    onDeleteItem: (id: string) => void;
    exchangeRate: ExchangeRate[];
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

        this.props.onChangeQuantity(item.id, quantity);
    };

    renderAction = (item: PurchaseDetailItem) => {
        return <IconButton onClick={this.deleteItem(item.id)}>
            <Delete />
        </IconButton>;
    };

    deleteItem = (id: string) => (e) => {
        this.props.onDeleteItem(id);
    };

    renderQuantity = (item: PurchaseDetailItem) => {
        return (
            <div className='quantity' style={{ marginLeft: 10 }}>
                <TextField fullWidth value={item.quantity} onChange={this.modifyQuantity(item)} />
            </div>
        );
    };

    renderPrice = (item: PurchaseDetailItem) => {
        if (item.quantity > 1) {
            return <span>{formatCurrency(item.sumPrice.type, item.sumPrice.value)}<br /><span style={{ fontSize: 10 }}>(単価: {formatCurrency(item.price.type, item.price.value)})</span></span>;
        } else {
            return <span>{formatCurrency(item.sumPrice.type, item.sumPrice.value)}</span>;
        }
    };

    renderMultiValues(value: string[]) {
        return (
            <span>
                {value.map(x => <div>{x}</div>)}
            </span>
        );
    }

    render() {
        const { columns, purchaseDetailItems, exchangeRate } = this.props;

        const idColStyle = {
            width: 50
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
                                    <TableHeaderColumn key={x.name} >
                                        {x.label}
                                    </TableHeaderColumn>
                                );
                            })
                            }

                            <TableHeaderColumn>個数/ユーザー数</TableHeaderColumn>
                            <TableHeaderColumn>価格</TableHeaderColumn>
                            <TableHeaderColumn></TableHeaderColumn>
                        </TableRow>
                    </TableHeader>

                    <TableBody displayRowCheckbox={false}>
                        {purchaseDetailItems.map(x => {
                            return (
                                <TableRow key={x.id} selectable={false}>
                                    <TableRowColumn style={idColStyle}>{x.id}</TableRowColumn>
                                    {columns.map(y => {
                                        const value = format(y.type, x[y.name], exchangeRate);

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
                                    <TableRowColumn style={columnStyle}>{this.renderPrice(x)}</TableRowColumn>
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