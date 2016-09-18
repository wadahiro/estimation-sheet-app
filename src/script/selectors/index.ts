import { createSelector } from 'reselect';
import { RootState, AppState, Item, PurchaseItem, PurchaseDetailItem, UserData, Option, CostItem, CostRule, ValidationRule, ValidationResult } from '../reducers';

const getPriceList = (state: RootState) => state.app.present.priceList;
const getPurchaseItems = (state: RootState) => state.app.present.userData.purchaseItems;
const getCostRules = (state: RootState) => state.app.present.costRules;
const getValidationRules = (state: RootState) => state.app.present.validationRules;
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

export const getPurchaseDetailItems = createSelector<RootState, PurchaseDetailItem[], Item[], PurchaseItem[]>(
    getPriceList, getPurchaseItems,
    (priceList, purchaseItems) => {
        return purchaseItems.map((x, index) => {
            const item = priceList.find(y => {
                return y.itemId === x.itemId;
            });

            // Calc price
            const [price, sumPrice] = item.price.caseOf({
                left: p => [p, p.multiply(x.quantity)],
                right: calcPrice => {
                    const sum = calcPrice(item, x.quantity);

                    // calc price from sumPrice because threr is no price definition
                    const p = sum.divide(x.quantity);
                    return [p, sum];
                }
            });

            // TODO
            // let sumCost: Currency = { type: 'JPY', value: 0 };
            // let supplierPrice: Currency = { type: 'JPY', value: 0 };

            // Calc cost
            const [supplierPrice, sumCost] = item.supplierPrice.caseOf({
                left: sp => {
                    if (sp.amount === 0) {
                        return [sp, sumPrice.divide(4)];
                    } else {
                        return [sp, sp.multiply(x.quantity)];
                    }
                },
                right: calcSupplierPrice => {
                    const sum = calcSupplierPrice(item, x.quantity);

                    // calc supplierPrice from sumPrice because threr is no price definition
                    const sp = sum.divide(x.quantity);
                    return [sp, sum];
                }
            })


            // if (item.supplierPrice) {
            //     sumCost = {
            //         type: item.supplierPrice.type,
            //         value: 0
            //     };
            //     if (item.supplierPrice.value === 0) {
            //         sumCost.value = sumPrice.value / 4;
            //     } else {
            //         sumCost.value = item.supplierPrice.value * (x.quantity || 0);
            //     }

            //     // supplierPrice
            //     supplierPrice = item.supplierPrice;
            //     if (typeof item.dynamicSupplierPrice === 'function') {
            //         sumCost = item.dynamicSupplierPrice(item, x.quantity);
            //         supplierPrice = {
            //             type: sumCost.type,
            //             value: sumCost.value / x.quantity
            //         };
            //     }
            // }

            return Object.assign({}, item, x, {
                sumPrice,
                sumCost,
                price,
                supplierPrice
            });
        });
    }
);

export const getEnhancedCostItems = createSelector<RootState, CostItem[], PurchaseDetailItem[], CostRule[]>(
    getPurchaseDetailItems, getCostRules,
    (purchaseItems, costRules) => {

        // additional
        const enhancedItems = costRules.reduce<CostItem[]>((s, x) => {
            return s.concat(x.calc(purchaseItems));
        }, [] as CostItem[]);

        return enhancedItems;
    }
);

export const getValidationResults = createSelector<RootState, ValidationResult[], PurchaseDetailItem[], ValidationRule[]>(
    getPurchaseDetailItems, getValidationRules,
    (purchaseItems, validationRules) => {

        const results = validationRules.reduce<ValidationResult[]>((s, x) => {
            return s.concat(x.calc(purchaseItems));
        }, [] as ValidationResult[]);

        return results;
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
