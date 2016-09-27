import * as React from 'react';

import Paper from 'material-ui/Paper';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import CreateIcon from 'material-ui/svg-icons/content/create';

interface Column {
    name: string;
    label: string;
}

interface Props {
    columns: Column[];
    value: {
        [index: string]: string;
    };
    onEdit: (e: any) => void;
}

export class EstimationMetadata extends React.Component<Props, void> {
    render() {
        const { columns, value } = this.props;

        const rowStyle = {
            height: 25
        };
        const columnStyle = {
            height: 30,
            whiteSpace: 'normal'
        };
        const iconColumnStyle = {
            height: 20,
            textAlign: 'right',
            paddingRight: 10
        };
        const iconButtonStyle = {
            height: 20,
            width: 20,
            padding: 0
        };
        const iconStyle = {
            height: 20,
            width: 20,
            padding: 0
        };

        const colSize = 6;
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
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn colSpan={colSize - 1} style={columnStyle}>
                                見積もり情報
                            </TableHeaderColumn>
                            <TableHeaderColumn style={iconColumnStyle}>
                                <IconButton style={iconButtonStyle} iconStyle={iconStyle} onClick={this.props.onEdit}>
                                    <CreateIcon />
                                </IconButton>
                            </TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {data.map(row => {
                            return (
                                <TableRow key={row[0].name} selectable={false} style={rowStyle}>
                                    {row.map(x => {
                                        if (x.type === 'label') {
                                            return (
                                                <TableHeaderColumn key={x.name} style={columnStyle}>{x.value}</TableHeaderColumn>
                                            );
                                        } else {
                                            return (
                                                <TableRowColumn key={x.name} style={columnStyle}>{x.value}</TableRowColumn>
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