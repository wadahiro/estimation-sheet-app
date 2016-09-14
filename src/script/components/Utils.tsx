import { RootState } from '../reducers';

const moment = require('moment');

export function toYen(price: number = 0): string {
    return `${String(floor(price, 3)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} 円`;
}

export function toPercentage(rate: number): string {
    return `${floor(rate * 100, 2)} %`;
}

export function format(type: 'yen' | 'rate', value: string | number): string {
    switch (type) {
        case 'yen':
            return toYen(value as number);
        case 'rate':
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