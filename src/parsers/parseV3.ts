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

async function getIssuerProfile (issuer) {
  const profile = await domain.verifier.getIssuerProfile(issuer);
  return profile;
}

export default async function parseV3 (certificateJson) {
  const receipt = parseSignature(certificateJson.proof);
  const { issuer: issuerProfileUrl, metadataJson, issuanceDate, id, expirationDate } = certificateJson;
  const issuer = await getIssuerProfile(issuerProfileUrl);
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
