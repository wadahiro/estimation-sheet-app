import * as React from 'react';
import * as M from 'react-mdl';

import { PurchaseDetailItem } from '../selectors';
import { RootState, Column } from '../reducers';
import { toYen, toPercentage } from './Utils';

interface Props {
    columns: Column[];
    purchaseDetailItems?: PurchaseDetailItem[];
}

export class Summary extends React.Component<Props, void> {
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
                style={{ width: '100%' }}
                rows={[sum]}
                >
                {columns.map(x => {
                    return (
                        <M.TableHeader key={x.name} numeric name={x.name} cellFormatter={format(x.type)} >
                            {x.label}
                        </M.TableHeader>
                    );
                })
                }
            </M.DataTable>
        );
    }
}

function format(type: 'yen' | 'rate') {
    switch (type) {
        case 'yen':
            return toYen;
        case 'rate':
            return toPercentage;
    }
}