import domain from '../domain/index.js';
import type { Issuer } from '../models/Issuer.js';
import type { BlockcertsV3 } from '../models/BlockcertsV3.js';
import type { ParsedCertificate } from './index.js';

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

export default async function parseV3 (certificateJson: BlockcertsV3): Promise<ParsedCertificate> {
  const { issuer: issuerProfileUrl, metadataJson, metadata, issuanceDate, id, expirationDate, display } = certificateJson;
  const certificateMetadata = metadata || metadataJson;
  const issuer: Issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
  return {
    display,
    expires: expirationDate,
    issuedOn: issuanceDate,
    id,
    issuer,
    metadataJson: certificateMetadata,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id
  };
}
