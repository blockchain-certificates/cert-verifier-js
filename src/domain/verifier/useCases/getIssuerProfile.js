import { request } from '../../../promisifiedRequests';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';

export default function getIssuerProfile (issuerId) {
  let issuerProfileFetcher = new Promise((resolve, reject) => {
    return request({url: issuerId})
      .then(response => {
        try {
          let issuerProfileJson = JSON.parse(response);
          resolve(issuerProfileJson);
        } catch (err) {
          reject(new VerifierError(SUB_STEPS.getIssuerProfile, err));
        }
      })
      .catch(() => {
        reject(new VerifierError(SUB_STEPS.getIssuerProfile, `Unable to get issuer profile`));
      });
  });
  return issuerProfileFetcher;
}
