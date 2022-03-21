import { dateToUnixTimestamp } from '../../../helpers/date';
import { SUB_STEPS } from '../../../constants';
import { Key, VerifierError } from '../../../models';
import { getText } from '../../i18n/useCases';
import type { NullableNumber } from '../../../models/helpers';
import type { Issuer, IssuerPublicKeyList } from '../../../models/Issuer';

/**
 * createKeyObject
 *
 * @param rawKeyObject
 * @param finalPublicKey
 * @returns {Key}
 */
function createKeyObject (rawKeyObject, finalPublicKey = null): Key {
  const created: NullableNumber = rawKeyObject.created ? dateToUnixTimestamp(rawKeyObject.created) : null;
  const revoked: NullableNumber = rawKeyObject.revoked ? dateToUnixTimestamp(rawKeyObject.revoked) : null;
  const expires: NullableNumber = rawKeyObject.expires ? dateToUnixTimestamp(rawKeyObject.expires) : null;
  // backcompat for v2 alpha
  let publicKey: string = finalPublicKey;
  if (!finalPublicKey) {
    const publicKeyTemp: string = rawKeyObject.id || rawKeyObject.publicKey;
    publicKey = publicKeyTemp.replace('ecdsa-koblitz-pubkey:', '');
  }
  return new Key(publicKey, created, revoked, expires);
}

/**
 * parseIssuerKeys
 *
 * @param issuerProfileJson
 */
export default function parseIssuerKeys (issuerProfileJson: Issuer): IssuerPublicKeyList {
  try {
    const keyMap: IssuerPublicKeyList = {};
    if ('@context' in issuerProfileJson) {
      // backcompat for v2 alpha
      const responseKeys = issuerProfileJson.publicKey || issuerProfileJson.publicKeys;
      for (let i = 0; i < responseKeys.length; i++) {
        const key = createKeyObject(responseKeys[i]);
        keyMap[key.publicKey] = key;
      }
    } else {
      // This is a v2 certificate with a v1 issuer
      const issuerKeys = issuerProfileJson.issuerKeys || [];
      const key = createKeyObject({}, issuerKeys[0].key);
      keyMap[key.publicKey] = key;
    }
    return keyMap;
  } catch (e) {
    throw new VerifierError(
      SUB_STEPS.parseIssuerKeys,
      getText('errors', 'parseIssuerKeys')
    );
  }
}
