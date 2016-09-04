import { RootState } from '../reducers';

export function toYen(price: number) {
    if (!price) {
        price = 0;
    }
    return `${String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')} 円`;
}

export function toPercentage(rate: number) {
    if (!rate) {
        return '0 %';
    }
    return `${Math.floor(rate / 100)} %`;
}

export function format(type: 'yen' | 'rate') {
    switch (type) {
        case 'yen':
            return toYen;
        case 'rate':
            return toPercentage;
    }
}

export function save(rootState: RootState, title: string = document.title) {
    const current = document.getElementsByTagName('html')[0].innerHTML;

    const i = current.indexOf('</title>');
    const before = current.substring(0, i + '</title>'.length);
    const after = current.substring(i + '</title>'.length);

    let html = decodeURI('%3C!doctype html%3E%3Chtml%3E');
    html += before;
    html += decodeURI('%3Cscript%3E');
    html += 'var RESTORE_PURCHASE_ITEMS = ' + JSON.stringify(rootState.app.purchaseItems);
    html += decodeURI('%3C/script%3E');
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