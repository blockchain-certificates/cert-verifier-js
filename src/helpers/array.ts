/**
 * intersect
 *
 * Returns the similarities between two arrays (removing duplicates as well)
 *
 * @param array1
 * @param array2
 * @returns {*[]}
 */
export function intersect (array1: any[] = [], array2: any[] = []): any[] {
  return array1.filter(value => array2.includes(value)).filter((element, index, arr) => arr.indexOf(element) === index);
}
