import { request } from '../../../services';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';

export default async function getRevokedAssertions (revocationListUrl) {
  if (!revocationListUrl) {
    return Promise.resolve([]);
  }

  const errorMessage = 'Unable to get revocation assertions';

  const response = await request({url: revocationListUrl}).catch(() => {
    throw new VerifierError(SUB_STEPS.parseIssuerKeys, errorMessage);
  });

  let issuerRevocationJson = JSON.parse(response);
  return issuerRevocationJson.revokedAssertions
    ? issuerRevocationJson.revokedAssertions
    : [];
}
