import { Decoder } from '@vaultie/lds-merkle-proof-2019';
import { CERTIFICATE_VERSIONS } from '../constants';
import domain from '../domain';
import { BlockcertsV3 } from '../models/BlockcertsV3';

function parseSignature (signature): any { // TODO: define v3 signature type
  const base58Decoder = new Decoder(signature.proofValue);
  return base58Decoder.decode();
}

function getRecipientFullName (certificateJson): string {
  const { credentialSubject } = certificateJson;
  return credentialSubject.name;
}

async function getIssuerProfile (issuer): Promise<any> { // TODO: define issuer profile
  const profile = await domain.verifier.getIssuerProfile(issuer);
  return profile;
}

export default async function parseV3 (certificateJson): Promise<BlockcertsV3> {
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
