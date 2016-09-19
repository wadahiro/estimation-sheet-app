import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import CreateIcon from 'material-ui/svg-icons/content/create';
import Divider from 'material-ui/Divider';

import * as Actions from '../actions';
import { getVisiblePriceList, getVisibleOptions, getPurchaseDetailItems, getEnhancedCostItems, getValidationResults, isEditing, getCurrentSavedHistory } from '../selectors';
import { RootState, Column, Item, PurchaseItem, PurchaseDetailItem, CostItem, ValidationResult, SavedHistory, UserData, Option, ChangeHistory } from '../reducers';
import { CurrencyPair } from '../utils/Money';
import { NavBar } from './NavBar';
import { SearchBox } from './SearchBox';
import { EstimationMetadata } from './EstimationMetadata';
import { Summary } from './Summary';
import { PurchaseItems } from './PurchaseItems';
import { CostItems } from './CostItems';
import { HistoryMenu } from './HistoryMenu';
import { EditEstimationMetadataDialog } from './EditEstimationMetadataDialog';
import { ExchangeRateDialog } from './ExchangeRateDialog';
import { ChangeHistoryDialog } from './ChangeHistoryDialog';
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
    priceChangeHistory?: ChangeHistory<Item>[];

    searchWord?: string;
    purchaseDetailItems?: PurchaseDetailItem[];
    costItems?: CostItem[],
    validationResults?: ValidationResult[],

    showExchangeRate?: CurrencyPair[],

    userData?: UserData,

    savedHistory?: UserData[];
    editing?: boolean;
}

interface State {
    showDialog?: boolean;
    showDrawer?: boolean;
    showExchangeRateDialog?: boolean;
    showChangeHistoryDialog?: boolean;
}

class App extends React.Component<Props, State> {
    state = {
        showDialog: false,
        showDrawer: false,
        showExchangeRateDialog: false,
        showChangeHistoryDialog: false
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

    changeExchangeRate = (currencyPair: CurrencyPair, rate: number) => {
        this.props.dispatch(Actions.modifyExchangeRate(currencyPair, rate));
    };

    openExchangeRateDialog = (e) => {
        e.preventDefault();
        this.setState({
            showExchangeRateDialog: true
        });
    };

    closeExchangeRateDialog = () => {
        this.setState({
            showExchangeRateDialog: false
        });
    };

    openChangeHistoryDialog = (e) => {
        e.preventDefault();
        this.setState({
            showChangeHistoryDialog: true
        });
    };

    closeChangeHistoryDialog = () => {
        this.setState({
            showChangeHistoryDialog: false
        });
    };

    openDrawer = (e) => {
        e.preventDefault();
        this.setState({
            showDrawer: true
        });
    };

    openMetadataDialog = (e) => {
        e.preventDefault();
        this.setState({
            showDialog: true
        });
    };

    closeDialog = () => {
        this.setState({
            showDialog: false
        });
    };

    changeMetadata = (value: { [index: string]: string }) => {
        this.props.dispatch(Actions.modifyMetadata(value));
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
            if (!this.state.showDialog) {
                this.save();
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
            priceChangeHistory,
            userData,
            searchWord, purchaseDetailItems, costItems, validationResults, savedHistory,
            showExchangeRate,
            editing } = this.props;

        return (
            <div>
                <NavBar userData={userData}
                    onClickCreate={this.openMetadataDialog}
                    onClickHistory={this.openChangeHistoryDialog}
                    onClickCurrency={this.openExchangeRateDialog}
                    onClickMenu={this.openDrawer}
                    onClickSave={this.save}
                    editing={editing}
                    showExchangeRate={showExchangeRate} />

                <Drawer open={this.state.showDrawer}
                    docked={false}
                    width={400}
                    onRequestChange={(showDrawer) => this.setState({ showDrawer })}>
                    <HistoryMenu columns={estimationMetadataColumns} history={savedHistory} goto={this.restoreSavedHistory} />
                </Drawer>

                {/* for print */}
                <Grid className={style.printGrid}>
                    <Row className={style.row}>
                        <Col xs={8}>
                            <EstimationMetadata columns={estimationMetadataColumns} value={userData.estimationMetadata} onEdit={this.openMetadataDialog} />
                        </Col>
                        <Col xs={4}>
                            <Summary columns={summaryColumns}
                                purchaseDetailItems={purchaseDetailItems}
                                costItems={costItems}
                                exchangeRate={userData.exchangeRate} />
                        </Col>
                    </Row>
                </Grid>

                <Grid className={style.noPrintGrid}>
                    <Row className={style.row}>
                        <Col xs={8}>
                            <SearchBox value={searchWord}
                                options={priceList}
                                onValueChange={this.addItem}
                                onChangeSearchWord={this.searchItem} />
                        </Col>
                        <Col xs={4}>
                            <Summary columns={summaryColumns}
                                purchaseDetailItems={purchaseDetailItems}
                                costItems={costItems}
                                exchangeRate={userData.exchangeRate} />
                        </Col>
                    </Row>
                </Grid>

                <Divider />

                <Grid className={style.grid}>
                    <Row className={style.row}>
                        <Col xs={12}>
                            {validationResults.length > 0 &&
                                <ul>
                                    {
                                        validationResults.map(x => {
                                            return (
                                                <li key={x.id}>{x.message}</li>
                                            );
                                        })
                                    }
                                </ul>
                            }
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

                {costItems.length > 0 &&
                    [
                        <Divider />,

                        <Grid className={style.grid}>
                            <Row className={style.row}>
                                <CostItems costItems={costItems}
                                    exchangeRate={userData.exchangeRate}
                                    />
                            </Row>
                        </Grid>
                    ]
                }

                {this.state.showDialog &&
                    <EditEstimationMetadataDialog columns={estimationMetadataColumns} defaultValue={userData.estimationMetadata} onSave={this.changeMetadata} onClose={this.closeDialog} />
                }

                {this.state.showExchangeRateDialog &&
                    <ExchangeRateDialog exchangeRate={userData.exchangeRate} onChangeRate={this.changeExchangeRate}
                        showExchangeRate={showExchangeRate} onClose={this.closeExchangeRateDialog} />
                }

                {this.state.showChangeHistoryDialog &&
                    <ChangeHistoryDialog history={priceChangeHistory} onClose={this.closeChangeHistoryDialog} />
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
        priceChangeHistory: state.app.present.priceChangeHistory,

        userData: state.app.present.userData,

        searchWord: state.app.present.searchWord,
        purchaseDetailItems: getPurchaseDetailItems(state),
        costItems: getEnhancedCostItems(state),
        validationResults: getValidationResults(state),

        showExchangeRate: state.app.present.showExchangeRate,

        savedHistory: state.app.present.savedHistory,
        editing: isEditing(state)
    };
}

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
