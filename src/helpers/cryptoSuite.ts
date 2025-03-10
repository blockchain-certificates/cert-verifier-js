export function cryptoSuiteToType (cryptoSuite: string): string {
  // transform kebab-case to camelCase and capitalize first char to fall back to legacy name
  // NOTE: this might be a bit naive but works in the case of MerkleProof2019 which at this time
  // is the only implementation
  // A better approach could be to use a map, but it can be tedious
  cryptoSuite = cryptoSuite.replace(/-./g, x => x[1].toUpperCase());
  return cryptoSuite.charAt(0).toUpperCase() + cryptoSuite.slice(1);
}
