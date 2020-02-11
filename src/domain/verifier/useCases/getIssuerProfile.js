import { request } from '../../../services';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';
import { getText } from '../../i18n/useCases';

/**
 * getIssuerProfile
 *
 * @param issuerAddress
 * @returns {Promise<any>}
 */
export default async function getIssuerProfile (issuerAddress) {
  const errorMessage = getText('errors', 'getIssuerProfile');
  if (!issuerAddress) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, errorMessage);
  }

  if (typeof issuerAddress === 'object') {
    issuerAddress = issuerAddress.id;
  }

  const response = await request({ url: issuerAddress }).catch(() => {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, errorMessage);
  });

  return JSON.parse(response);
}
