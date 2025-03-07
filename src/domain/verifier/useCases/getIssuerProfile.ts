import { request } from '@blockcerts/explorer-lookup';
import { VerifierError } from '../../../models';
import { getText } from '../../i18n/useCases';
import type { Issuer } from '../../../models/Issuer';
import domain from '../../../domain';
import type { IDidDocument } from '../../../models/DidDocument';

// TODO: move these functions to url helper
function isValidUrl (url: string): boolean {
  // https://stackoverflow.com/a/15734347/4064775
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
}

export function isDidUri (url: string): boolean {
  return url.startsWith('did:', 0);
}

export function isDidKey (url: string): boolean {
  return url.startsWith('did:key:', 0);
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
  const validTypes: string[] = ['issuer', 'profile', 'blockcertsissuerprofile']; // https://w3id.org/openbadges#Profile
  const { type } = profile;
  if (!type) {
    return false;
  }

  if (Array.isArray(type)) {
    return type.some(type => validTypes.includes(type.toLowerCase()));
  }

  return validTypes.includes(type.toLowerCase());
}

function createIssuerProfileFromDidKey (didDocument: IDidDocument): Issuer {
  return {
    '@context': [
      'https://w3id.org/openbadges/v2',
      'https://w3id.org/blockcerts/3.0'
    ],
    publicKey: [
      {
        created: new Date().toISOString(),
        id: didDocument.id.split(':').pop()
      }
    ]
  };
}

export default async function getIssuerProfile (issuerAddress: Issuer | string): Promise<Issuer> {
  const errorMessage = getText('errors', 'getIssuerProfile');
  if (!issuerAddress) {
    throw new VerifierError('getIssuerProfile', `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  if (typeof issuerAddress === 'object') {
    issuerAddress = issuerAddress.id;
  }

  let issuerProfile: Issuer;
  if (isDidUri(issuerAddress)) {
    // TODO: it could be that the issuer profile is embedded, or that it is distant,
    //  but we found a did document so the rest of the function does not apply
    try {
      const didDocument: IDidDocument = await domain.did.resolve(issuerAddress);
      if (isDidKey(issuerAddress)) {
        issuerProfile = createIssuerProfileFromDidKey(didDocument);
      } else {
        const issuerProfileUrl = domain.did.getIssuerProfileUrl(didDocument);
        if (issuerProfileUrl) {
          issuerProfile = await getIssuerProfile(issuerProfileUrl);
        }
      }
      return {
        didDocument,
        ...issuerProfile
      };
    } catch (e) {
      console.error(e);
      throw new VerifierError('getIssuerProfile', `${errorMessage} - ${e as string}`);
    }
  } else if (!isValidUrl(issuerAddress)) {
    throw new VerifierError('getIssuerProfile', `${errorMessage} - ${getText('errors', 'issuerProfileNotSet')}`);
  }

  issuerProfile = JSON.parse(await request({ url: issuerAddress }).catch((error) => {
    console.error(error);
    throw new VerifierError('getIssuerProfile', errorMessage);
  }));

  if (!isValidProfile(issuerProfile) && !isValidV1Profile(issuerProfile)) {
    throw new VerifierError('getIssuerProfile', `${errorMessage} - ${getText('errors', 'issuerProfileInvalid')}`);
  }

  return issuerProfile;
}
