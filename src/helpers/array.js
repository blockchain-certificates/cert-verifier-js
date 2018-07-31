export function intersect (array1 = [], array2 = []) {
  return array1.filter(value => array2.indexOf(value) !== -1).filter((e, i, c) => c.indexOf(e) === i);
}
