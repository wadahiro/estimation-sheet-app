import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import Divider from 'material-ui/Divider';

import * as Actions from '../actions';
import { getVisiblePriceList, getVisibleOptions, getPurchaseDetailItems, PurchaseDetailItem, isEditing, getCurrentSavedHistory } from '../selectors';
import { RootState, Column, Item, PurchaseItem, SavedHistory, UserData, Option } from '../reducers';
import { NavBar } from './NavBar';
import { SearchBox } from './SearchBox';
import { EstimationMetadata } from './EstimationMetadata';
import { Summary } from './Summary';
import { PurchaseItems } from './PurchaseItems';
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

    render() {
        const iconStyles = {
            marginRight: 24
        };

        const { estimationMetadataColumns, summaryColumns, purchaseItemsColumns,
            priceList,
            userData,
            searchWord, purchaseDetailItems, savedHistory,
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
                        <Col xs={6}>
                            <EstimationMetadata columns={estimationMetadataColumns} value={userData.estimationMetadata} />
                        </Col>
                        <Col xs={6}>
                            <Summary columns={summaryColumns} purchaseDetailItems={purchaseDetailItems} />
                        </Col>
                    </Row>
                </Grid>

                <Divider />

                <Grid className={style.grid}>
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
                            />
                    </Row>
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

        savedHistory: state.app.present.savedHistory,
        editing: isEditing(state)
    };
}

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
