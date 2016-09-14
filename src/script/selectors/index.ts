import { createSelector } from 'reselect';
import { RootState, AppState, Item, PurchaseItem, UserData, Option, Currency } from '../reducers';

const getPriceList = (state: RootState) => state.app.present.priceList;
const getPurchaseItems = (state: RootState) => state.app.present.userData.purchaseItems;
const getExchangeRate = (state: RootState) => state.app.present.userData.exchangeRate;
const getPresentAppState = (state: RootState) => state.app.present;

export const getVisiblePriceList = createSelector<RootState, Item[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        const addedItemIds = purchaseItems.map(x => x.itemId);
        return priceList.filter(x => !addedItemIds.find(y => x.itemId === y));
    }
);

export const getVisibleOptions = createSelector<RootState, Option[], Item[]>(
    getVisiblePriceList,
    (priceList) => {
        const priceOptions: Option[] = priceList.map(x => {
            return {
                text: `${x.onSale ? '' : '(新規販売停止) '} ${x.name} ${x.itemId} ${x.menu} ${x.unit}`,
                value: x.itemId,
                onSale: x.onSale
            } as Option;
        });
        return priceOptions;
    }
);

export interface PurchaseDetailItem extends PurchaseItem, Item {
    sumPrice: Currency;
    sumCost: Currency;
}

export const getPurchaseDetailItems = createSelector<RootState, PurchaseDetailItem[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        return purchaseItems.map((x, index) => {
            const item = priceList.find(y => y.itemId === x.itemId);

            // Calc price
            let sumPrice: Currency = {
                type: item.price.type,
                value: 0
            };
            let price: Currency = item.price;

            // price
            if (typeof item.dynamicPrice === 'function') {
                sumPrice = item.dynamicPrice(item, x.quantity);
                price = {
                    type: sumPrice.type,
                    value: sumPrice.value / x.quantity
                };
            } else {
                sumPrice.value = item.price.value * (x.quantity || 0);
            }

            // Calc cost
            let sumCost: Currency = {
                type: item.supplierPrice.type,
                value: 0
            };
            if (item.supplierPrice.value === 0) {
                sumCost.value = sumPrice.value / 4;
            } else {
                sumCost.value = item.supplierPrice.value * (x.quantity || 0);
            }

            // supplierPrice
            let supplierPrice = item.supplierPrice;
            if (typeof item.dynamicSupplierPrice === 'function') {
                sumCost = item.dynamicSupplierPrice(item, x.quantity);
                supplierPrice = {
                    type: sumCost.type,
                    value: sumCost.value / x.quantity
                };
            }

            return <PurchaseDetailItem>Object.assign(item, x, {
                displayId: index + 1,
                sumPrice,
                sumCost,
                price,
                supplierPrice
            });
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
