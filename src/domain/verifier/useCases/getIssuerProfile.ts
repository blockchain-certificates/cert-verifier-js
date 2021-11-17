import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../../../models';
import { SUB_STEPS } from '../../../constants';
import { getText } from '../../i18n/useCases';
import { Issuer } from '../../../models/Issuer';
import domain from '../../../domain';

function isValidUrl (url: string): boolean {
  // https://stackoverflow.com/a/15734347/4064775
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

function isDidUri (url: string): boolean {
  return url.startsWith('did:', 0);
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

/**
 * getIssuerProfile
 *
 * @param issuerAddress: string
 * @returns {Promise<any>}
 */
export default async function getIssuerProfile (issuerAddress: Issuer | string): Promise<Issuer> {
  const errorMessage = getText('errors', 'getIssuerProfile');
  if (!issuerAddress) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  if (typeof issuerAddress === 'object') {
    issuerAddress = issuerAddress.id;
  }

  let issuerProfile: Issuer;

  if (isDidUri(issuerAddress)) {
    // TODO: it could be that the issuer profile is embedded, or that it is distant,
    //  but we found a did document so the rest of the function does not apply
    try {
      const didDocument = await domain.did.resolve(issuerAddress);
      const issuerProfileUrl = await domain.did.getIssuerProfileUrl(didDocument);
      if (issuerProfileUrl) {
        issuerProfile = await getIssuerProfile(issuerProfileUrl);
      }
      return {
        // TODO: return more data from the issuer profile
        didDocument,
        ...issuerProfile
      };
    } catch (e) {
      throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${e as string}`);
    }
  } else if (!isValidUrl(issuerAddress)) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  issuerProfile = JSON.parse(await request({ url: issuerAddress }).catch(() => {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, errorMessage);
  }));

  if (!isValidProfile(issuerProfile) && !isValidV1Profile(issuerProfile)) {
    throw new VerifierError(SUB_STEPS.getIssuerProfile, `${errorMessage} - ${getText('errors', 'issuerProfileInvalid')}`);
  }

  return issuerProfile;
}
