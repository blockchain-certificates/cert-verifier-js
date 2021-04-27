import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';
import { getText } from '../domain/i18n/useCases';
import { IssuerPublicKeyList, ParsedKeyObjectV2 } from '../models/Issuer';

function getCaseInsensitiveKey (obj: IssuerPublicKeyList, value: string): ParsedKeyObjectV2 {
  let key = null;
  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      if (prop.toLowerCase() === value.toLowerCase()) {
        key = prop;
      }
    }
  }
  return obj[key];
}

export default function ensureValidIssuingKey (keyMap: IssuerPublicKeyList, txIssuingAddress: string, txTime: string): void {
  let validKey = false;
  const theKey: ParsedKeyObjectV2 = getCaseInsensitiveKey(keyMap, txIssuingAddress);
  const txTimeToUnixTimestamp = dateToUnixTimestamp(txTime);
  if (theKey) {
    validKey = true;
    if (theKey.created) {
      validKey = txTimeToUnixTimestamp >= theKey.created;
    }
    if (theKey.revoked) {
      validKey = txTimeToUnixTimestamp <= theKey.revoked;
    }
    if (theKey.expires) {
      validKey = txTimeToUnixTimestamp <= theKey.expires;
    }
  }
  if (!validKey) {
    throw new VerifierError(
      SUB_STEPS.checkAuthenticity,
      getText('errors', 'unknownIssuingAddress')
    );
  }
}
