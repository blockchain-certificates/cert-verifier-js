export default function parseRevocationKey (issuerProfileJson) {
  if (
    issuerProfileJson.revocationKeys &&
    issuerProfileJson.revocationKeys.length > 0
  ) {
    return issuerProfileJson.revocationKeys[0].key;
  }
  return null;
}
