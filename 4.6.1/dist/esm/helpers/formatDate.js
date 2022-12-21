// https://github.com/nhn/tui.code-snippet/blob/master/formatDate/formatDate.js
import { isDate, isObject } from "./utils";
export const DEFAULT_DATE_FORMAT = 'YY-MM-DD hh:mm:ss';
export function getDateFormat(date) {
    if (!date) {
        return;
    }
    return isObject(date) ? date.format : DEFAULT_DATE_FORMAT;
}
const tokens = /[\\]*YYYY|[\\]*YY|[\\]*MMMM|[\\]*MMM|[\\]*MM|[\\]*M|[\\]*DD|[\\]*D|[\\]*HH|[\\]*H|[\\]*mm|[\\]*m|[\\]*ss|[\\]*s|[\\]*A/gi;
const MONTH_STR = [
    'Invalid month',
    'January',
    'February',
    'March',
    'April',
    'May',
    'Jun',
    'Jul',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const MONTH_DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const replaceMap = {
    M: (date) => Number(date.month),
    MM: (date) => {
        const month = date.month;
        return Number(month) < 10 ? `0${month}` : month;
    },
    MMM: (date) => MONTH_STR[Number(date.month)].substr(0, 3),
    MMMM: (date) => MONTH_STR[Number(date.month)],
    D: (date) => Number(date.date),
    d: (date) => replaceMap.D(date),
    DD: (date) => {
        const dayInMonth = date.date;
        return Number(dayInMonth) < 10 ? `0${dayInMonth}` : dayInMonth;
    },
    dd: (date) => replaceMap.DD(date),
    YY: (date) => Number(date.year) % 100,
    yy: (date) => replaceMap.YY(date),
    YYYY: (date) => {
        let prefix = '20';
        const year = date.year;
        if (year > 69 && year < 100) {
            prefix = '19';
        }
        return Number(year) < 100 ? prefix + String(year) : year;
    },
    yyyy: (date) => replaceMap.YYYY(date),
    A: (date) => date.meridiem,
    a: (date) => date.meridiem,
    hh: (date) => {
        const hour = date.hour;
        return Number(hour) < 10 ? '0' + hour : hour;
    },
    HH: (date) => replaceMap.hh(date),
    h: (date) => String(Number(date.hour)),
    H: (date) => replaceMap.h(date),
    m: (date) => String(Number(date.minute)),
    mm: (date) => {
        const minute = date.minute;
        return Number(minute) < 10 ? `0${minute}` : minute;
    },
    s: (date) => String(Number(date.second)),
    ss: (date) => {
        const second = date.second;
        return Number(second) < 10 ? `0${second}` : second;
    },
};
function isLeapYear(month, year) {
    return month === 2 && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function isValidDate(y, m, d) {
    const year = Number(y);
    const month = Number(m);
    const date = Number(d);
    const isValidYear = (year > -1 && year < 100) || (year > 1969 && year < 2070);
    const isValidMonth = month > 0 && month < 13;
    if (!isValidYear || !isValidMonth) {
        return false;
    }
    const lastDayInMonth = isLeapYear(month, year) ? 29 : MONTH_DAYS[month];
    return date > 0 && date <= lastDayInMonth;
}
/*
 * key             | Shorthand
 * --------------- |-----------------------
 * years           | YY / YYYY / yy / yyyy
 * months(n)       | M / MM
 * months(str)     | MMM / MMMM
 * days            | D / DD / d / dd
 * hours           | H / HH / h / hh
 * minutes         | m / mm
 * seconds         | s / ss
 * meridiem(AM,PM) | A / a
 */
export function formatDate(form, date, option) {
    var _a, _b, _c;
    const am = (_b = (_a = option) === null || _a === void 0 ? void 0 : _a.meridiemSet.AM, (_b !== null && _b !== void 0 ? _b : 'AM'));
    const pm = ((_c = option) === null || _c === void 0 ? void 0 : _c.meridiemSet.PM) || 'PM';
    let nDate;
    if (isDate(date)) {
        nDate = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            date: date.getDate(),
            hour: date.getHours(),
            minute: date.getMinutes(),
            second: date.getSeconds(),
        };
    }
    else {
        const { year, month, hour, minute, second } = date;
        nDate = { year, month, date: date.date, hour, minute, second };
    }
    if (!isValidDate(nDate.year, nDate.month, nDate.date)) {
        return '';
    }
    nDate.meridiem = '';
    if (/([^\\]|^)[aA]\b/.test(form)) {
        if (nDate.hour > 12) {
            // See the clock system: https://en.wikipedia.org/wiki/12-hour_clock
            nDate.hour %= 12;
        }
        if (nDate.hour === 0) {
            nDate.hour = 12;
        }
        nDate.meridiem = nDate.hour > 11 ? pm : am;
    }
    return form.replace(tokens, (key) => {
        if (key.indexOf('\\') > -1) {
            // escape character
            return key.replace(/\\/, '');
        }
        return replaceMap[key](nDate) || '';
    });
}
