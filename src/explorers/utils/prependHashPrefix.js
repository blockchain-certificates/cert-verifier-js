import { startsWith } from '../../helpers/string';

export function prependHashPrefix (remoteHash, prefixes) {
  for (let i = 0; i < prefixes.length; i++) {
    let prefix = prefixes[i];
    if (!startsWith(remoteHash, prefix)) {
      return `${prefix}${remoteHash}`;
    }
  }
  return remoteHash;
}
