import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import * as M from 'react-mdl';
import { createSelector } from 'reselect';

import * as Actions from '../actions';
import { getVisiblePriceList, getVisibleOptions, getPurchaseDetailItems, PurchaseDetailItem, isEditing, getCurrentSavedHistory } from '../selectors';
import { RootState, Column, Item, PurchaseItem, SavedHistory, UserData, Option } from '../reducers';
import { SearchBox } from './SearchBox';
import { Summary } from './Summary';
import { PurchaseItems } from './PurchaseItems';
import { HistoryMenu } from './HistoryMenu';
import { SaveDialog } from './SaveDialog';
import { save } from './Utils';

interface Props {
    dispatch?: Dispatch<RootState>;
    rootState?: RootState;

    estimationMetadataColumns?: Column[];
    summaryColumns?: Column[];
    purchaseItemsColumns?: Column[];
    priceList?: Option[];

    searchWord?: string;
    purchaseDetailItems?: PurchaseDetailItem[];

    userData?: UserData,

    currentSavedHistory?: UserData,
    savedHistory?: UserData[];
    editing?: boolean;
}

interface State {
    showSaveDialog: boolean;
}

class App extends React.Component<Props, State> {
    state = {
        showSaveDialog: false
    }

    addItem = (id: string) => {
        this.props.dispatch(Actions.addItem(id));
    };

    searchItem = (searchWord: string) => {
        this.props.dispatch(Actions.searchItem(searchWord));
    };

    changeQuantity = (id: string, newQuantity: number) => {
        this.props.dispatch(Actions.modifyQuantity(id, newQuantity));
    };

    deleteItem = (id: string) => {
        this.props.dispatch(Actions.deleteItem(id));
    };

    openSaveDialog = (e) => {
        e.preventDefault();
        this.setState({
            showSaveDialog: true
        });
    };

    closeSaveDialog = () => {
        this.setState({
            showSaveDialog: false
        });
    };

    save = () => {
        save(this.props.rootState);
    };

    restoreSavedHistory = (date: string) => {
        this.props.dispatch(Actions.restoreSavedHistory(date));
    };

    changeMetadata = (name: string, value: string) => {
        this.props.dispatch(Actions.modifyMetadata(name, value));
    };

    handleKeydown = (e) => {
        const evtobj = window.event ? event : e;
        if (evtobj.keyCode === 89 && evtobj.ctrlKey) {
            evtobj.preventDefault();
            this.props.dispatch(Actions.redo());

        } else if (evtobj.keyCode === 90 && evtobj.ctrlKey) {
            evtobj.preventDefault();
            this.props.dispatch(Actions.undo());

        } else if (evtobj.keyCode === 83 && evtobj.ctrlKey) {
            evtobj.preventDefault();
            if (this.state.showSaveDialog) {
                this.closeSaveDialog();
                this.save();
            } else {
                this.openSaveDialog(e);
            }
        }
    };

    componentDidMount() {
        document.onkeydown = this.handleKeydown;
    }

    componentWillUnmount() {
        document.onkeydown = undefined;
    }

    getTitle() {
        const customerName = this.props.userData.estimationMetadata['customerName'];
        const title = this.props.userData.estimationMetadata['title'];
        const displayTitle = title ? title : '';
        const displayCustomerName = customerName ? customerName : '';

        const display = (displayTitle || customerName) ? `- ${displayCustomerName} : ${displayTitle}` : '';

        if (this.props.editing) {
            return `概算見積もり ${display} (編集中...)`;
        } else {
            return `概算見積もり ${display} (${this.props.currentSavedHistory.date})`;
        }
    }

    render() {
        const { estimationMetadataColumns, summaryColumns, purchaseItemsColumns,
            priceList,
            userData,
            searchWord, purchaseDetailItems, currentSavedHistory, savedHistory,
            editing } = this.props;

        return (
            <div>
                <M.Layout fixedHeader>
                    <M.Header title={this.getTitle()}>
                        <M.Navigation>
                            <a href='#'>価格一覧</a>
                        </M.Navigation>
                    </M.Header>
                    <M.Drawer title='保存履歴'>
                        <HistoryMenu history={savedHistory} goto={this.restoreSavedHistory} />
                    </M.Drawer>
                    <M.Content>
                        <div style={{ width: '90%', margin: 'auto' }}>
                            <M.Grid>
                                <M.Cell col={8}>
                                    <SearchBox value={searchWord}
                                        options={priceList}
                                        onValueChange={this.addItem}
                                        onChangeSearchWord={this.searchItem} />
                                </M.Cell>
                                <M.Cell col={4}>
                                    <Summary columns={summaryColumns} purchaseDetailItems={purchaseDetailItems} />
                                </M.Cell>
                            </M.Grid>
                            <M.Grid>
                                <M.Cell col={12}>
                                    <PurchaseItems columns={purchaseItemsColumns}
                                        purchaseDetailItems={purchaseDetailItems}
                                        onChangeQuantity={this.changeQuantity}
                                        onDeleteItem={this.deleteItem}
                                        />
                                </M.Cell>
                            </M.Grid>
                            <M.Grid>
                                <M.Cell col={10}>
                                </M.Cell>
                                <M.Cell col={2}>
                                    <M.Button raised colored ripple onClick={this.openSaveDialog}>ファイルに保存</M.Button>
                                </M.Cell>
                            </M.Grid>
                        </div>
                    </M.Content>
                </M.Layout>
                {this.state.showSaveDialog &&
                    <SaveDialog columns={estimationMetadataColumns} value={userData.estimationMetadata} onChange={this.changeMetadata} onSave={this.save} onClose={this.closeSaveDialog} />
                }
            </div >
        );
    }
}

function mapStateToProps(state: RootState, props: Props): Props {
    return {
        rootState: state,

        estimationMetadataColumns: state.app.present.estimationMetadataColumns,
        summaryColumns: state.app.present.summaryColumns,
        purchaseItemsColumns: state.app.present.purchaseItemsColumns,

        priceList: getVisibleOptions(state),

        userData: state.app.present.userData,

        searchWord: state.app.present.searchWord,
        purchaseDetailItems: getPurchaseDetailItems(state),

        currentSavedHistory: getCurrentSavedHistory(state),
        savedHistory: state.app.present.savedHistory,
        editing: isEditing(state)
    };
}

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
