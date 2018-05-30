function noOffset(s) {
  let day = s.slice(0, -5).split(/\D/).map(function(itm) {
    return parseInt(itm, 10) || 0;
  });
  day[1] -= 1;
  day = new Date(Date.UTC.apply(Date, day));
  let offsetString = s.slice(-5);
  let offset = parseInt(offsetString, 10) / 100;
  if (offsetString.slice(0, 1) === '+') offset *= -1;
  day.setHours(day.getHours() + offset);
  return day.getTime();
}

function dateFromRegex(s) {
  let day;
  let tz;
  let rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/,
    p = rx.exec(s) || [];
  if (p[1]) {
    day = p[1].split(/\D/).map(function(itm) {
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

function dateFromIso(isoDate) {
  // Chrome
  let diso = Date.parse(isoDate);
  if (diso) {
    return new Date(diso);
  }

  // JS 1.8 gecko
  let offsetDate = noOffset(isoDate);
  if (offsetDate) {
    return offsetDate;
  }

  return dateFromRegex(isoDate);
}

export function dateToUnixTimestamp(date) {
  return dateFromIso(date);
}
