import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import domain from '../domain';
import type { Issuer } from '../models/Issuer';
import type { ProofValueMerkleProof2019 } from '../models/MerkleProof2019';
import type { BlockcertsV3, VCProof } from '../models/BlockcertsV3';
import type { ParsedCertificate } from './index';
import type Versions from '../constants/certificateVersions';

function parseReceipt (proof: VCProof | VCProof[]): ProofValueMerkleProof2019 {
  let merkleProof2019: VCProof;

  if (Array.isArray(proof)) {
    // TODO: this assumes that the merkle proof is always ChainedProof2021, which it shouldn't
    merkleProof2019 = proof.find(p => p.type === 'ChainedProof2021' && p.chainedProofType === 'MerkleProof2019');
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

export default async function parseV3 (certificateJson: BlockcertsV3, version: Versions): Promise<ParsedCertificate> {
  const receipt = parseReceipt(certificateJson.proof);
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
    proof: certificateJson.proof,
    receipt,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id,
    version
  };
}
