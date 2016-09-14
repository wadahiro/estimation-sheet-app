import { combineReducers } from 'redux';

import * as Actions from '../actions';
import { now } from '../components/Utils';

const ReduxUndo = require('redux-undo');
const undoable = ReduxUndo.default;
const includeAction = ReduxUndo.includeAction;

// const PRICE_LIST = require('../data/price-list.csv');
const PRICE_LIST = require('../data/price.csv');

export interface RootState {
    app: AppStateHistory;
}

export interface AppStateHistory {
    past: AppState[];
    present: AppState;
    future: AppState[];
}

export interface AppState {
    estimationMetadataColumns: Column[];
    summaryColumns: Column[];
    purchaseItemsColumns: Column[];

    priceList: Item[];

    searchWord: string;

    userData: UserData;
    savedHistory: UserData[];
}

export interface Column {
    name: string;
    label: string;
    type?: 'currency' | 'percentage';
    required?: boolean;
    options?: Option[]
}

export interface Option {
    label?: string;
    text: string;
    disabled?: boolean;
    static?: boolean;
    value?: string;
    onSale?: boolean;
}

export type CurrencyType = 'JPY' | 'USD';

export interface Item {
    id: string;
    itemId: string;
    name: string;
    menu: string;
    unit: string;
    quantity: number;
    price: Currency;
    dynamicPrice?: (self: Item, quantity: number) => Currency;
    supplierPrice: Currency;
    dynamicSupplierPrice?: (self: Item, quantity: number) => Currency;
    seller: string;

    onSale: boolean;
}

export interface PurchaseItem {
    itemId: string;
    quantity: number;
}

export interface SavedHistory {
    history: UserData[];
}

export interface UserData {
    date: string;
    estimationMetadata: {
        [index: string]: string;
    };
    exchangeRate: ExchangeRate[];
    purchaseItems: PurchaseItem[];
}

export interface Currency {
    type: CurrencyType;
    value: number;
}

export interface ExchangeRate {
    type: CurrencyType;
    rate: number;
}

// for test server
if (process.env.NODE_ENV !== 'production') {
    window['SAVED_HISTORY'] = [
        { date: '2016-08-01 13:33:20', estimationMetadata: { customerName: 'ABC', title: 'foobar' }, exchangeRate: [{ type: 'USD', rate: 120 }], purchaseItems: [{ itemId: 'OSS-FREX-IDEG-001', quantity: 20 }] },
        { date: '2016-09-06 09:10:40', estimationMetadata: { customerName: 'ABC', title: 'foobar2' }, exchangeRate: [{ type: 'USD', rate: 100 }], purchaseItems: [{ itemId: 'OSS-LDAP-1ND-001', quantity: 5 }, { itemId: 'OSS-FRIN-AUTE-001', quantity: 2000 }] }
    ];
}

function init(): AppState {
    let userData: UserData = {
        date: '',
        estimationMetadata: {},
        exchangeRate: process.env.EXCHANGE_RATE,
        purchaseItems: []
    };

    const savedHistory: UserData[] = window['SAVED_HISTORY'] ? window['SAVED_HISTORY'] : [];
    if (savedHistory.length > 0) {
        userData = savedHistory[savedHistory.length - 1];
    }

    return {
        estimationMetadataColumns: process.env.ESTIMATION_METADATA,
        summaryColumns: process.env.SUMMARY_COLUMNS,
        purchaseItemsColumns: process.env.PURCHASE_ITEMS_COLUMNS,

        searchWord: null,
        priceList: initPriceList(PRICE_LIST),

        userData,
        savedHistory
    };
}

function initPriceList(list: Item[]): Item[] {
    return list.map(x => {
        if (x.dynamicPrice) {
            x.dynamicPrice = Function.call(null, 'return ' + x.dynamicPrice)();
        }
        if (x.dynamicSupplierPrice) {
            x.dynamicSupplierPrice = Function.call(null, 'return ' + x.dynamicSupplierPrice)();
        }
        return x;
    });
}

export const appStateReducer = (state: AppState = init(), action: Actions.Actions) => {
    switch (action.type) {
        case 'SEARCH_ITEM':
            return Object.assign({}, state, {
                searchWord: action.payload.searchWord
            });

        case 'ADD_ITEM':
            const item = state.priceList.find(x => x.itemId === action.payload.itemId);
            if (item) {
                return Object.assign({}, state, {
                    searchWord: null,
                    userData: Object.assign({}, state.userData, {
                        date: now(),
                        purchaseItems: state.userData.purchaseItems.concat({
                            itemId: item.itemId,
                            quantity: 1
                        })
                    })
                });
            }
            return state;

        case 'DELETE_ITEM':
            const deleteItem = state.userData.purchaseItems.find(x => x.itemId === action.payload.itemId);
            if (deleteItem) {
                return Object.assign({}, state, {
                    userData: Object.assign({}, state.userData, {
                        date: now(),
                        purchaseItems: state.userData.purchaseItems.filter(x => x.itemId !== deleteItem.itemId)
                    })
                });
            }
            return state;

        case 'MOD_QUANTITY':
            return Object.assign({}, state, {
                userData: Object.assign({}, state.userData, {
                    date: now(),
                    purchaseItems: state.userData.purchaseItems.map(x => {
                        if (x.itemId === action.payload.itemId) {
                            return Object.assign({}, x, {
                                quantity: action.payload.quantity
                            });
                        }
                        return x;
                    })
                })
            });

        case 'MOD_EXCHANGE_RATE':
            return Object.assign({}, state, {
                userData: Object.assign({}, state.userData, {
                    date: now(),
                    exchangeRate: state.userData.exchangeRate.map(x => {
                        if (x.type === action.payload.type) {
                            return Object.assign({}, x, {
                                rate: action.payload.rate
                            });
                        }
                        return x;
                    })
                })
            });

        case 'RESTORE_SAVED_HISTORY':
            const restoredIndex = state.savedHistory.findIndex(x => x.date === action.payload.date);

            return Object.assign({}, state, {
                userData: state.savedHistory[restoredIndex]
            });

        case 'MOD_METADATA':
            return Object.assign({}, state, {
                userData: Object.assign({}, state.userData, {
                    date: now(),
                    estimationMetadata: Object.assign({}, state.userData.estimationMetadata, {
                        [action.payload.name]: action.payload.value
                    })
                })
            });
    }

    return state;
};

export default combineReducers({
    app: undoable(appStateReducer, {
        filter: includeAction(['ADD_ITEM', 'DELETE_ITEM', 'MOD_QUANTITY', 'MOD_EXCHANGE_RATE', 'RESTORE_SAVED_HISTORY'])
    }),
});
