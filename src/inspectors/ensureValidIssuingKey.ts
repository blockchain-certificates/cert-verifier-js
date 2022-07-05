import { dateToUnixTimestamp } from '../helpers/date.js';
import VerifierError from '../models/VerifierError.js';
import domain from '../domain/index.js';
import type { IssuerPublicKeyList, ParsedKeyObjectV2 } from '../models/Issuer.js';

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

export default function ensureValidIssuingKey (keyMap: IssuerPublicKeyList, txIssuingAddress: string, txTime: Date | string): void {
  let errorMessage: string = '';
  const theKey: ParsedKeyObjectV2 = getCaseInsensitiveKey(keyMap, txIssuingAddress);
  const txTimeToUnixTimestamp = dateToUnixTimestamp(txTime);
  if (theKey) {
    if (theKey.created && txTimeToUnixTimestamp <= theKey.created) {
      errorMessage = 'invalidIssuingAddressCreationTime';
    }
    if (theKey.revoked && txTimeToUnixTimestamp >= theKey.revoked) {
      errorMessage = 'invalidIssuingAddressRevoked';
    }
    if (theKey.expires && txTimeToUnixTimestamp >= theKey.expires) {
      errorMessage = 'invalidIssuingAddressExpired';
    }
  } else {
    errorMessage = 'invalidIssuingAddressUnknown';
  }

  if (errorMessage) {
    throw new VerifierError(
      'checkAuthenticity',
      domain.i18n.getText('errors', errorMessage)
    );
  }
}
