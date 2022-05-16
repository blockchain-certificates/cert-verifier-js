import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import domain from '../domain';
import type { Issuer } from '../models/Issuer';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { ParsedCertificate } from './index';
import type { Receipt } from '../models/Receipt';

function parseReceipt (proof: VCProof | VCProof[]): Receipt {
  let merkleProof2019: VCProof;

  if (Array.isArray(proof)) {
    merkleProof2019 = proof.find(p => p.type === 'MerkleProof2019' || p.chainedProofType === 'MerkleProof2019');
  } else {
    merkleProof2019 = proof;
  }

  const base58Decoder = new Decoder(merkleProof2019.proofValue);
  return base58Decoder.decode();
}

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

export default async function parseV3 (certificateJson: BlockcertsV3): Promise<ParsedCertificate> {
  const receipt: Receipt = parseReceipt(certificateJson.proof);
  const { issuer: issuerProfileUrl, metadataJson, metadata, issuanceDate, id, expirationDate, display } = certificateJson;
  const certificateMetadata = metadata || metadataJson;
  const issuer: Issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
  return {
    chain: domain.certificates.getChain('', receipt),
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
