import { combineReducers } from 'redux';

import * as Actions from '../actions';

const PRICE_LIST = require('../data/price-list.csv');

export interface RootState {
    app: AppState;
}

export interface AppState {
    showDetail: boolean;
    priceList: Item[];
    selected: string;
    dollarExchangeRate: number;
    purchaseItems: PurchaseItem[];
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

function init(): AppState {
    return {
        selected: null,
        showDetail: process.env.SELLER === 'default',
        priceList: initPriceList(PRICE_LIST),
        dollarExchangeRate: 120,
        purchaseItems: window['RESTORE_PURCHASE_ITEMS'] ? window['RESTORE_PURCHASE_ITEMS'] : []
    };
}

function initPriceList(list): Item[] {
    return list.map(x => {
        // calcurate
        const cost = x.suppliersPrice ? x.suppliersPrice : x.price / 4;
        return x;
    });
}

export const appStateReducer = (state: AppState = init(), action: Actions.Actions) => {
    switch (action.type) {

        case 'SET_ITEM':
            return Object.assign({}, state, {
                selected: action.payload.id
            });

        case 'ADD_ITEM':
            const item = state.priceList.find(x => x.id === action.payload.id);
            if (item) {
                return Object.assign({}, state, {
                    selected: null,
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
                        x.quantity = action.payload.quantity
                    }
                    return x;
                })
            });
        // default: const _exhaustiveCheck: never = action;
    }

    return state;
};

export default combineReducers({
    app: appStateReducer
});


