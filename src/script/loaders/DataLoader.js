/*  dsv-loader: a dsv loader for webpack
    built using dsv by Mike Bostock */

const loaderUtils = require('loader-utils');
const dsvFormat = require('d3-dsv').dsvFormat;

module.exports = function (text) {
    this.cacheable();

    try {
        const query = loaderUtils.parseQuery(this.query);
        const delimiter = query.delimiter || ',';
        const seller = query.seller || 'default';
        const dsv = dsvFormat(delimiter);
        const rows = query.rows;
        const res = rows ? dsv.parseRows(text) : dsv.parse(text);

        const resolvedRes = res.map((x, index) => {
            x.id = index + '';
            x.price = Number(x.price);
            x.suppliersPrice = Number(x.suppliersPrice);
            // discount
            if (seller !== 'default') {
                if (x[`seller_${seller}`]) {
                    if (typeof x.price === 'number') {
                        const discount = x[`seller_${seller}`];
                        x.price = x.price - (x.price * Number(discount) / 100);
                    }
                }
            }

            // remove suppliersPrice
            if (seller !== 'default') {
                delete x['suppliersPrice'];
            }

            // remove sellers info
            Object.keys(x).forEach(key => {
                if (key.match(/^seller_(.*)/)) {
                    delete x[key];
                }
            })
            return x;
        });
        // console.log(JSON.stringify(resolvedRes, null, 2));
        return 'module.exports = ' + JSON.stringify(resolvedRes);
    } catch (e) {
        console.error(e)
        throw e;
    }
}