enum Versions {
  V1_1 = '1.1',
  V1_2 = '1.2'
}

export function isV1 (version: Versions): boolean {
  return version === Versions.V1_1 || version === Versions.V1_2;
}

export default Versions;
