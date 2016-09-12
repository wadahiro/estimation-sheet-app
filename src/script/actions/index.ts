import { Action } from 'redux';
const { ActionCreators } = require('redux-undo');

export type Actions =
    SearchItem |
    AddItem |
    DeleteItem |
    ModifyQuantity |
    RestoreSavedHistory
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
export function modifyQuantity(id, quantity): ModifyQuantity {
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

export function undo() {
    return ActionCreators.undo();
}

export function redo() {
    return ActionCreators.redo();
}