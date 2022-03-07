import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import domain from '../domain';
import { Issuer } from '../models/Issuer';
import { ProofValueMerkleProof2019 } from '../models/MerkleProof2019';
import { BlockcertsV3, BlockcertsV3Display } from '../models/BlockcertsV3';
import { ParsedCertificate } from './index';
import Versions from '../constants/certificateVersions';
import convertHashlink from './helpers/convertHashlink';

function parseSignature (signature): ProofValueMerkleProof2019 {
  const base58Decoder = new Decoder(signature.proofValue);
  return base58Decoder.decode();
}

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name || '';
}

async function parseHashlinksInDisplay (display: BlockcertsV3Display): Promise<BlockcertsV3Display> {
  if (!display) {
    return;
  }

  if (display.contentMediaType !== 'text/html') { // TODO: enum supported content media types
    return display;
  }

  display.content = await convertHashlink(display.content);
  return display;
}

export default async function parseV3 (certificateJson: BlockcertsV3, version: Versions): Promise<ParsedCertificate> {
  const receipt = parseSignature(certificateJson.proof);
  const { issuer: issuerProfileUrl, metadataJson, metadata, issuanceDate, id, expirationDate, display } = certificateJson;
  const certificateMetadata = metadata || metadataJson;
  const issuer: Issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
  const updatedDisplayWithHashlinks = await parseHashlinksInDisplay(display);
  return {
    chain: domain.certificates.getChain('', receipt),
    display: updatedDisplayWithHashlinks,
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
