import domain from '../domain';
import type { Issuer } from '../models/Issuer';
import type { BlockcertsV3 } from '../models/BlockcertsV3';
import type { ParsedCertificate } from './index';
import type { Receipt } from '../models/Receipt';
import { parseReceipt } from '../suites/MerkleProof2019';

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

export default async function parseV3 (certificateJson: BlockcertsV3): Promise<ParsedCertificate> {
  const receipt: Receipt = parseReceipt(certificateJson.proof); // TODO: ideally we would remove this parsing here
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
    receipt,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id
  };
}
