import { Action } from 'redux';

export type Actions =
    SearchItem |
    AddItem |
    DeleteItem |
    ModifyQuantity
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



