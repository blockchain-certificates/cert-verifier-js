import domain from '../domain';
import { CERTIFICATE_VERSIONS } from '../constants';
import getSignatureImages from './helpers/getSignatureImage';

/**
 * parseV2
 *
 * @param certificateJson
 * @returns {Certificate}
 */
export default function parseV2 (certificateJson) {
  const { id, expires, signature: receipt, badge } = certificateJson;
  const { image: certificateImage, name, description, subtitle, issuer } = badge;
  const issuerKey = certificateJson.verification.publicKey || certificateJson.verification.creator;
  const recipientProfile = certificateJson.recipientProfile || certificateJson.recipient.recipientProfile;

  const version = CERTIFICATE_VERSIONS.V2_0;
  const chain = domain.certificates.getChain(issuerKey, certificateJson.signature);
  const issuedOn = certificateJson.issuedOn;
  const metadataJson = certificateJson.metadataJson;
  const publicKey = recipientProfile.publicKey;
  const recipientFullName = recipientProfile.name;
  const recordLink = certificateJson.id;
  const revocationKey = null;
  const sealImage = issuer.image;
  const signatureImage = getSignatureImages(badge.signatureLines, version);

  return {
    certificateImage,
    chain,
    description,
    expires,
    id,
    issuedOn,
    issuer,
    metadataJson,
    name,
    publicKey,
    receipt,
    recipientFullName,
    recordLink,
    revocationKey,
    sealImage,
    signature: null,
    signatureImage,
    subtitle,
    version
  };
}
