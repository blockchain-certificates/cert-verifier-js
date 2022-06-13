import { SignatureImage } from '../../models';

// v2 concern only
export default function getSignatureImages (signatureRawObject): SignatureImage[] {
  const signatureImageObjects = [];
  for (const index in signatureRawObject) {
    const signatureLine = signatureRawObject[index];
    const signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
    signatureImageObjects.push(signatureObject);
  }

  return signatureImageObjects;
}
