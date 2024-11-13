import domain from '../domain';
import type { Issuer } from '../models/Issuer';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { ParsedCertificate } from './index';

function getPropertyValueForCurrentLanguage (propertyName: string, field: any, locale: string): string {
  if (typeof field === 'undefined') {
    return '';
  }

  if (typeof field === 'string') {
    return field;
  }

  if (!Array.isArray(field)) {
    field = [field];
  }

  return field
    // find value by exact match
    .find((f) => f['@language'] === locale)?.[propertyName] ??
    // find value by shorthand (ie. 'en-US' -> 'en')
    field.find((f) => f['@language']?.split('-')[0] === locale.split('-')[0])?.[propertyName] ??
    field[0][propertyName];
}

export default async function parseV3 (certificateJson: BlockcertsV3, locale: string): Promise<ParsedCertificate> {
  const {
    issuer: issuerProfileUrl,
    metadataJson, metadata,
    issuanceDate,
    id,
    expirationDate,
    display,
    validUntil,
    proof,
    name,
    description,
    credentialSubject
  } = certificateJson;
  try {
    domain.verifier.validateVerifiableCredential(certificateJson);
  } catch (error) {
    throw new Error(`Document presented is not a valid Verifiable Credential: ${error.message}`);
  }
  let { validFrom } = certificateJson;
  const certificateMetadata = metadata ?? metadataJson;
  const issuer: Issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
  if (!validFrom) {
    let proofObject = proof;
    if (Array.isArray(proof)) {
      proofObject = proof[0];
    }
    validFrom = (proofObject as VCProof).created;
  }
  return {
    display,
    expires: expirationDate ?? validUntil,
    validFrom,
    issuedOn: issuanceDate ?? validFrom, // maintain backwards compatibility
    id,
    issuer,
    name: getPropertyValueForCurrentLanguage('@value', name, locale),
    description: getPropertyValueForCurrentLanguage('@value', description, locale),
    metadataJson: certificateMetadata,
    recipientFullName: getPropertyValueForCurrentLanguage('name', credentialSubject, locale),
    recordLink: id
  };
}
