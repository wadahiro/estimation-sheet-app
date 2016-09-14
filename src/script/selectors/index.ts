import { createSelector } from 'reselect';
import { RootState, AppState, Item, PurchaseItem, UserData, Option } from '../reducers';

const getPriceList = (state: RootState) => state.app.present.priceList;
const getPurchaseItems = (state: RootState) => state.app.present.userData.purchaseItems;
const getDollarExchangeRate = (state: RootState) => state.app.present.userData.dollarExchangeRate;
const getPresentAppState = (state: RootState) => state.app.present;

export const getVisiblePriceList = createSelector<RootState, Item[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        const addedIds = purchaseItems.map(x => x.id);
        return priceList.filter(x => !addedIds.find(y => x.id === y));
    }
);

export const getVisibleOptions = createSelector<RootState, Option[], Item[]>(
    getVisiblePriceList,
    (priceList) => {
        const priceOptions: Option[] = priceList.map(x => {
            return {
                text: `${x.onSale ? '' : '(新規販売停止) '} ${x.name} ${x.itemId} ${x.menu}`,
                value: x.id,
                onSale: x.onSale
            } as Option;
        });
        return priceOptions;
    }
);

export interface PurchaseDetailItem extends PurchaseItem, Item {
    sumPrice: number;
    sumCost: number;
}

export const getPurchaseDetailItems = createSelector<RootState, PurchaseDetailItem[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        return purchaseItems.map((x, index) => {
            const item = priceList.find(y => y.id === x.id);

            // Calc price, sum
            let sumPrice;
            if (item.dynamicPrice) {
                sumPrice = item.dynamicPrice(item, x.quantity);
            } else {
                sumPrice = item.price * (x.quantity || 0);
            }
            let sumCost;
            if (item.supplierPrice === 0) {
                sumCost = sumPrice / 4;
            } else {
                sumCost = item.supplierPrice * (x.quantity || 0);
            }

            return <PurchaseDetailItem>Object.assign({
                displayId: index + 1,
                sumPrice,
                sumCost
            }, item, x);
        });
    }
);

export const getCurrentSavedHistory = createSelector<RootState, UserData, AppState>(
    getPresentAppState,
    (appState) => {
        const date = appState.userData.date;
        const found = appState.savedHistory.find(x => x.date === date);
        return found;
    }
);

export const isEditing = createSelector<RootState, boolean, UserData>(
    getCurrentSavedHistory,
    (userData) => {
        return userData === undefined;
    }
);
