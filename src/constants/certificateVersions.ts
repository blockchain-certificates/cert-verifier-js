enum Versions {
  V1_1 = '1.1',
  V1_2 = '1.2',
  V2_0 = '2.0',
  V3_0_alpha = '3.0-alpha',
  V3_0_beta = '3.0-beta',
  V3_0 = '3.0'
}
export function isV1 (version: Versions): boolean {
  return version === Versions.V1_1 || version === Versions.V1_2;
}

export default Versions;
