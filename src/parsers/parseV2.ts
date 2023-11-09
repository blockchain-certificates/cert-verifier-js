import domain from '../domain';
import getSignatureImages from './helpers/getSignatureImage';
import type { BlockcertsV2 } from '../models/BlockcertsV2';
import type { ParsedCertificate } from './index';
import type { Issuer } from '../models/Issuer';

export default async function parseV2 (certificateJson: BlockcertsV2): Promise<ParsedCertificate> {
  const { id, expires, badge } = certificateJson;
  const { image: certificateImage, name, description, subtitle, issuer: issuerProfileUrl } = badge;
  const recipientProfile = certificateJson.recipientProfile ?? certificateJson.recipient.recipientProfile;

  const issuedOn = certificateJson.issuedOn;
  const metadataJson = certificateJson.metadataJson;
  const recipientFullName = recipientProfile.name;
  const revocationKey = null;
  const signatureImage = getSignatureImages(badge.signatureLines);
  const issuer: Issuer = await domain.verifier.getIssuerProfile(issuerProfileUrl);
  const sealImage = issuer.image;

  return {
    certificateImage,
    description,
    expires,
    id,
    issuedOn,
    issuer,
    metadataJson,
    name,
    recipientFullName,
    recordLink: id,
    revocationKey,
    sealImage,
    signatureImage,
    subtitle
  };
}
