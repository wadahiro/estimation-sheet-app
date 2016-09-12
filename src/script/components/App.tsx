import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';

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
    showSaveDialog?: boolean;
    showDrawer?: boolean;
}

class App extends React.Component<Props, State> {
    state = {
        showSaveDialog: false,
        showDrawer: false
    };

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

    openDrawer = (e) => {
        e.preventDefault();
        this.setState({
            showDrawer: true
        });
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
        this.setState({
            showDrawer: false
        });
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
                <AppBar title={this.getTitle()} iconClassNameRight='muidocs-icon-navigation-expand-more' onLeftIconButtonTouchTap={this.openDrawer}>
                </AppBar>
                <Drawer open={this.state.showDrawer}
                    docked={false}
                    onRequestChange={(showDrawer) => this.setState({ showDrawer })}>
                    <HistoryMenu history={savedHistory} goto={this.restoreSavedHistory} />
                </Drawer>
                <div style={{ width: '90%', margin: 'auto' }}>
                    <div>
                        <SearchBox value={searchWord}
                            options={priceList}
                            onValueChange={this.addItem}
                            onChangeSearchWord={this.searchItem} />
                    </div>
                    <div>
                        <Summary columns={summaryColumns} purchaseDetailItems={purchaseDetailItems} />
                    </div>
                    <div>
                        <PurchaseItems columns={purchaseItemsColumns}
                            purchaseDetailItems={purchaseDetailItems}
                            onChangeQuantity={this.changeQuantity}
                            onDeleteItem={this.deleteItem}
                            />
                    </div>
                </div>
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
