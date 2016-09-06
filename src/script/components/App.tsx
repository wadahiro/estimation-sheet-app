import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import * as M from 'react-mdl';
import { createSelector } from 'reselect';

import * as Actions from '../actions';
import { getVisiblePriceList, getVisibleOptions, Option, getPurchaseDetailItems, PurchaseDetailItem, isEditing } from '../selectors';
import { RootState, Column, Item, PurchaseItem, SavedHistory, Data } from '../reducers';
import { SearchBox } from './SearchBox';
import { Summary } from './Summary';
import { PurchaseItems } from './PurchaseItems';
import { HistoryMenu } from './HistoryMenu';
import { save } from './Utils';

interface Props {
    dispatch?: Dispatch<RootState>;
    rootState?: RootState;

    summaryColumns?: Column[];
    purchaseItemsColumns?: Column[];
    priceList?: Option[];
    searchWord?: string;
    dollarExchangeRate?: number;
    purchaseItems?: PurchaseItem[];
    purchaseDetailItems?: PurchaseDetailItem[];

    currentSavedHistory?: Data,
    savedHistory?: SavedHistory;
    editing?: boolean;
}

class App extends React.Component<Props, void> {

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

    download = (e) => {
        e.preventDefault();
        save(this.props.rootState);
    };

    restoreSavedHistory = (date: string) => {
        this.props.dispatch(Actions.restoreSavedHistory(date));
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
            this.download(e);
        }
    };

    componentDidMount() {
        document.onkeydown = this.handleKeydown;
    }

    componentWillUnmount() {
        document.onkeydown = undefined;
    }

    render() {
        const { summaryColumns, purchaseItemsColumns, priceList, searchWord, purchaseDetailItems, currentSavedHistory, savedHistory, editing } = this.props;

        return (
            <div>
                <M.Layout fixedHeader>
                    <M.Header title={`概算見積もり (${editing ? '編集中...' : currentSavedHistory.date})`}>
                        <M.Navigation>
                            <a href='#'>価格一覧</a>
                        </M.Navigation>
                    </M.Header>
                    <M.Drawer title='保存履歴'>
                        <HistoryMenu history={savedHistory.history} goto={this.restoreSavedHistory} />
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
                                    <M.Button raised colored ripple onClick={this.download}>ファイルに保存</M.Button>
                                </M.Cell>
                            </M.Grid>
                        </div>
                    </M.Content>
                </M.Layout>
            </div >
        );
    }
}

function mapStateToProps(state: RootState, props: Props): Props {
    return {
        rootState: state,

        summaryColumns: state.app.summaryColumns,
        purchaseItemsColumns: state.app.purchaseItemsColumns,
        priceList: getVisibleOptions(state),
        searchWord: state.app.searchWord,
        dollarExchangeRate: state.app.current.dollarExchangeRate,
        purchaseItems: state.app.current.purchaseItems,
        purchaseDetailItems: getPurchaseDetailItems(state),

        currentSavedHistory: state.app.savedHistory.history[state.app.current.currentSavedHistory],
        savedHistory: state.app.savedHistory,
        editing: isEditing(state)
    };
}

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
