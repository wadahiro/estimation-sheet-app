import { combineReducers } from 'redux';

import * as Actions from '../actions';
import { now } from '../components/Utils';

const PRICE_LIST = require('../data/price-list.csv');

export interface RootState {
    app: AppState;
}

export interface AppState {
    summaryColumns: Column[];
    purchaseItemsColumns: Column[];

    priceList: Item[];
    searchWord: string;

    // user editable data
    current: Data;
    appHistory: AppHistory;
    savedHistory: SavedHistory;
}

export interface Column {
    name: string;
    label: string;
    type: 'yen' | 'rate';
}

export interface Item {
    id: string;
    itemId: string;
    name: string;
    menu: string;
    unit: string;
    quantity: number;
    price: number;
    suppliersPrice: number;
    seller: string;

    cost: number;
}

export interface PurchaseItem {
    id: string;
    quantity: number;
}

export interface AppHistory {
    current: number;
    history: Data[];
}

export interface SavedHistory {
    history: Data[];
}

export interface Data {
    date: string;
    dollarExchangeRate: number;
    purchaseItems: PurchaseItem[];

    currentSavedHistory: number;
}

// for test server
if (process.env.NODE_ENV !== 'production') {
    window['SAVED_HISTORY'] = [
        { date: '2016-08-01 13:33:20', dollarExchangeRate: 120, purchaseItems: [{ id: '1', quantity: 20 }] },
        { date: '2016-09-06 09:10:40', dollarExchangeRate: 100, purchaseItems: [{ id: '20', quantity: 5 }, { id: '49', quantity: 8 }] }
    ];
}

function init(): AppState {
    let data: Data = {
        date: '',
        dollarExchangeRate: 120,
        purchaseItems: [],
        currentSavedHistory: 0
    };

    const savedHistory: Data[] = (window['SAVED_HISTORY'] ? window['SAVED_HISTORY'] : []).map((x, index) => {
        x.currentSavedHistory = index;
        return x;
    });
    if (savedHistory.length > 0) {
        data = savedHistory[savedHistory.length - 1];
    }

    return {
        summaryColumns: process.env.SUMMARY_COLUMNS,
        purchaseItemsColumns: process.env.PURCHASE_ITEMS_COLUMNS,

        searchWord: null,
        priceList: initPriceList(PRICE_LIST),

        current: data,

        appHistory: {
            current: 0,
            history: [data]
        },

        savedHistory: {
            history: savedHistory
        }
    };
}

function initPriceList(list): Item[] {
    return list.map(x => {
        return x;
    });
}

export const history = (reducer: (state: AppState, action: Actions.Actions) => AppState) => (state: AppState, action: Actions.Actions) => {
    const currentState = state ? Object.assign({}, state, {
        current: state.appHistory.history[state.appHistory.current]
    }) : state;

    const newState = reducer(currentState, action);

    switch (action.type) {
        case 'ADD_ITEM':
        case 'DELETE_ITEM':
        case 'MOD_QUANTITY':
        case 'RESTORE_SAVED_HISTORY':
            const h = newState.appHistory.history.slice(0, newState.appHistory.current + 1);

            return Object.assign({}, newState, {
                appHistory: {
                    current: newState.appHistory.current + 1,
                    history: h.concat(newState.current)
                }
            });

        case 'UNDO':
            if (newState.appHistory.current > 0) {
                return Object.assign({}, newState, {
                    appHistory: {
                        current: newState.appHistory.current - 1,
                        history: newState.appHistory.history
                    }
                });
            }
            return newState;

        case 'REDO':
            if (newState.appHistory.current < newState.appHistory.history.length - 1) {
                return Object.assign({}, newState, {
                    appHistory: {
                        current: newState.appHistory.current + 1,
                        history: newState.appHistory.history
                    }
                });
            }
            return newState;
    }

    return newState;
}

export const appStateReducer = (state: AppState = init(), action: Actions.Actions) => {
    switch (action.type) {
        case 'SEARCH_ITEM':
            return Object.assign({}, state, {
                searchWord: action.payload.searchWord
            });

        case 'ADD_ITEM':
            const item = state.priceList.find(x => x.id === action.payload.id);
            if (item) {
                return Object.assign({}, state, {
                    searchWord: null,
                    current: Object.assign({}, state.current, {
                        date: now(),
                        purchaseItems: state.current.purchaseItems.concat({
                            id: item.id,
                            quantity: 1
                        })
                    })
                });
            }
            return state;

        case 'DELETE_ITEM':
            const deleteItem = state.current.purchaseItems.find(x => x.id === action.payload.id);
            if (deleteItem) {
                return Object.assign({}, state, {
                    current: Object.assign({}, state.current, {
                        date: now(),
                        purchaseItems: state.current.purchaseItems.filter(x => x.id !== deleteItem.id)
                    })
                });
            }
            return state;

        case 'MOD_QUANTITY':
            return Object.assign({}, state, {
                current: Object.assign({}, state.current, {
                    date: now(),
                    purchaseItems: state.current.purchaseItems.map(x => {
                        if (x.id === action.payload.id) {
                            return Object.assign({}, x, {
                                quantity: action.payload.quantity
                            });
                        }
                        return x;
                    })
                })
            });

        case 'RESTORE_SAVED_HISTORY':
            const restoredIndex = state.savedHistory.history.findIndex(x => x.date === action.payload.date);

            return Object.assign({}, state, {
                current: state.savedHistory.history[restoredIndex]
            });
    }

    return state;
};

export default combineReducers({
    app: history(appStateReducer),
});


