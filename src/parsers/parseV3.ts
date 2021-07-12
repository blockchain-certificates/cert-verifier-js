import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import { CERTIFICATE_VERSIONS } from '../constants';
import domain from '../domain';
import { BlockcertsV3 } from '../models/BlockcertsV3';
import { Issuer } from '../models/Issuer';
import { ProofValueMerkleProof2019 } from '../models/MerkleProof2019';

function parseSignature (signature): ProofValueMerkleProof2019 {
  const base58Decoder = new Decoder(signature.proofValue);
  return base58Decoder.decode();
}

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

export default async function parseV3 (certificateJson): Promise<BlockcertsV3> {
  const receipt = parseSignature(certificateJson.proof);
  const { issuer: issuerProfileUrl, metadataJson, metadata, issuanceDate, id, expirationDate } = certificateJson;
  const certificateMetadata = metadata || metadataJson;
  const issuer: Issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
  return {
    chain: domain.certificates.getChain('', receipt),
    expires: expirationDate,
    issuedOn: issuanceDate,
    id,
    issuer,
    metadataJson: certificateMetadata,
    receipt,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id,
    // TODO: more dynamic set up of V3
    version: CERTIFICATE_VERSIONS.V3_0_alpha
  };
}
