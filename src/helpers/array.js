/**
 * intersect
 *
 * Returns the similarities between two arrays (removing duplicates as well)
 *
 * @param array1
 * @param array2
 * @returns {*[]}
 */
export function intersect (array1 = [], array2 = []) {
  return array1.filter(value => array2.indexOf(value) !== -1).filter((element, index, arr) => arr.indexOf(element) === index);
}
