import { combineReducers } from 'redux';

import * as Actions from '../actions';

const PRICE_LIST = require('../data/price-list.csv');

export interface RootState {
    app: AppState;
}

export interface AppState {
    summaryColumns: Column[];
    purchaseItemsColumns: Column[];

    priceList: Item[];
    searchWord: string;
    dollarExchangeRate: number;
    purchaseItems: PurchaseItem[];

    appHistory: AppHistory;
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
    history: {
        dollarExchangeRate: number;
        purchaseItems: PurchaseItem[]
    }[];
}

function init(): AppState {
    const dollarExchangeRate = 120;
    const purchaseItems = window['RESTORE_PURCHASE_ITEMS'] ? window['RESTORE_PURCHASE_ITEMS'] : [];

    return {
        summaryColumns: process.env.SUMMARY_COLUMNS,
        purchaseItemsColumns: process.env.PURCHASE_ITEMS_COLUMNS,

        searchWord: null,
        priceList: initPriceList(PRICE_LIST),

        dollarExchangeRate,
        purchaseItems,

        appHistory: {
            current: 0,
            history: [{
                dollarExchangeRate,
                purchaseItems
            }]
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
        dollarExchangeRate: state.appHistory.history[state.appHistory.current].dollarExchangeRate,
        purchaseItems: state.appHistory.history[state.appHistory.current].purchaseItems
    }) : state;

    const newState = reducer(currentState, action);

    switch (action.type) {
        case 'ADD_ITEM':
        case 'DELETE_ITEM':
        case 'MOD_QUANTITY':
            const h = newState.appHistory.history.slice(0, newState.appHistory.current + 1);

            return Object.assign({}, newState, {
                appHistory: {
                    current: newState.appHistory.current + 1,
                    history: h.concat({
                        dollarExchangeRate: newState.dollarExchangeRate,
                        purchaseItems: newState.purchaseItems
                    })
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
                    purchaseItems: state.purchaseItems.concat({
                        id: item.id,
                        quantity: 1
                    })
                });
            }
            return state;

        case 'DELETE_ITEM':
            const deleteItem = state.purchaseItems.find(x => x.id === action.payload.id);
            if (deleteItem) {
                return Object.assign({}, state, {
                    purchaseItems: state.purchaseItems.filter(x => x.id !== deleteItem.id)
                });
            }
            return state;

        case 'MOD_QUANTITY':
            return Object.assign({}, state, {
                purchaseItems: state.purchaseItems.map(x => {
                    if (x.id === action.payload.id) {
                        return Object.assign({}, x, {
                            quantity: action.payload.quantity
                        });
                    }
                    return x;
                })
            });
    }

    return state;
};

export default combineReducers({
    app: history(appStateReducer),
});


