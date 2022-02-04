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

export function isV3 (version: Versions): boolean {
  const v3 = [Versions.V3_0_alpha, Versions.V3_0_beta, Versions.V3_0];
  return v3.includes(version);
}

export default Versions;
