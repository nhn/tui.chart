// https://github.com/nhn/tui.code-snippet/blob/master/formatDate/formatDate.js

import { isDate } from '@src/helpers/utils';

const tokens = /[\\]*YYYY|[\\]*YY|[\\]*MMMM|[\\]*MMM|[\\]*MM|[\\]*M|[\\]*DD|[\\]*D|[\\]*HH|[\\]*H|[\\]*A/gi;
const MONTH_STR = [
  'Invalid month',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
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

    return Number(month) < 10 ? '0' + month : month;
  },
  MMM: (date) => MONTH_STR[Number(date.month)].substr(0, 3),
  MMMM: (date) => MONTH_STR[Number(date.month)],
  D: (date) => Number(date.date),
  d: (date) => replaceMap.D(date), // eslint-disable-line new-cap
  DD: (date) => {
    const dayInMonth = date.date;

    return Number(dayInMonth) < 10 ? '0' + dayInMonth : dayInMonth;
  },
  dd: (date) => replaceMap.DD(date), // eslint-disable-line new-cap
  YY: function (date) {
    return Number(date.year) % 100;
  },
  yy: function (date) {
    return replaceMap.YY(date); // eslint-disable-line new-cap
  },
  YYYY: function (date) {
    let prefix = '20';
    const year = date.year;
    if (year > 69 && year < 100) {
      prefix = '19';
    }

    return Number(year) < 100 ? prefix + String(year) : year;
  },
  yyyy: function (date) {
    return replaceMap.YYYY(date); // eslint-disable-line new-cap
  },
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

    return Number(minute) < 10 ? '0' + minute : minute;
  },
};

// eslint-disable-next-line complexity
function isValidDate(year: number, month: number, date: number) {
  year = Number(year);
  month = Number(month);
  date = Number(date);

  const isValidYear = (year > -1 && year < 100) || (year > 1969 && year < 2070);
  const isValidMonth = month > 0 && month < 13;

  if (!isValidYear || !isValidMonth) {
    return false;
  }

  let lastDayInMonth = MONTH_DAYS[month];
  if (month === 2 && year % 4 === 0) {
    if (year % 100 !== 0 || year % 400 === 0) {
      lastDayInMonth = 29;
    }
  }

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
 * meridiem(AM,PM) | A / a
 */
export function formatDate(
  form: string,
  date: Date | { year: number; month: number; date: number; hour: number; minute: number },
  option?: { meridiemSet: { AM?: string; PM?: string } }
) {
  // eslint-disable-line complexity
  const am = option?.meridiemSet.AM ?? 'AM';
  const pm = option?.meridiemSet.PM || 'PM';
  let nDate;

  if (isDate(date)) {
    nDate = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  } else {
    nDate = {
      year: date.year,
      month: date.month,
      date: date.date,
      hour: date.hour,
      minute: date.minute,
    };
  }

  if (!isValidDate(nDate.year, nDate.month, nDate.date)) {
    return false;
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

  return form.replace(tokens, function (key) {
    if (key.indexOf('\\') > -1) {
      // escape character
      return key.replace(/\\/, '');
    }

    return replaceMap[key](nDate) || '';
  });
}
