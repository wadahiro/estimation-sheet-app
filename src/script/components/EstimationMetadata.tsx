import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

interface Column {
    name: string;
    label: string;
}

interface Props {
    columns: Column[];
    value: {
        [index: string]: string;
    };
}

export class EstimationMetadata extends React.Component<Props, void> {
    render() {
        const { columns, value } = this.props;

        const rowStyle = {
            height: 25
        };
        const columnStyle = {
            height: 20,
            whiteSpace: 'normal'
        };

        const colSize = 4;
        const data = columns.reduce<{ name: string, value: string, type: string }[]>((s, x, index) => {
            const labelData = { name: x.name, value: x.label, type: 'label' };
            const valueData = { name: x.name, value: value[x.name], type: 'value' };

            s.push(labelData);
            s.push(valueData);

            return s;
        }, [])
            .reduce<{ name: string, value: string, type: string }[][]>((s, x) => {
                const last = s[s.length - 1];
                if (last.length < colSize) {
                    last.push(x);
                } else {
                    s.push([x]);
                }
                return s;
            }, [[]]);

        return (
            <Paper>
                <Table>
                    <TableBody displayRowCheckbox={false}>
                        {data.map(row => {
                            return (
                                <TableRow selectable={false} style={rowStyle}>
                                    {row.map(x => {
                                        if (x.type === 'label') {
                                            return (
                                                <TableHeaderColumn style={columnStyle}>{x.value}</TableHeaderColumn>
                                            );
                                        } else {
                                            return (
                                                <TableRowColumn style={columnStyle}>{x.value}</TableRowColumn>
                                            );
                                        }
                                    })
                                    }
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

}