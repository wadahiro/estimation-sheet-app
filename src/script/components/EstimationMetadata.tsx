import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

interface Props {
    columns: {
        name: string;
        label: string;
    }[];
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

        return (
            <Paper>
                <Table
                    style={{ width: '100%' }}
                    >

                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn colSpan={2} >
                                見積もり情報
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {columns.map(x => {
                            return (
                                <TableRow style={rowStyle}>
                                    <TableRowColumn style={columnStyle}>{x.label}</TableRowColumn>
                                    <TableRowColumn style={columnStyle}>{value[x.name]}</TableRowColumn>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Paper>
        );
    }

}