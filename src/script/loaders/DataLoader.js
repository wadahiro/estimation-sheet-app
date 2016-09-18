/*  dsv-loader: a dsv loader for webpack
    built using dsv by Mike Bostock */

const loaderUtils = require('loader-utils');
const serialize = require('serialize-javascript');
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

        const exchangeRate = buildSettings.exchangeRate[0].rate;

        const currentBuildSettings = buildSettings.sellers.find(x => x.name === seller);

        const priceRules = getConfig(buildSettings, currentBuildSettings, 'priceRules');

        const priceList = res.map((x, index) => {
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
                currency: 'JPY',
                amount: applyDiscount(discountRate, price)
            };

            // supplierPrice
            const supplierPrice = Number(x.supplierPrice);
            x.supplierPrice = {
                currency: x.supplierPriceCurrency,
                amount: supplierPrice
            };
            delete x['supplierPriceCurrency']

            // dynamic supplierPrice and price
            priceRules.forEach(rule => {
                if (rule.unit === x.unit) {

                    // supplierPrice
                    let supplierPrice;
                    if (typeof rule.supplierPrice === 'function') {
                        supplierPrice = rule.supplierPrice(x);
                    } else {
                        supplierPrice = rule.supplierPrice;
                    }

                    // price
                    const price = rule.price(x, supplierPrice);

                    // discount
                    const discountPrice = rule.discountPrice(x, price, discountRate, seller, exchangeRate);

                    x.price = Function.call(null, `return function calcPrice(item, quantity) { var Money = this; var price = ${JSON.stringify(discountPrice)}; return ${rule.calc.toString()}(item, price, quantity)}`)();

                    x.supplierPrice = Function.call(null, `return function calcSupplierPrice(item, quantity) { var Money = this; var price = ${JSON.stringify(supplierPrice)}; return ${rule.calc.toString()}(item, price, quantity)}`)();
                }
            });

            // remove supplierPrice
            if (seller !== 'default') {
                // console.log('delete detail for ' + seller)
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

        const costRules = getConfig(buildSettings, currentBuildSettings, 'costRules');
        const validationRules = getConfig(buildSettings, currentBuildSettings, 'validationRules');
        const showExchangeRate = getConfig(buildSettings, currentBuildSettings, 'showExchangeRate');
        const mainCurrency = getConfig(buildSettings, currentBuildSettings, 'mainCurrency');


        const data = {
            price: priceList,
            costRules: bindMoney(costRules),
            validationRules: bindMoney(validationRules),
            showExchangeRate: showExchangeRate,
            mainCurrency: showExchangeRate,
        };

        return `module.exports = ${serialize(data)};`;
    } catch (e) {
        console.error(e)
        throw e;
    }
}

function getConfig(defaultSettings, currentSettings, key) {
    return (currentSettings && currentSettings[key]) ? currentSettings[key] : defaultSettings.default[key];
}

function bindMoney(rules) {
    return rules.map(x => {
        x.calc = Function.call(null, `return function calc(items) { var Money = this; return ${x.calc.toString()}(items)}`)();
        return x;
    });
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