export function intersect (array1: any[] = [], array2: any[] = []): any[] {
  return array1.filter(value =>
    array2.includes(value)
  ).filter((element, index, arr) => arr.indexOf(element) === index);
}

export function difference (array1: any[] = [], array2: any[] = []): any[] {
  return array2.filter(value => !array1.includes(value));
}

export function lastEntry (array: any[]): any {
  return array[array.length - 1];
}

export function removeEntry (map: any[], key: any): void {
  const stepIndex = map.findIndex(entry => entry === key);
  if (stepIndex > -1) {
    // delete by reference
    map.splice(stepIndex, 1);
  }
}
