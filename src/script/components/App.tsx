import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import * as M from 'react-mdl';
import { Header } from 'react-mdl';
import { createSelector } from 'reselect';

import * as Actions from '../actions';
import { getVisiblePriceList, getVisibleOptions, Option, getPurchaseDetailItems, PurchaseDetailItem } from '../selectors';
import { RootState, Item, PurchaseItem } from '../reducers';

const { Combobox } = require('react-input-enhancements');

interface Props {
    dispatch?: Dispatch<RootState>;

    showDetail?: boolean;
    priceList?: Option[];
    selected?: string;
    dollarExchangeRate?: number;
    purchaseItems?: PurchaseItem[];
    purchaseDetailItems?: PurchaseDetailItem[];
}

class App extends React.Component<Props, void> {
    onChange = (value) => {
        console.log('onChange:', value)
        this.props.dispatch(Actions.setItem(value));
    };

    addItem = (id: string) => {
        console.log('addItem ', id)
        setTimeout(() => {
            this.props.dispatch(Actions.addItem(id));
        });
    };

    deleteItem = (id: string) => (e) => {
        this.props.dispatch(Actions.deleteItem(id));
    };

    editableQuantity = (value, item: PurchaseDetailItem) => {
        return <div className='quantity' style={{ marginLeft: 10 }}>
            <M.Textfield label='' value={value} type='number' onChange={this.modifyQuantity(item)} />
        </div>;
    };

    modifyQuantity = (item: PurchaseDetailItem) => (e) => {
        const quantity = Number(e.target.value);
        this.props.dispatch(Actions.modifyQuantity(item.id, quantity));
    };

    renderAction = (value, item: PurchaseDetailItem) => {
        return <M.Button raised accent ripple onClick={this.deleteItem(item.id)}>削除</M.Button>;
    };

    renderPrice = (value: number, item: PurchaseDetailItem) => {
        if (item.quantity > 1) {
            const sum = value * item.quantity;
            return <span>{toYen(sum)}<br /><span style={{fontSize: 10}}>(単価: {toYen(value)})</span></span>;
        } else {
            return <span>{toYen(value)}</span>;
        }
    };

    download = (e) => {
        const current = document.getElementsByTagName('html')[0].innerHTML;

        const i = current.indexOf('</title>');
        const before = current.substring(0, i + '</title>'.length);
        const after = current.substring(i + '</title>'.length);

        let html = decodeURI('%3C!doctype html%3E%3Chtml%3E');
        html += before;
        html += decodeURI('%3Cscript%3E');
        html += 'var RESTORE_PURCHASE_ITEMS = ' + JSON.stringify(this.props.purchaseItems);
        html += decodeURI('%3C/script%3E');
        html += after;
        html += decodeURI('%3C/html%3E');

        const blob = new Blob([html]);
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, document.title + '.html');
        } else {
            const url = window.URL || window['webkitURL'];
            const blobURL = url.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = document.title.replace(/^\* /, '') + '.html';
            a.href = blobURL;

            const ev = document.createEvent('MouseEvents');
            ev.initMouseEvent('click', true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            a.dispatchEvent(ev);
        }
    };

    render() {
        const { showDetail, priceList, selected, purchaseDetailItems } = this.props;

        // calc sum
        const cost = purchaseDetailItems.reduce((s, x) => { s += (x.cost * (x.quantity || 0)); return s; }, 0);
        const receipt = purchaseDetailItems.reduce((s, x) => { s += (x.price * (x.quantity || 0)); return s; }, 0);
        const sum = {
            cost,
            receipt,
            profitRate: ((receipt - cost) / receipt) * 100
        }

        return (
            <div>
                <M.Layout fixedHeader>
                    <M.Header title={'概算見積もり'}>
                        <M.Navigation>
                            <a href='#'>価格一覧</a>
                        </M.Navigation>
                    </M.Header>
                    <M.Content>
                        <div style={{ width: '90%', margin: 'auto' }}>
                            <M.Grid>
                                <M.Cell col={8}>
                                    <div>
                                        <Combobox
                                            defaultValue={selected}
                                            options={priceList}
                                            dropdownProps={{ style: { width: '100%' } }}
                                            onValueChange={this.addItem}
                                            onChange={e => this.onChange(e.target.value)}
                                            autocomplete>
                                            {inputProps => {
                                                console.log('update1', selected)
                                                console.log('update2', inputProps.value)
                                                return <M.Textfield
                                                    {...inputProps}
                                                    className='select-item'
                                                    label=''
                                                    style={{ width: '100%' }}
                                                    placeholder='商品を選択してください'
                                                    expandableIcon='search'
                                                    />
                                            } }
                                        </Combobox>
                                    </div>
                                </M.Cell>
                                <M.Cell col={4}>
                                    <M.DataTable
                                        style={{ width: '100%' }}
                                        rows={[sum]}
                                        >
                                        {showDetail &&
                                            <M.TableHeader numeric name='cost' cellFormatter={toYen}>仕入額(コスト)</M.TableHeader>
                                        }
                                        <M.TableHeader numeric name='receipt' cellFormatter={toYen}>仕切額(売上)*税抜
                                        </M.TableHeader>
                                        {showDetail &&
                                            <M.TableHeader numeric name='profitRate' cellFormatter={(value) => `${value} %`}>利益率</M.TableHeader>
                                        }
                                    </M.DataTable>
                                </M.Cell>
                            </M.Grid>
                            <M.Grid>
                                <M.Cell col={12}>
                                    <M.DataTable
                                        style={{ width: '100%', tableLayout: 'fixed' }}
                                        shadow={0}
                                        rowKeyColumn='id'
                                        rows={purchaseDetailItems}
                                        >
                                        <M.TableHeader name='displayId' style={{ width: 50 }}>#</M.TableHeader>
                                        <M.TableHeader numeric name='itemId'>商品番号</M.TableHeader>
                                        <M.TableHeader numeric name='name'>商品名</M.TableHeader>
                                        <M.TableHeader numeric name='menu'>メニュー</M.TableHeader>
                                        <M.TableHeader numeric name='unit'> 単位</M.TableHeader>
                                        <M.TableHeader numeric name='quantity' cellFormatter={this.editableQuantity}>個数</M.TableHeader>
                                        {showDetail &&
                                            <M.TableHeader numeric name='suppliersPrice' cellFormatter={toYen}>仕入単価</M.TableHeader>
                                        }
                                        <M.TableHeader numeric name='price' cellFormatter={this.renderPrice} tooltip='価格'>価格</M.TableHeader>
                                        <M.TableHeader numeric name='action' cellFormatter={this.renderAction}></M.TableHeader>
                                    </M.DataTable>
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

function toYen(price: number) {
    if (!price) {
        price = 0;
    }
    return `${String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} 円`;
}

function mapStateToProps(state: RootState, props: Props): Props {
    return {
        showDetail: state.app.showDetail,
        priceList: getVisibleOptions(state),
        selected: state.app.selected,
        dollarExchangeRate: state.app.dollarExchangeRate,
        purchaseItems: state.app.purchaseItems,
        purchaseDetailItems: getPurchaseDetailItems(state)
    };
}

const AppContainer = connect(
    mapStateToProps
)(App);

export default AppContainer;
