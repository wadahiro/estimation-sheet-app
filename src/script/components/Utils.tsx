import { RootState } from '../reducers';

const moment = require('moment');

export function toYen(price: number = 0) {
    return `${String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} 円`;
}

export function toPercentage(rate: number) {
    return `${Math.floor(rate * 100)} %`;
}

export function format(type: 'yen' | 'rate') {
    switch (type) {
        case 'yen':
            return toYen;
        case 'rate':
            return toPercentage;
    }
}

export function save(rootState: RootState) {
    const now = moment();
    const title = `${document.title}-${now.format('YYYY-MM-DD_HH_mm_ss')}`;

    const savedHistory = rootState.app.savedHistory.history.concat({
        date: now.format('YYYY-MM-DD HH:mm:ss'),
        dollarExchangeRate: rootState.app.dollarExchangeRate,
        purchaseItems: rootState.app.purchaseItems
    });

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