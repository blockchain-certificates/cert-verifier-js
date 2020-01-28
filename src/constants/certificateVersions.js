/* eslint camelcase: 0 */
// Certificate versions
const V1_1 = '1.1';
const V1_2 = '1.2';
const V2_0 = '2.0';
const V3_0_alpha = '3.0-alpha';

export function isV3 (version) {
  return version === V3_0_alpha;
}

export default {
  V1_1,
  V1_2,
  V2_0,
  V3_0_alpha
};
