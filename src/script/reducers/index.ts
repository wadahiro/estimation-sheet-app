import { combineReducers } from 'redux';

import * as Actions from '../actions';

const priceList = require('../data/price-list.csv');

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

    added: boolean;
}

export interface PurchaseItem extends Item {
    displayId: number;
    quantity: number;
    cost: number;
}

function init(): AppState {
    return {
        showDetail: process.env.SELLER === 'default',
        priceList: priceList.map(x => { x.added = false; return x; }),
        selected: '',
        dollarExchangeRate: 120,
        purchaseItems: window['RESTORE_PURCHASE_ITEMS'] ? window['RESTORE_PURCHASE_ITEMS'] : []
    };
}

export const appStateReducer = (state: AppState = init(), action: Actions.Actions) => {
    switch (action.type) {

        case 'SET_ITEM':
            return Object.assign({}, state, {
                selected: action.payload.id
            });

        case 'ADD_ITEM':
            const item = state.priceList.find(x => x.id === state.selected);
            if (item) {
                const cost = item.suppliersPrice ? item.suppliersPrice : item.price / 4;
                return Object.assign({}, state, {
                    selected: '',
                    priceList: state.priceList.map(x => {
                        if (x.id === item.id) {
                            x.added = true;
                        }
                        return x;
                    }),
                    purchaseItems: state.purchaseItems.concat(Object.assign({}, item, {
                        displayId: state.purchaseItems.length + 1,
                        cost,
                        added: true
                    }))
                });
            }
            return state;

        case 'DELETE_ITEM':
            const deleteItem = state.purchaseItems.find(x => x.id === action.payload.id);
            if (deleteItem) {
                return Object.assign({}, state, {
                    priceList: state.priceList.map(x => {
                        if (x.id === deleteItem.id) {
                            x.added = false;
                        }
                        return x;
                    }),
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


