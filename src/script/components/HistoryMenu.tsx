import * as React from 'react';

import MenuItem from 'material-ui/MenuItem';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import { Option } from '../reducers';

const { Combobox } = require('react-input-enhancements');

interface Props {
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
        const { history } = this.props;

        return (
            <div>
                {history.concat().reverse().map(x => {
                    return (
                        <Card>
                            <CardHeader
                                title={<a href='#' onClick={this.handleClick(x.date)}>{x.date}</a>}
                                subtitle={x.estimationMetadata['title']}
                                actAsExpander={true}
                                showExpandableButton={true}
                                />
                            <CardText expandable={true}>
                                <div>{x.estimationMetadata['customerName']}</div>
                            </CardText>
                        </Card>
                    );
                })}
            </div>
        );
    }

}