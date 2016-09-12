import * as React from 'react';
import * as M from 'react-mdl';

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

        // https://github.com/google/material-design-lite/issues/1246
        const d = document.querySelector('.mdl-layout');
        d['MaterialLayout'].toggleDrawer();
    };

    render() {
        const { history } = this.props;

        return (
            <M.Navigation>
                {history.concat().reverse().map(x => {
                    return <div>
                        <a href='#' onClick={this.handleClick(x.date)}>{x.date}</a>
                        <div>{x.estimationMetadata['customerName']}</div>
                        <div>{x.estimationMetadata['title']}</div>
                    </div>;
                })}
            </M.Navigation>
        );
    }

}