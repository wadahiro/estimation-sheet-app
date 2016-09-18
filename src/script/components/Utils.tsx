import { RootState, ExchangeRate } from '../reducers';
import { Money, CurrencyType, isMoney } from '../utils/Money';

const moment = require('moment');

const ZERO_YEN = new Money(0, Money.JPY);

export function toPercentage(rate: number): string {
    return `${round(rate * 100, 2)} %`;
}

// TODO currently, support JPY only. support other currency?
export function exchangeCurrency(exchangeRate: ExchangeRate[], money: Money = ZERO_YEN): Money {
    if (money.currency === 'JPY') {
        return money;
    }
    const target = exchangeRate.find(x => x.type === money.currency);
    if (!target) {
        // cannot exchange
        console.warn(`cannot exchange because of no exchange rate against ${money.currency}`);
        return ZERO_YEN;
    }
    return money.multiply(target.rate);
}

export function formatCurrency(value: Money, exchangeRate: ExchangeRate[], decimalPlace = 0): string[] {
    let resolvedValue: string[];
    resolvedValue = [formatCurrencyByType(value.currency, value.amount, decimalPlace)];

    // TODO parameterize 'JPY'
    if (value.currency !== 'JPY') {
        const mainCurrency = exchangeCurrency(exchangeRate, value);
        const mainCurrencyFormatted = formatMoney(mainCurrency);

        resolvedValue = [mainCurrencyFormatted, resolvedValue[0]];
    }
    return resolvedValue;
}

export function formatMoney(value: Money, decimalPlace = 0): string {
    const currency = String(round(value.amount, decimalPlace)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

    // FIXME
    switch (value.currency) {
        case 'JPY':
            return `${currency} 円`;

        case 'USD':
            return `$ ${currency}`;

        default:
            return 'Uknown';
    }
}

export function formatCurrencyByType(type: CurrencyType, value: number, decimalPlace = 0): string {
    const currency = String(round(value, decimalPlace)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

    // FIXME
    switch (type) {
        case 'JPY':
            return `${currency} 円`;

        case 'USD':
            return `$ ${currency}`;

        default:
            return 'Uknown';
    }
}

export function format(type: 'currency' | 'percentage', value: string | number | Money, exchangeRate: ExchangeRate[], decimalPlace = 0): string | string[] {

    switch (type) {
        case 'currency':
            if (isMoney(value)) {
                return formatCurrency(value, exchangeRate, decimalPlace);
            } else {
                return formatCurrencyByType('JPY', Number(value), decimalPlace);
            }

        case 'percentage':
            return toPercentage(value as number);
        default:
            return value as string;
    }
}

export function floor(num: number, n: number) {
    const pow = Math.pow(10, n);
    return Math.floor(num * pow) / pow;
}

export function ceil(num: number, n: number) {
    const pow = Math.pow(10, n);
    return Math.ceil(num * pow) / pow;
}

export function round(num: number, n: number) {
    const pow = Math.pow(10, n);
    return Math.round(num * pow) / pow;
}

export function save(rootState: RootState) {
    const now = moment();
    const title = `${document.title}-${now.format('YYYY-MM-DD_HH_mm_ss')}`;

    const savedHistory = rootState.app.present.savedHistory.concat(Object.assign({}, rootState.app.present.userData, {
        date: now.format('YYYY-MM-DD HH:mm:ss')
    }));

    const current = document.getElementsByTagName('html')[0].innerHTML;

    const begin = current.indexOf('<!-- SAVED_HISTORY_BEGIN-->');
    const end = current.indexOf('<!-- SAVED_HISTORY_END-->');

    const before = current.substring(0, begin);
    const after = current.substring(end + '<!-- SAVED_HISTORY_END-->'.length);

    let html = decodeURI('%3C!doctype html%3E%3Chtml%3E');
    html += before;
    html += decodeURI('%3C!-- SAVED_HISTORY_BEGIN--%3E');
    html += decodeURI('%3Cscript%3E');
    html += 'var SAVED_HISTORY = ' + JSON.stringify(savedHistory);
    html += decodeURI('%3C/script%3E');
    html += decodeURI('%3C!-- SAVED_HISTORY_END--%3E');
    html += after;
    html += decodeURI('%3C/html%3E');

    // replace body
    html = html.replace(/<div id="app">.*<\/div>/, '<div id="app"><\/div>');

    const blob = new Blob([html]);
    if (window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, title + '.html');
    } else {
        const url = window.URL || window['webkitURL'];
        const blobURL = url.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = title.replace(/^\* /, '') + '.html';
        a.href = blobURL;

        const ev = document.createEvent('MouseEvents');
        ev.initMouseEvent('click', true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        a.dispatchEvent(ev);
    }
}

export function now(): string {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}