import { request } from '@blockcerts/explorer-lookup';
import domain from '../../../domain/index.js';
import VerifierError from '../../../models/VerifierError.js';
import { SUB_STEPS } from '../../../constants/verificationSteps.js';
import { safelyAppendUrlParameter } from '../../../helpers/url.js';
import type { RevocationList, RevokedAssertion } from '../../../models/RevokedAssertions.js';

const ASSERTION_ID_NAME: string = 'assertionId';

export default async function getRevokedAssertions (revocationListUrl: string, assertionId?: string): Promise<RevokedAssertion[]> {
  if (!revocationListUrl) {
    return [];
  }

  const errorMessage: string = domain.i18n.getText('errors', 'getRevokedAssertions');

  if (assertionId) {
    revocationListUrl = safelyAppendUrlParameter(revocationListUrl, ASSERTION_ID_NAME, encodeURIComponent(assertionId));
  }

  const response: any = await request({ url: revocationListUrl }).catch(() => {
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, errorMessage);
  });

  const issuerRevocationJson: RevocationList = JSON.parse(response);
  return issuerRevocationJson.revokedAssertions ?? [];
}
