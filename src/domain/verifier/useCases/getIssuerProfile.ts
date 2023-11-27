import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../../../models';
import { getText } from '../../i18n/useCases';
import type { Issuer } from '../../../models/Issuer';

// TODO: move these functions to url helper
function isValidUrl (url: string): boolean {
  // https://stackoverflow.com/a/15734347/4064775
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

function isValidV1Profile (profile: Issuer): boolean {
  // eslint-disable-next-line camelcase,@typescript-eslint/naming-convention
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

function isValidProfile (profile: Issuer): boolean {
  const validTypes: string[] = ['issuer', 'profile']; // https://w3id.org/openbadges#Profile
  const { type } = profile;
  if (!type) {
    return false;
  }

  if (Array.isArray(type)) {
    return type.some(type => validTypes.includes(type.toLowerCase()));
  }

  return validTypes.includes(type.toLowerCase());
}

export default async function getIssuerProfile (issuerAddress: Issuer | string): Promise<Issuer> {
  const errorMessage = getText('errors', 'getIssuerProfile');
  if (!issuerAddress) {
    throw new VerifierError('getIssuerProfile', `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  if (typeof issuerAddress === 'object') {
    issuerAddress = issuerAddress.id;
  }

  console.log(issuerAddress);

  if (!isValidUrl(issuerAddress)) {
    throw new VerifierError('getIssuerProfile', `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  const issuerProfile = JSON.parse(await request({ url: issuerAddress }).catch(() => {
    throw new VerifierError('getIssuerProfile', errorMessage);
  }));

  if (!isValidProfile(issuerProfile) && !isValidV1Profile(issuerProfile)) {
    throw new VerifierError('getIssuerProfile', `${errorMessage} - ${getText('errors', 'issuerProfileInvalid')}`);
  }

  return issuerProfile;
}
