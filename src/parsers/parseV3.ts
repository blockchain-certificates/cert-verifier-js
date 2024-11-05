import domain from '../domain';
import type { Issuer } from '../models/Issuer';
import type { BlockcertsV3, MultilingualVcField, VCProof } from '../models/BlockcertsV3';
import type { ParsedCertificate } from './index';

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

function getPropertyValueForCurrentLanguage (property: string, field: string | MultilingualVcField[] = '', locale: string): string {
  if (typeof field === 'string') {
    return field;
  }
  return field
    // find value by exact match
    .find((f) => f['@language'] === locale)?.['@value'] ??
    // find value by shorthand (ie. 'en-US' -> 'en')
    field.find((f) => f['@language'].split('-')[0] === locale.split('-')[0])?.['@value'] ??
    field[0]['@value'];
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
    description
  } = certificateJson;
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
    name: getPropertyValueForCurrentLanguage('name', name, locale),
    description: getPropertyValueForCurrentLanguage('description', description, locale),
    metadataJson: certificateMetadata,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id
  };
}
