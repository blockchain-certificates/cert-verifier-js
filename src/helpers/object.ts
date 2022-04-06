import cloneDeep from 'lodash.clonedeep';

export function deepCopy<T = any> (obj: T): T {
  return cloneDeep(obj);
}

export function isObject (candidate: any): boolean {
  return candidate === Object(candidate);
}
