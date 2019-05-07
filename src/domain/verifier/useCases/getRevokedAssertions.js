import { request } from '../../../services';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';
import { getText } from '../../i18n/useCases';

export default async function getRevokedAssertions (revocationListUrl) {
  if (!revocationListUrl) {
    return Promise.resolve([]);
  }

  const errorMessage = getText('errors', 'getRevokedAssertions');

  const response = await request({ url: revocationListUrl }).catch(() => {
    throw new VerifierError(SUB_STEPS.parseIssuerKeys, errorMessage);
  });

  let issuerRevocationJson = JSON.parse(response);
  return issuerRevocationJson.revokedAssertions
    ? issuerRevocationJson.revokedAssertions
    : [];
}
