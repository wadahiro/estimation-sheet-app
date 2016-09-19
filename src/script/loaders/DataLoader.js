const loaderUtils = require('loader-utils');
const serialize = require('serialize-javascript');
const dsvFormat = require('d3-dsv').dsvFormat;
const buildSettings = require('../../../buildSettings');

const nodegit = require('nodegit');
const path = require('path');
const jsonDiffPatch = require('json-diff-patch');
const jsonpointer = require('jsonpointer');


module.exports = function (text) {
    this.cacheable();
    const callback = this.async();

    try {
        const query = loaderUtils.parseQuery(this.query);
        const delimiter = query.delimiter || ',';
        const seller = query.seller || 'default';
        const dsv = dsvFormat(delimiter);
        const rows = query.rows;
        const res = rows ? dsv.parseRows(text) : dsv.parse(text);

        const currentBuildSettings = buildSettings.sellers.find(x => x.name === seller);

        const priceRules = getConfig(buildSettings, currentBuildSettings, 'priceRules');
        const exchangeRate = getConfig(buildSettings, currentBuildSettings, 'exchangeRate');

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

        // changelog
        const priceChangeHistory = getConfig(buildSettings, currentBuildSettings, 'priceChangeHistory');

        const changes = priceChangeHistory.map(x => {
            // TODO filename
            return Promise.all([getGitContent('.', x.from, 'src/script/data/test.csv'),
            getGitContent('.', x.to, 'src/script/data/test.csv')])
                .then(result => {
                    const dsv = dsvFormat(',');
                    const c1 = dsv.parse(result[0].content);
                    const c2 = dsv.parse(result[1].content);

                    const diff = jsonDiffPatch.diff(c1, c2);

                    // console.log(diff)

                    const resolvedDiff = diff.map(x => {
                        const opStr = x.op === 'add' ? '追加' : (x.op === 'replace' ? '変更' : '削除');
                        const message = x.op === 'add' ? '追加' : (x.op === 'replace' ? '変更' : '削除');

                        const before = jsonpointer.get(c1, x.path);
                        const after = jsonpointer.get(c2, x.path);

                        switch (x.op) {
                            case 'add':
                                return {
                                    title: `${after.itemId} ${after.name} の 追加`,
                                    subTitle: `${after.itemId} ${after.name} を新規に追加しました。`,
                                    op: x
                                };
                            case 'replace':
                                const replaceTarget = jsonpointer.get(c2, '/' + x.path.split('/')[1]);
                                return {
                                    title: `${replaceTarget.itemId} ${replaceTarget.name} の 変更`,
                                    subTitle: `${replaceTarget.itemId} ${replaceTarget.name} の ${x.path} を ${before} --> ${after} に変更しました`,
                                    op: x
                                };
                            case 'remove':
                                return {
                                    title: `${before.itemId} ${before.name} の 削除`,
                                    subTitle: `${before.itemId} ${before.name} を 削除しました。`,
                                    op: x
                                };
                            default:
                                throw 'Unexpected diff: ' + x
                        }
                    })

                    return {
                        id: `${result[0].id}..${result[1].id}`,
                        fromDate: result[0].date,
                        toDate: result[1].date,
                        diff: resolvedDiff
                    };
                });
        });

        Promise.all(changes)
            .then(result => {
                // console.log(result)
                // const data = {
                //     price: priceList,
                //     costRules: bindMoney(costRules),
                //     validationRules: bindMoney(validationRules),
                //     exchangeRate: exchangeRate,
                //     showExchangeRate: showExchangeRate
                // };

                // callback(null, `module.exports = ${serialize(data)};`);
                callback(null, `module.exports = {
                    price: ${serialize(priceList)},
                    costRules: ${serialize(bindMoney(costRules))},
                    validationRules: ${serialize(bindMoney(validationRules))},
                    exchangeRate: ${JSON.stringify(exchangeRate)},
                    showExchangeRate: ${JSON.stringify(showExchangeRate)},
                    priceChangeHistory: ${JSON.stringify(result)}
                }`);
            });

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

function getGitContent(gitPath, tag, targetFile) {
    return new Promise((resolve, reject) => {
        let _commit;
        nodegit.Repository.open(gitPath)
            .then(function (repo) {
                return repo.getCommit(tag)
                    .catch(function () {
                        return nodegit.AnnotatedCommit.fromRevspec(repo, tag)
                            .then(function (annotatedCommit) {
                                // console.log('annotated commit %s', tag);
                                return annotatedCommit.id();
                            })
                            .then(function (id) {
                                return repo.getCommit(id);
                            });
                    });
            })
            .then(function (commit) {
                _commit = commit;
                return commit.getEntry(targetFile);
            })
            .then(function (entry) {
                return entry.getBlob();
            })
            .then(function (blob) {
                const str = blob.toString();
                resolve({
                    id: _commit.sha(),
                    date: _commit.date(),
                    content: str
                });
            })
            .catch(err => {
                console.error(err)
                reject(err);
            })
            .done();
    });
}