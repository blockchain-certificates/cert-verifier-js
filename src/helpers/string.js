export function startsWith (stringContent, pattern) {
  if (typeof stringContent !== 'string') {
    console.warn('Trying to test a non string variable');
    return false;
  }
  return stringContent.indexOf(pattern) === 0;
}

export function capitalize (value) {
  const firstLetter = value.substr(0, 1);
  const rest = value.substr(1, value.length - 1);
  return firstLetter.toUpperCase() + rest.toLowerCase();
}
