import { dateToUnixTimestamp } from '../../../helpers/date';
import { SUB_STEPS } from '../../../constants';
import { Key, VerifierError } from '../../../models';

export default function parseIssuerKeys (issuerProfileJson) {
  try {
    var keyMap = {};
    var k;
    if ('@context' in issuerProfileJson) {
      // backcompat for v2 alpha
      var responseKeys =
        issuerProfileJson.publicKey || issuerProfileJson.publicKeys;
      for (var i = 0; i < responseKeys.length; i++) {
        var key = responseKeys[i];
        var created = key.created ? dateToUnixTimestamp(key.created) : null;
        var revoked = key.revoked ? dateToUnixTimestamp(key.revoked) : null;
        var expires = key.expires ? dateToUnixTimestamp(key.expires) : null;
        // backcompat for v2 alpha
        var publicKeyTemp = key.id || key.publicKey;
        var publicKey = publicKeyTemp.replace('ecdsa-koblitz-pubkey:', '');
        k = new Key(publicKey, created, revoked, expires);
        keyMap[k.publicKey] = k;
      }
    } else {
      // This is a v2 certificate with a v1 issuer
      const issuerKeys = issuerProfileJson.issuerKeys || [];
      var issuerKey = issuerKeys[0].key;
      k = new Key(issuerKey, null, null, null);
      keyMap[k.publicKey] = k;
    }
    return keyMap;
  } catch (e) {
    throw new VerifierError(
      SUB_STEPS.parseIssuerKeys,
      'Unable to parse JSON out of issuer identification data.'
    );
  }
}
