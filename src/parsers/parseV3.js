import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import { CERTIFICATE_VERSIONS } from '../constants';
import domain from '../domain';

function parseSignature (signature) {
  const base58Decoder = new Decoder(signature.proofValue);
  return base58Decoder.decode();
}

function getRecipientFullName (certificateJson) {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name;
}

export default function parseV3 (certificateJson) {
  const receipt = parseSignature(certificateJson.proof);
  const { issuer, metadataJson, issuanceDate, id, expirationDate } = certificateJson;
  return {
    chain: domain.certificates.getChain('', receipt),
    expires: expirationDate,
    issuedOn: issuanceDate,
    id,
    issuer,
    metadataJson,
    receipt,
    recipientFullName: getRecipientFullName(certificateJson),
    recordLink: id,
    version: CERTIFICATE_VERSIONS.V3_0_alpha
  };
}
