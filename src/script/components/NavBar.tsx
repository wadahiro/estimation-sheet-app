import * as React from 'react';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import CurrencyIcon from 'material-ui/svg-icons/editor/attach-money';
import CreateIcon from 'material-ui/svg-icons/content/create';
import HistoryIcon from 'material-ui/svg-icons/action/description';

import { UserData } from '../reducers';
import { CurrencyPair } from '../utils/Money';

interface Props {
    userData: UserData;
    onClickCreate: (e: any) => void;
    onClickHistory: (e: any) => void;
    onClickCurrency: (e: any) => void;
    onClickMenu: (e: any) => void;
    onClickSave: (e: any) => void;
    editing: boolean;
    showExchangeRate: CurrencyPair[];
}

export class NavBar extends React.Component<Props, void> {

    getTitle() {
        const { userData, editing } = this.props;

        const customerName = userData.estimationMetadata['customerName'];
        const title = userData.estimationMetadata['title'];
        const displayTitle = title ? title : '';
        const displayCustomerName = customerName ? customerName : '';

        const display = (displayTitle || customerName) ? `- ${displayCustomerName} : ${displayTitle}` : '';

        if (editing) {
            return `概算見積もり ${display} (編集中...)`;
        } else {
            return `概算見積もり ${display} (${userData.date})`;
        }
    }

    render() {
        return (
            <AppBar title={this.getTitle()}
                iconElementRight={
                    <div>
                        <IconButton tooltip='見積もり情報の記入' onClick={this.props.onClickCreate}>
                            <CreateIcon color='#FFF' />
                        </IconButton>
                        <IconButton tooltip='変更履歴の参照' onClick={this.props.onClickHistory}>
                            <HistoryIcon color='#FFF' />
                        </IconButton>
                        {this.props.showExchangeRate.length > 0 &&
                            <IconButton tooltip='為替レートの変更' onClick={this.props.onClickCurrency}>
                                <CurrencyIcon color='#FFF' />
                            </IconButton>
                        }
                        <IconButton tooltip='記入内容をダウンロード' onClick={this.props.onClickSave}>
                            <FileDownload color='#FFF' />
                        </IconButton>
                    </div>
                } onLeftIconButtonTouchTap={this.props.onClickMenu}>
            </AppBar>
        );
    }
}
