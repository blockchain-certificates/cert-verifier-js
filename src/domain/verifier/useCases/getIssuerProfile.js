import { request } from '../../../services';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';
import { getText } from '../../i18n/useCases';

function isValidUrl (url) {
  // https://stackoverflow.com/a/15734347/4064775
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

function isValidV1Profile (profile) {
  // eslint-disable-next-line camelcase
  const { issuer_key, revocation_key, issuerKeys, revocationKeys } = profile;
  // eslint-disable-next-line camelcase
  if (!!issuer_key && !!revocation_key) {
    // https://github.com/blockchain-certificates/cert-schema/blob/master/cert_schema/1.1/issuer-schema-v1-1.json
    return true;
  }

  if (issuerKeys && revocationKeys) {
    // https://github.com/blockchain-certificates/cert-schema/blob/master/cert_schema/1.2/issuer-id-1.2.json
    return true;
  }

  return false;
}

function isValidProfile (profile) {
  const validTypes = ['issuer', 'profile']; // https://w3id.org/openbadges#Profile
  const { type } = profile;
  if (!type) {
    return false;
  }

  if (Array.isArray(type)) {
    return type.some(type => validTypes.indexOf(type.toLowerCase()) > -1);
  }

  return validTypes.indexOf(type.toLowerCase()) > -1;
}

/**
 * getIssuerProfile
 *
 * @param issuerAddress: string
 * @returns {Promise<any>}
 */
export default async function getIssuerProfile (issuerAddress) {
  const errorMessage = getText('errors', 'getIssuerProfile');
  if (!issuerAddress) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  if (typeof issuerAddress === 'object') {
    issuerAddress = issuerAddress.id;
  }

  if (!isValidUrl(issuerAddress)) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  let response = await request({ url: issuerAddress }).catch(() => {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, errorMessage);
  });

  response = JSON.parse(response);

  if (!isValidProfile(response) && !isValidV1Profile(response)) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${getText('errors', 'issuerProfileInvalid')}`);
  }

  return response;
}
