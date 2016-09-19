import * as React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import CreateIcon from 'material-ui/svg-icons/content/create';

import { Item, ChangeHistory } from '../reducers';
import { CurrencyPair, ExchangeRate } from '../utils/Money';

interface Props {
    history: ChangeHistory<Item>[];
    onClose: () => void;
}

export class ChangeHistoryDialog extends React.Component<Props, void> {
    handleClose = () => {
        this.props.onClose();
    };

    render() {
        const actions = [
            <FlatButton
                label='閉じる'
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleClose}
                />
        ];

        return (
            <Dialog open={true}
                title='変更履歴'
                actions={actions}
                onRequestClose={this.handleClose}
                autoScrollBodyContent={true}
                className='save-dialog'>
                {this.renderList()}
            </Dialog>
        );
    }

    renderList() {
        const { history} = this.props;

        return (
            <div>
                {history.map(x => {
                    return (
                        <List key={x.id}>
                            <Subheader>{x.toDate}</Subheader>
                            {x.diff.map(y => {
                                return (
                                    <ListItem key={`${y.op.op}:${y.op.path}`}
                                        leftAvatar={<CreateIcon />}
                                        primaryText={y.title}
                                        secondaryText={y.subTitle}
                                        secondaryTextLines={1}
                                        />
                                );
                            })}
                        </List>
                    );
                })}
            </div>
        );
    }
}