/**
 * parseRevocationKey
 *
 * @param issuerProfileJson
 * @returns {*}
 */
export default function parseRevocationKey (issuerProfileJson) {
  if (!issuerProfileJson || !issuerProfileJson.hasOwnProperty('revocationKeys')) {
    return null;
  }
  if (issuerProfileJson.revocationKeys.length > 0) {
    return issuerProfileJson.revocationKeys[0].key;
  }
  return null;
}
