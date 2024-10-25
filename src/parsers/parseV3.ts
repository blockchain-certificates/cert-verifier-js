import domain from '../domain';
import type { Issuer } from '../models/Issuer';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { ParsedCertificate } from './index';

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

export default async function parseV3 (certificateJson: BlockcertsV3): Promise<ParsedCertificate> {
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
    name,
    description,
    metadataJson: certificateMetadata,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id
  };
}
