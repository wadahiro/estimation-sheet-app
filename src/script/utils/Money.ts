interface Currency {
    symbol: string;
    name: string;
    symbol_native: string;
    decimal_digits: number;
    code: 'USD' | 'JPY';
    name_plural: string;
}

const USD: Currency = {
    'symbol': '$',
    'name': 'US Dollar',
    'symbol_native': '$',
    'decimal_digits': 3,
    'code': 'USD',
    'name_plural': 'US dollars'
}

const JPY: Currency = {
    'symbol': '¥',
    'name': 'Japanese Yen',
    'symbol_native': '￥',
    'decimal_digits': 0,
    'code': 'JPY',
    'name_plural': 'Japanese yen'
}

export interface MoneyJSON {
    amount: number;
    currency: CurrencyType;
}

export interface ExchangeRate {
    main: CurrencyType;
    pairs: ExchangeRatePair[];
}

export interface ExchangeRatePair {
    pair: CurrencyPair;
    rate: number;
}

export type CurrencyPair = 'USD/JPY' | 'JPY/USD';

export type CurrencyType = 'USD' | 'JPY';

class BaseCurrency {
    public static USD = USD;
    public static JPY = JPY;
}

export function isCurrency(object: any): object is Currency {
    return object && typeof object.symbol === 'string' && typeof object.code === 'string';
}

export function isMoney(object: any): object is Money {
    return object && typeof object.amount === 'number' && typeof object.currency === 'string';
}

export class Money extends BaseCurrency {
    amount: number;
    currency: CurrencyType;

    constructor(amount: number, currency: Currency | CurrencyType) {
        super();
        this.amount = amount;
        this.currency = isCurrency(currency) ? currency.code : currency;
    }

    add(money: Money): Money {
        return new Money(this.amount + money.amount, this.currency);
    }

    subtract(money: Money): Money {
        return new Money(this.amount - money.amount, this.currency);
    }

    multiply(multiplier: number): Money {
        const amount = this.amount * multiplier;
        return new Money(amount, this.currency);
    }

    divide(divisor: number): Money {
        const amount = this.amount / divisor;
        return new Money(amount, this.currency);
    }

    equals(money: Money): boolean {
        return this.amount === money.amount && this.currency === money.currency;
    }

    compare(money: Money): -1 | 0 | 1 {
        if (this.amount === money.amount) {
            return 0;
        }

        return this.amount > money.amount ? 1 : -1;
    }

    greaterThan(money: Money): boolean {
        return 1 === this.compare(money);
    }

    greaterThanOrEqual(money: Money): boolean {
        return 0 <= this.compare(money);
    }

    lessThan(money: Money): boolean {
        return -1 === this.compare(money);
    }

    lessThanOrEqual(money: Money): boolean {
        return 0 >= this.compare(money);
    }

    exchange(exchangeRate: ExchangeRate): Money {
        if (this.currency === exchangeRate.main) {
            return this;
        }

        const targetRate = exchangeRate.pairs.find(x => canExchange(this.currency, x, exchangeRate.main));
        if (!targetRate) {
            // cannot exchange
            throw `Cannot exchange because of no exchange rate against ${this.currency}`;
        }

        const amount = this.amount * targetRate.rate;
        return new Money(amount, exchangeRate.main);
    }

    format(decimalPlace: number = Money[this.currency].decimal_digits, fn: typeof round = round): string {
        const formatted = String(fn(this.amount, decimalPlace)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
        return `${Money[this.currency].symbol_native} ${formatted}`;
    }
}

function canExchange(currency: CurrencyType, exchangeRate: ExchangeRatePair, targetCurrency: CurrencyType) {
    const pair = exchangeRate.pair.split('/');
    return pair[0] === currency && pair[1] === targetCurrency;
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