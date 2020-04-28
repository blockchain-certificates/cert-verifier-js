import { startsWith } from '../../helpers/string';

export function stripHashPrefix (remoteHash: string, prefixes: string[]): string {
  for (let i = 0; i < prefixes.length; i++) {
    const prefix = prefixes[i];
    if (startsWith(remoteHash, prefix)) {
      return remoteHash.slice(prefix.length);
    }
  }
  return remoteHash;
}
