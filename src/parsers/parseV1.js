import domain from '../domain';
import getSignatureImages from './helpers/getSignatureImage';
import { CERTIFICATE_VERSIONS } from '../constants';

/**
 * parseV1
 *
 * @param certificateJson
 * @returns {Certificate}
 */
export default function parseV1 (certificateJson) {
  const fullCertificateObject = certificateJson.certificate || certificateJson.document.certificate;
  const recipient = certificateJson.recipient || certificateJson.document.recipient;
  const assertion = certificateJson.document.assertion;

  const receipt = certificateJson.receipt;
  const version = typeof receipt === 'undefined' ? CERTIFICATE_VERSIONS.V1_1 : CERTIFICATE_VERSIONS.V1_2;

  let { image: certificateImage, description, issuer, subtitle } = fullCertificateObject;

  const publicKey = recipient.publicKey;
  const chain = domain.certificates.getChain(publicKey);
  const expires = assertion.expires;
  const id = assertion.uid;
  const issuedOn = assertion.issuedOn;
  const metadataJson = assertion.metadataJson;
  const recipientFullName = `${recipient.givenName} ${recipient.familyName}`;
  const recordLink = assertion.id;
  const revocationKey = recipient.revocationKey || null;
  const sealImage = issuer.image;
  const signature = certificateJson.document.signature;
  const signaturesRaw = certificateJson.document && certificateJson.document.assertion && certificateJson.document.assertion['image:signature'];
  const signatureImage = getSignatureImages(signaturesRaw, version);
  if (typeof subtitle === 'object') {
    subtitle = subtitle.display ? subtitle.content : '';
  }
  const name = fullCertificateObject.title || fullCertificateObject.name;

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
    signature,
    signatureImage,
    subtitle,
    version
  };
}
