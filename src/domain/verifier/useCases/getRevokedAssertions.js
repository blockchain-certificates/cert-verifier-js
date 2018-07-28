import { request } from '../../../promisifiedRequests';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';

export default function getRevokedAssertions (revocationListUrl) {
  if (!revocationListUrl) {
    return Promise.resolve([]);
  }
  return new Promise((resolve, reject) => {
    return request({url: revocationListUrl})
      .then(function (response) {
        try {
          let issuerRevocationJson = JSON.parse(response);
          let revokedAssertions = issuerRevocationJson.revokedAssertions
            ? issuerRevocationJson.revokedAssertions
            : [];
          resolve(revokedAssertions);
        } catch (err) {
          reject(new VerifierError(SUB_STEPS.parseIssuerKeys, `Unable to get revocation assertion`));
        }
      })
      .catch(function () {
        reject(new VerifierError(SUB_STEPS.parseIssuerKeys, `Unable to get revocation assertion`));
      });
  });
}
