import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';
import getIssuerProfile from './getIssuerProfile';
import parseIssuerKeys from './parseIssuerKeys';

export default function getIssuerKeys (issuerId) {
  let issuerKeyFetcher = new Promise((resolve, reject) => {
    return getIssuerProfile(issuerId)
      .then(function (issuerProfileJson) {
        try {
          let issuerKeyMap = parseIssuerKeys(issuerProfileJson);
          resolve(issuerKeyMap);
        } catch (err) {
          reject(new VerifierError(SUB_STEPS.parseIssuerKeys, err));
        }
      })
      .catch(function (err) {
        reject(new VerifierError(SUB_STEPS.parseIssuerKeys, err));
      });
  });
  return issuerKeyFetcher;
}
