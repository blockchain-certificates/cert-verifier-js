export function isDidUri (url: string): boolean {
  return url.startsWith('did:', 0);
}

export function isDidKey (url: string): boolean {
  return url.startsWith('did:key:', 0);
}

export function isDidTdw (url: string): boolean {
  return url.startsWith('did:tdw:', 0);
}
