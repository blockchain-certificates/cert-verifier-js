import getText from './getText';

function replaceMonth (pattern: string, monthIndex: number): string {
  const months = getText('date', 'months');
  return pattern.replace('MM', months[monthIndex]);
}

function replaceDay (pattern: string, day: string): string {
  return pattern.replace('DD', day);
}

function replaceYear (pattern: string, year: string): string {
  return pattern.replace('YYYY', year);
}

export default function getDateFormat (date: string): string {
  const pattern = getText('date', 'pattern');
  if (date.slice(-1) === 'Z') {
    date = date.slice(0, date.length - 1);
  } else if (date.includes('+')) {
    date = date.split('+')[0];
  }
  const objDate = new Date(date);

  let formattedDate = replaceMonth(pattern, objDate.getMonth());
  formattedDate = replaceDay(formattedDate, objDate.getDate().toString(10));
  formattedDate = replaceYear(formattedDate, objDate.getFullYear().toString(10));
  return formattedDate;
}
