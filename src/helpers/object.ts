export function deepCopy<T = any> (obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
