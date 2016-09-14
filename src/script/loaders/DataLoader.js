/*  dsv-loader: a dsv loader for webpack
    built using dsv by Mike Bostock */

const loaderUtils = require('loader-utils');
const dsvFormat = require('d3-dsv').dsvFormat;
const buildSettings = require('../../../buildSettings');

module.exports = function (text) {
    this.cacheable();

    try {
        const query = loaderUtils.parseQuery(this.query);
        const delimiter = query.delimiter || ',';
        const seller = query.seller || 'default';
        const dsv = dsvFormat(delimiter);
        const rows = query.rows;
        const res = rows ? dsv.parseRows(text) : dsv.parse(text);

        const currentBuildSettings = buildSettings.sellers.find(x => x.name === seller);
        const supplierPriceRules = (currentBuildSettings && currentBuildSettings.supplierPriceRules) ? currentBuildSettings.supplierPriceRules : buildSettings.default.supplierPriceRules;

        const resolvedRes = res.map((x, index) => {
            x.id = (index + 1) + '';
            x.onSale = x.onSale.toLowerCase() === 'true';

            // discount
            let discountRate = 0;
            if (seller !== 'default') {
                if (x[`seller_${seller}`]) {
                    discountRate = Number(x[`seller_${seller}`]);
                }
            }

            // price
            const price = Number(x.price);
            x.price = {
                type: 'JPY',
                value: applyDiscount(discountRate, price)
            };

            // supplierPrice
            const supplierPrice = Number(x.supplierPrice);
            x.supplierPrice = {
                type: x.supplierPriceCurrency,
                value: supplierPrice
            };
            delete x['supplierPriceCurrency']

            // dynamic supplierPrice and price
            supplierPriceRules.forEach(y => {
                if (y.unit === x.unit) {
                    const rule = y.rule();

                    // supplierPrice
                    const supplierPrice = rule.supplierPrice(x);

                    // price
                    const price = rule.price(x, supplierPrice);

                    // discount
                    const discountPrice = rule.discountPrice(x, price, discountRate);

                    x.dynamicPrice = `function dynamicPrice(item, quantity) { var price = ${JSON.stringify(discountPrice)}; return ${rule.calc.toString()}(item, price, quantity)}
                    `;

                    x.dynamicSupplierPrice = `function dynamicSupplierPrice(item, quantity) { var price = ${JSON.stringify(supplierPrice)}; return ${rule.calc.toString()}(item, price, quantity)}
                    `;
                }
            });

            // remove supplierPrice
            if (seller !== 'default') {
                console.log('delete detail for ' + seller)
                delete x['supplierPrice'];
                delete x['dynamicsupplierPrice'];
            }

            // remove sellers info
            Object.keys(x).forEach(key => {
                if (key.match(/^seller_(.*)/)) {
                    delete x[key];
                }
            });

            return x;
        });

        const additionalPurchaseItemRules = (currentBuildSettings && currentBuildSettings.additionalPurchaseItemRules) ? currentBuildSettings.additionalPurchaseItemRules : buildSettings.default.additionalPurchaseItemRules;

        const data = {
            price: resolvedRes,
            additionalPurchaseItemRules
        };

        return 'module.exports = ' + JSON.stringify(data, replacer);
    } catch (e) {
        console.error(e)
        throw e;
    }
}

function replacer(k, v) {
    if (typeof v === 'function') {
        return v.toString();
    }
    return v;
}

function applyDiscount(rate, price) {
    return price * (1 - rate);
}