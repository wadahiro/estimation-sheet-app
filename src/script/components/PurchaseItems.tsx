import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';

import { PurchaseDetailItem } from '../selectors';
import { RootState, Column } from '../reducers';
import { format, toYen, toPercentage } from './Utils';

interface Props {
    columns: Column[];
    purchaseDetailItems?: PurchaseDetailItem[];
    onChangeQuantity: (id: string, newQuantity: number) => void;
    onDeleteItem: (id: string) => void;
}

export class PurchaseItems extends React.Component<Props, void> {

    modifyQuantity = (item: PurchaseDetailItem) => (e) => {
        const value = e.target.value.replace(/[０-９]/g, str => {
            return String.fromCharCode(str.charCodeAt(0) - 0xFEE0);
        });

        const quantity = Number(value);
        if (isNaN(quantity) || e.target.value === '') {
            return;
        }

        this.props.onChangeQuantity(item.id, quantity);
    };

    renderAction = (item: PurchaseDetailItem) => {
        return <IconButton iconClassName='muidocs-icon-delete' onClick={this.deleteItem(item.id)} />;
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
            const sum = item.price * item.quantity;
            return <span>{toYen(sum)}<br /><span style={{ fontSize: 10 }}>(単価: {toYen(item.price)})</span></span>;
        } else {
            return <span>{toYen(item.price)}</span>;
        }
    };

    render() {
        const { columns, purchaseDetailItems } = this.props;

        // calc sum
        const cost = purchaseDetailItems.reduce((s, x) => { s += (x.cost * (x.quantity || 0)); return s; }, 0);
        const receipt = purchaseDetailItems.reduce((s, x) => { s += (x.price * (x.quantity || 0)); return s; }, 0);
        const sum = {
            cost,
            receipt,
            profitRate: (receipt - cost) / receipt
        }

        const idColStyle = {
            width: 50
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
                                        const value = format(y.type, x[y.name]);

                                        return (
                                            <TableRowColumn key={y.name} style={{ whiteSpace: 'normal' }}>{value}</TableRowColumn>
                                        );
                                    })}

                                    <TableRowColumn>{this.renderQuantity(x)}</TableRowColumn>
                                    <TableRowColumn>{this.renderPrice(x)}</TableRowColumn>
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