import { dateToUnixTimestamp } from '../helpers/date';
import VerifierError from '../models/verifierError';
import * as SUB_STEPS from '../constants/verificationSubSteps';

function getCaseInsensitiveKey (obj, value) {
  let key = null;
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (prop.toLowerCase() === value.toLowerCase()) {
        key = prop;
      }
    }
  }
  return obj[key];
}

export default function ensureValidIssuingKey (keyMap, txIssuingAddress, txTime) {
  let validKey = false;
  const theKey = getCaseInsensitiveKey(keyMap, txIssuingAddress);
  txTime = dateToUnixTimestamp(txTime);
  if (theKey) {
    validKey = true;
    if (theKey.created) {
      validKey &= txTime >= theKey.created;
    }
    if (theKey.revoked) {
      validKey &= txTime <= theKey.revoked;
    }
    if (theKey.expires) {
      validKey &= txTime <= theKey.expires;
    }
  }
  if (!validKey) {
    throw new VerifierError(
      SUB_STEPS.checkAuthenticity,
      'Transaction occurred at time when issuing address was not considered valid.'
    );
  }
}
