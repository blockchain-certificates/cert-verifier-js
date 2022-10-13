import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants/verificationSteps';
import { getText } from '../../i18n/useCases';
import type { RevocationList, RevokedAssertion } from '../../../models/RevokedAssertions';
import { safelyAppendUrlParameter } from '../../../helpers/url';

const ASSERTION_ID_NAME: string = 'assertionId';

export default async function getRevokedAssertions (revocationListUrl: string, assertionId?: string): Promise<RevokedAssertion[]> {
  if (!revocationListUrl) {
    return [];
  }

  const errorMessage: string = getText('errors', 'getRevokedAssertions');

  if (assertionId) {
    revocationListUrl = safelyAppendUrlParameter(revocationListUrl, ASSERTION_ID_NAME, encodeURIComponent(assertionId));
  }

  try {
    const response: any = await request({ url: revocationListUrl });
    const issuerRevocationJson: RevocationList = JSON.parse(response);
    return issuerRevocationJson.revokedAssertions ?? [];
  } catch (e) {
    console.error(e);
    throw new VerifierError(SUB_STEPS.checkRevokedStatus, errorMessage);
  }
}
