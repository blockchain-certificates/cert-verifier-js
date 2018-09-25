import { request } from '../../../services';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';
import { getText } from '../../i18n/useCases';

/**
 * getIssuerProfile
 *
 * @param issuerId
 * @returns {Promise<any>}
 */
export default async function getIssuerProfile (issuerId) {
  const errorMessage = getText('errors', 'getIssuerProfile');
  if (!issuerId) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, errorMessage);
  }

  const response = await request({url: issuerId}).catch(() => {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, errorMessage);
  });

  return JSON.parse(response);
}
