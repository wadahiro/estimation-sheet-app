import * as React from 'react';
import * as M from 'react-mdl';

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

    editableQuantity = (value, item: PurchaseDetailItem) => {
        return <div className='quantity' style={{ marginLeft: 10 }}>
            <M.Textfield label='' value={value} type='number' onChange={this.modifyQuantity(item)} />
        </div>;
    };

    modifyQuantity = (item: PurchaseDetailItem) => (e) => {
        const quantity = Number(e.target.value);
        this.props.onChangeQuantity(item.id, quantity);
    };

    renderAction = (value, item: PurchaseDetailItem) => {
        return <M.Button raised accent ripple onClick={this.deleteItem(item.id)}>削除</M.Button>;
    };

    deleteItem = (id: string) => (e) => {
        this.props.onDeleteItem(id);
    };

    renderPrice = (value: number, item: PurchaseDetailItem) => {
        if (item.quantity > 1) {
            const sum = value * item.quantity;
            return <span>{toYen(sum)}<br /><span style={{ fontSize: 10 }}>(単価: {toYen(value)})</span></span>;
        } else {
            return <span>{toYen(value)}</span>;
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

        return (
            <M.DataTable
                style={{ width: '100%', tableLayout: 'fixed' }}
                shadow={0}
                rowKeyColumn='id'
                rows={purchaseDetailItems}
                >
                <M.TableHeader name='displayId' style={{ width: 50 }}>#</M.TableHeader>

                {columns.map(x => {
                    return (
                        <M.TableHeader key={x.name} numeric name={x.name} cellFormatter={format(x.type)} >
                            {x.label}
                        </M.TableHeader>
                    );
                })
                }

                <M.TableHeader numeric name='quantity' cellFormatter={this.editableQuantity}>個数</M.TableHeader>
                <M.TableHeader numeric name='price' cellFormatter={this.renderPrice} tooltip='価格'>価格</M.TableHeader>
                <M.TableHeader numeric name='action' cellFormatter={this.renderAction}></M.TableHeader>
            </M.DataTable>
        );
    }
}