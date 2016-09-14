import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import Divider from 'material-ui/Divider';

import * as Actions from '../actions';
import { getVisiblePriceList, getVisibleOptions, getPurchaseDetailItems, getEnhancedCostItems, isEditing, getCurrentSavedHistory } from '../selectors';
import { RootState, Column, Item, PurchaseItem, PurchaseDetailItem, CostItem, SavedHistory, UserData, Option, CurrencyType } from '../reducers';
import { NavBar } from './NavBar';
import { SearchBox } from './SearchBox';
import { EstimationMetadata } from './EstimationMetadata';
import { Summary } from './Summary';
import { ExchangeRateBox } from './ExchangeRateBox';
import { PurchaseItems } from './PurchaseItems';
import { CostItems } from './CostItems';
import { HistoryMenu } from './HistoryMenu';
import { SaveDialog } from './SaveDialog';
import { save } from './Utils';

const style = require('./style.css');

const { Grid, Row, Col } = require('react-flexbox-grid');

interface Props {
    dispatch?: Dispatch<RootState>;
    rootState?: RootState;

    estimationMetadataColumns?: Column[];
    summaryColumns?: Column[];
    purchaseItemsColumns?: Column[];
    priceList?: Option[];

    searchWord?: string;
    purchaseDetailItems?: PurchaseDetailItem[];
    costItems?: CostItem[],

    userData?: UserData,

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

    addItem = (itemId: string) => {
        this.props.dispatch(Actions.addItem(itemId));
    };

    searchItem = (searchWord: string) => {
        this.props.dispatch(Actions.searchItem(searchWord));
    };

    changeQuantity = (itemId: string, newQuantity: number) => {
        this.props.dispatch(Actions.modifyQuantity(itemId, newQuantity));
    };

    deleteItem = (itemId: string) => {
        this.props.dispatch(Actions.deleteItem(itemId));
    };

    changeExchangeRate = (type: CurrencyType, rate: number) => {
        this.props.dispatch(Actions.modifyExchangeRate(type, rate));
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

    render() {
        const iconStyles = {
            marginRight: 24
        };

        const sectionTitleStyle = {
            margin: 0
        };

        const { estimationMetadataColumns, summaryColumns, purchaseItemsColumns,
            priceList,
            userData,
            searchWord, purchaseDetailItems, costItems, savedHistory,
            editing } = this.props;

        return (
            <div>
                <NavBar userData={userData}
                    onClickMenu={this.openDrawer}
                    onClickSave={this.openSaveDialog}
                    editing={editing} />

                <Drawer open={this.state.showDrawer}
                    docked={false}
                    width={400}
                    onRequestChange={(showDrawer) => this.setState({ showDrawer })}>
                    <HistoryMenu columns={estimationMetadataColumns} history={savedHistory} goto={this.restoreSavedHistory} />
                </Drawer>

                <Grid className={style.grid}>
                    <Row className={style.row}>
                        <h4 style={sectionTitleStyle}>見積もり情報</h4>
                    </Row>
                    <Row className={style.row}>
                        <Col xs={6}>
                            <EstimationMetadata columns={estimationMetadataColumns} value={userData.estimationMetadata} />
                        </Col>
                        <Col xs={2}>
                            <ExchangeRateBox value={userData.exchangeRate} onChangeRate={this.changeExchangeRate} />
                        </Col>
                        <Col xs={4}>
                            <Summary columns={summaryColumns}
                                purchaseDetailItems={purchaseDetailItems}
                                exchangeRate={userData.exchangeRate} />
                        </Col>
                    </Row>
                </Grid>

                <Divider />

                <Grid className={style.grid}>
                    <Row className={style.row}>
                        <h4 style={sectionTitleStyle}>見積もり内訳</h4>
                    </Row>
                    <Row className={style.row}>
                        <Col xs={12}>
                            <SearchBox value={searchWord}
                                options={priceList}
                                onValueChange={this.addItem}
                                onChangeSearchWord={this.searchItem} />
                        </Col>
                    </Row>
                    <Row className={style.row}>
                        <PurchaseItems columns={purchaseItemsColumns}
                            purchaseDetailItems={purchaseDetailItems}
                            onChangeQuantity={this.changeQuantity}
                            onDeleteItem={this.deleteItem}
                            exchangeRate={userData.exchangeRate}
                            />
                    </Row>
                </Grid>

                <Divider />

                <Grid className={style.grid}>
                    <Row className={style.row}>
                        <h4 style={sectionTitleStyle}>追加費用</h4>
                    </Row>
                    {costItems.length > 0 &&
                        <Row className={style.row}>
                            <CostItems costItems={costItems}
                                exchangeRate={userData.exchangeRate}
                                />
                        </Row>
                    }
                </Grid>

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
        costItems: getEnhancedCostItems(state),

        savedHistory: state.app.present.savedHistory,
        editing: isEditing(state)
    };
}

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
