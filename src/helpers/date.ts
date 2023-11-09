/* eslint no-useless-escape: 0 prefer-spread: 0 */ // TODO: at some point fix this

function noOffset (s): Date {
  let day = s.slice(0, -5).split(/\D/).map(function (itm) {
    return parseInt(itm, 10) || 0;
  });
  day[1] -= 1;
  day = new Date(Date.UTC.apply(Date, day));
  const offsetString = s.slice(-5);
  let offset = parseInt(offsetString, 10) / 100;
  if (offsetString.slice(0, 1) === '+') {
    offset *= -1;
  }
  day.setHours(day.getHours() + offset);
  return day;
}

function dateFromRegex (s: string): Date {
  let day;
  let tz;
  const rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;
  const p = rx.exec(s) ?? [];
  if (p[1]) {
    day = p[1].split(/\D/).map(function (itm) {
      return parseInt(itm, 10) || 0;
    });
    day[1] -= 1;
    day = new Date(Date.UTC.apply(Date, day));
    if (!day.getDate()) {
      return null;
    }
    if (p[5]) {
      tz = parseInt(p[5], 10) / 100 * 60;
      if (p[6]) {
        tz += parseInt(p[6], 10);
      }
      if (p[4] === '+') {
        tz *= -1;
      }
      if (tz) {
        day.setUTCMinutes(day.getUTCMinutes() + tz);
      }
    }
    return day;
  }
  return null;
}

function dateFromIso (isoDate: string): Date {
  // Chrome
  const diso: number = Date.parse(isoDate);
  if (diso) {
    return new Date(diso);
  }

  // JS 1.8 gecko
  const offsetDate: Date = noOffset(isoDate);
  if (offsetDate) {
    return offsetDate;
  }

  return dateFromRegex(isoDate);
}

export function dateToUnixTimestamp (date: Date | string): number { // TODO: cleanup this mess of types
  if (date === '') {
    return 0;
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return dateFromIso(`${date}`).getTime();
}

export function timestampToDateObject (timestamp: number): Date {
  return new Date(timestamp * 1000);
}
