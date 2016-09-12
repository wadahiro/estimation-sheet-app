import { createSelector } from 'reselect';
import { RootState, AppState, SavedHistory, Item, PurchaseItem, UserData } from '../reducers';

const getPriceList = (state: RootState) => state.app.present.priceList;
const getPurchaseItems = (state: RootState) => state.app.present.userData.purchaseItems;
const getDollarExchangeRate = (state: RootState) => state.app.present.userData.dollarExchangeRate;
const getAppHistory = (state: RootState) => state.app.past;
const getSavedHistory = (state: RootState) => state.app.present.savedHistory;
const getPresentAppState = (state: RootState) => state.app.present;

export const getVisiblePriceList = createSelector<RootState, Item[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        const addedIds = purchaseItems.map(x => x.id);
        return priceList.filter(x => !addedIds.find(y => x.id === y));
    }
)

export interface Option {
    label?: string;
    text: string;
    disabled?: boolean;
    static?: boolean;
    value?: string
}

export const getVisibleOptions = createSelector<RootState, Option[], Item[]>(
    getVisiblePriceList,
    (priceList) => {
        const priceOptions: Option[] = priceList.map(x => {
            return {
                text: `${x.name} ${x.itemId} ${x.menu}`,
                value: x.id
            } as Option;
        });
        return priceOptions;
    }
)

export interface PurchaseDetailItem extends PurchaseItem, Item {
}

export const getPurchaseDetailItems = createSelector<RootState, PurchaseDetailItem[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        return purchaseItems.map((x, index) => {
            const item = priceList.find(y => y.id === x.id);

            return <PurchaseDetailItem>Object.assign({
                displayId: index + 1
            }, item, x);
        });
    }
)

export const getCurrentSavedHistory = createSelector<RootState, UserData, AppState>(
    getPresentAppState,
    (appState) => {
        const date = appState.userData.date;
        const found = appState.savedHistory.find(x => x.date === date);
        return found;
    }
)

export const isEditing = createSelector<RootState, boolean, UserData>(
    getCurrentSavedHistory,
    (userData) => {
        return userData === undefined;
    }
)
