import * as React from 'react';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import CreateIcon from 'material-ui/svg-icons/content/create';

import { Item, Column, ChangeHistory, PatchOperation } from '../reducers';
import { CurrencyPair, ExchangeRate } from '../utils/Money';

const jsonpointer = require('jsonpointer');

interface Props {
    columns: Column[];
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
        const { columns, history} = this.props;

        return (
            <div>
                {history.map(x => {
                    return (
                        <List key={x.id}>
                            <Subheader>{x.toDate}</Subheader>
                            {x.diff.map(y => {
                                const [title, message] = toMessage(columns, y);

                                return (
                                    <ListItem key={`${y.op}:${y.path}`}
                                        leftAvatar={<CreateIcon />}
                                        primaryText={title}
                                        secondaryText={message}
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

function toMessage(columns: Column[], diff: PatchOperation<Item>): [string, string] {
    const opLabel = diff.op === 'add' ? '追加' : (diff.op === 'replace' ? '変更' : '削除');

    switch (diff.op) {
        case 'add':
            return [
                `${diff.value.itemId} ${diff.value.name} の追加`,
                `${diff.value.itemId} ${diff.value.name} を新規に追加しました。`
            ];

        case 'replace':
            const targetName = diff.path.split('/')[2];
            const replaceValue = diff.oldValue[targetName];
            const label = columns.find(x => x.name === targetName).label;

            return [
                `${diff.oldValue.itemId} ${diff.oldValue.name} の変更`,
                `${diff.oldValue.itemId} ${diff.oldValue.name} の ${label} を ${replaceValue} --> ${diff.value} に変更しました。`
            ];

        case 'remove':
            return [
                `${diff.oldValue.itemId} ${diff.oldValue.name} の削除`,
                `${diff.oldValue.itemId} ${diff.oldValue.name} を削除しました。`
            ];

        default:
            throw 'Unexpected diff: ' + diff
    }
}
