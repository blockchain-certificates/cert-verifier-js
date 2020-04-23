/* eslint no-useless-escape: 0 prefer-spread: 0 */

function noOffset (s): number {
  let day = s.slice(0, -5).split(/\D/).map(function (itm) {
    return parseInt(itm, 10) || 0;
  });
  day[1] -= 1;
  day = new Date(Date.UTC.apply(Date, day));
  const offsetString = s.slice(-5);
  let offset = parseInt(offsetString, 10) / 100;
  if (offsetString.slice(0, 1) === '+') offset *= -1;
  day.setHours(day.getHours() + offset);
  return day.getTime();
}

function dateFromRegex (s: string) {
  let day;
  let tz;
  const rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;
  const p = rx.exec(s) || [];
  if (p[1]) {
    day = p[1].split(/\D/).map(function (itm) {
      return parseInt(itm, 10) || 0;
    });
    day[1] -= 1;
    day = new Date(Date.UTC.apply(Date, day));
    if (!day.getDate()) return NaN;
    if (p[5]) {
      tz = parseInt(p[5], 10) / 100 * 60;
      if (p[6]) tz += parseInt(p[6], 10);
      if (p[4] === '+') tz *= -1;
      if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
    }
    return day;
  }
  return NaN;
}

function dateFromIso (isoDate: string) {
  // Chrome
  const diso: number = Date.parse(isoDate);
  if (diso) {
    return new Date(diso);
  }

  // JS 1.8 gecko
  const offsetDate: number = noOffset(isoDate);
  if (offsetDate) {
    return offsetDate;
  }

  return dateFromRegex(isoDate);
}

export function dateToUnixTimestamp (date: Date | string) {
  if (date === '') {
    return '';
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return dateFromIso(`${date}`);
}

export function timestampToDateObject (timestamp: number): Date {
  return new Date(timestamp * 1000);
}
