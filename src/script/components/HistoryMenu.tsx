import * as React from 'react';

import MenuItem from 'material-ui/MenuItem';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import { Option } from '../reducers';

const { Combobox } = require('react-input-enhancements');

interface Props {
    columns: {
        name: string;
        label: string;
    }[];
    history: {
        date: string;
        estimationMetadata: {
            [index: string]: string;
        };
    }[];
    goto: (date: string) => void;
}

export class HistoryMenu extends React.Component<Props, void> {

    handleClick = (date: string) => (e) => {
        e.preventDefault();
        this.props.goto(date);
    };

    render() {
        const { columns, history } = this.props;

        const rowStyle = {
            height: 25
        };
        const columnStyle = {
            height: 20,
            whiteSpace: 'normal'
        };

        return (
            <div>
                {history.concat().reverse().map(x => {
                    return (
                        <Card>
                            <CardHeader
                                title={<a href='#' onClick={this.handleClick(x.date)}>{x.date}</a>}
                                subtitle={`${x.estimationMetadata['customerName'] || ''} : ${x.estimationMetadata['title'] || ''}`}
                                actAsExpander={true}
                                showExpandableButton={true}
                                />
                            <CardText expandable={true}>
                                <Table>
                                    <TableBody displayRowCheckbox={false}>
                                        {columns.map(y => {
                                            return (
                                                <TableRow style={rowStyle}>
                                                    <TableRowColumn style={columnStyle}>{y.label}</TableRowColumn>
                                                    <TableRowColumn style={columnStyle}>{x.estimationMetadata[y.name]}</TableRowColumn>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </CardText>
                        </Card>
                    );
                })}
            </div>
        );
    }

}