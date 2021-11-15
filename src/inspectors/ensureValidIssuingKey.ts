import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import { SUB_STEPS } from '../constants/verificationSubSteps';
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
      SUB_STEPS.checkAuthenticity,
      getText('errors', errorMessage)
    );
  }
}
