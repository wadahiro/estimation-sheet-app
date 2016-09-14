import { Action } from 'redux';

import { CurrencyType } from '../reducers';

const { ActionCreators } = require('redux-undo');

export type Actions =
    SearchItem |
    AddItem |
    DeleteItem |
    ModifyQuantity |
    RestoreSavedHistory |
    ModifyMetadata |
    ModifyExchangeRate
    ;

export interface SearchItem extends Action {
    type: 'SEARCH_ITEM';
    payload: {
        searchWord: string;
    }
}
export function searchItem(searchWord: string): SearchItem {
    return {
        type: 'SEARCH_ITEM',
        payload: {
            searchWord
        }
    };
}

export interface AddItem extends Action {
    type: 'ADD_ITEM';
    payload: {
        id: string;
    }
}
export function addItem(id: string): AddItem {
    return {
        type: 'ADD_ITEM',
        payload: {
            id
        }
    };
}

export interface DeleteItem extends Action {
    type: 'DELETE_ITEM';
    payload: {
        id: string;
    }
}
export function deleteItem(id: string): DeleteItem {
    return {
        type: 'DELETE_ITEM',
        payload: {
            id
        }
    };
}

export interface ModifyQuantity extends Action {
    type: 'MOD_QUANTITY';
    payload: {
        id: string;
        quantity: number;
    };
}
export function modifyQuantity(id: string, quantity: number): ModifyQuantity {
    return {
        type: 'MOD_QUANTITY',
        payload: {
            id,
            quantity
        }
    };
}

export interface RestoreSavedHistory extends Action {
    type: 'RESTORE_SAVED_HISTORY';
    payload: {
        date: string;
    }
}
export function restoreSavedHistory(date: string): RestoreSavedHistory {
    return {
        type: 'RESTORE_SAVED_HISTORY',
        payload: {
            date
        }
    };
}

export interface ModifyMetadata extends Action {
    type: 'MOD_METADATA';
    payload: {
        name: string;
        value: string;
    };
}
export function modifyMetadata(name: string, value: string): ModifyMetadata {
    return {
        type: 'MOD_METADATA',
        payload: {
            name,
            value
        }
    };
}

export interface ModifyExchangeRate extends Action {
    type: 'MOD_EXCHANGE_RATE';
    payload: {
        type: CurrencyType,
        rate: number;
    };
}
export function modifyExchangeRate(type: CurrencyType, rate: number): ModifyExchangeRate {
    return {
        type: 'MOD_EXCHANGE_RATE',
        payload: {
            type,
            rate
        }
    };
}

export function undo() {
    return ActionCreators.undo();
}

export function redo() {
    return ActionCreators.redo();
}