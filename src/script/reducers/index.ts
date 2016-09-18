import { combineReducers } from 'redux';
import { Maybe, Either } from 'tsmonad';
import { Money, MoneyJSON, CurrencyType, ExchangeRate, round } from '../utils/Money';

import * as Actions from '../actions';
import { now } from '../components/Utils';

const ReduxUndo = require('redux-undo');
const undoable = ReduxUndo.default;
const includeAction = ReduxUndo.includeAction;

const PRICE_DATA = require('../data/price.csv');

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
    costRules: CostRule[];
    validationRules: ValidationRule[];
    showExchangeRate: CurrencyType[];

    searchWord: string;

    userData: UserData;
    savedHistory: UserData[];
}

export interface Column {
    name: string;
    label: string;
    type?: 'currency' | 'percentage';
    required?: boolean;
    options?: Option[];
    decimalPlace?: number;
}

export interface Option {
    label?: string;
    text: string;
    disabled?: boolean;
    static?: boolean;
    value?: string;
    onSale?: boolean;
}

export interface BaseItem {
    id: string;
    itemId: string;
    name: string;
    menu: string;
    unit: string;
    quantity: number;
    onSale: boolean;
    aboutPrice: string;
    comment: Maybe<string>;
}

export interface Item extends BaseItem {
    supplierPrice: Either<Money, CalcPrice>;
    price: Either<Money, CalcPrice>;
}

export type CalcPrice = (self: Item, quantity: number) => Money;

export interface PurchaseItem {
    orderId: string;
    itemId: string; // primary key
    quantity: number;
}

export interface PurchaseDetailItem extends BaseItem, PurchaseItem {
    supplierPrice: Money;
    price: Money;
    sumCost: Money;
    sumPrice: Money;
}

export interface CostItem {
    id: string;
    name: string;
    supplierPrice: Money;
    price: Money;
}

export interface CostRule {
    calc: (items: PurchaseDetailItem[]) => CostItem[];
}

export interface ValidationRule {
    calc: (items: PurchaseDetailItem[]) => ValidationResult[];
}

export interface ValidationResult {
    id: string;
    message: string;
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

// for test server
if (process.env.NODE_ENV !== 'production') {
    // window['SAVED_HISTORY'] = [
    //     { date: '2016-08-01 13:33:20', estimationMetadata: { customerName: 'ABC', title: 'foobar' }, exchangeRate: [{ type: 'USD', rate: 120 }], purchaseItems: [{ orderId: 376, itemId: 'OSS-FREX-IDEG-001', quantity: 20 }] },
    //     { date: '2016-09-06 09:10:40', estimationMetadata: { customerName: 'ABC', title: 'foobar2' }, exchangeRate: [{ type: 'USD', rate: 100 }], purchaseItems: [{ orderId: 254, itemId: 'OSS-LDAP-1ND-001', quantity: 5 }, { orderId: 357, itemId: 'OSS-FRIN-AUTE-001', quantity: 2000 }] }
    // ];
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
        priceList: initPriceList(PRICE_DATA.price),
        costRules: bindMoney(PRICE_DATA.costRules),
        validationRules: bindMoney(PRICE_DATA.validationRules),

        showExchangeRate: PRICE_DATA.showExchangeRate,

        userData,
        savedHistory
    };
}

function bindMoney(rules) {
    const { Money } = require('../utils/Money');
    return rules.map(x => {
        x.calc = x.calc.bind(Money);
        return x;
    });
}

function initPriceList(list: any[]): Item[] {
    const { Money } = require('../utils/Money');

    return list.map(x => {
        const item = Object.assign({}, x);
        if (typeof x.price === 'function') {
            item.price = Either.right<Money, CalcPrice>(x.price.bind(Money));
        } else {
            item.price = Either.left<Money, CalcPrice>(toMoney(x.price));
        }
        if (typeof x.supplierPrice === 'function') {
            item.supplierPrice = Either.right<Money, CalcPrice>(x.supplierPrice.bind(Money));
        } else {
            item.supplierPrice = Either.left<Money, CalcPrice>(toMoney(x.supplierPrice));
        }
        return item;
    });
}

function toMoney(json: MoneyJSON): Money {
    return new Money(round(json.amount, 0), json.currency);
}

export const appStateReducer = (state: AppState = init(), action: Actions.Actions) => {
    switch (action.type) {
        case 'SEARCH_ITEM':
            return Object.assign({}, state, {
                searchWord: action.payload.searchWord
            });

        case 'ADD_ITEM':
            const item = state.priceList.find(x => x.itemId === action.payload.itemId);
            const items = state.userData.purchaseItems.concat({
                orderId: item.id,
                itemId: item.itemId,
                quantity: 1
            });

            const sortedItems = items.sort((a, b) => {
                if (a.orderId < b.orderId) return -1;
                if (a.orderId > b.orderId) return 1;
                return 0;
            });

            if (item) {
                return Object.assign({}, state, {
                    searchWord: null,
                    userData: Object.assign({}, state.userData, {
                        date: now(),
                        purchaseItems: sortedItems
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
                        if (x.currency === action.payload.currency) {
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
                    estimationMetadata: Object.assign({}, action.payload.value)
                })
            });
    }

    return state;
};

export default combineReducers({
    app: undoable(appStateReducer, {
        filter: includeAction(['ADD_ITEM', 'DELETE_ITEM', 'MOD_QUANTITY', 'MOD_EXCHANGE_RATE', 'MOD_METADATA', 'RESTORE_SAVED_HISTORY'])
    }),
});
