import { SignatureImage } from '../../models';
import { CERTIFICATE_VERSIONS } from '../../constants';

// v2 concern only
export default function getSignatureImages (signatureRawObject, version?: CERTIFICATE_VERSIONS): SignatureImage[] {
  const signatureImageObjects = [];
  if (version === CERTIFICATE_VERSIONS.V1_1 || version === CERTIFICATE_VERSIONS.V1_2) {
    if (Array.isArray(signatureRawObject)) {
      // eslint-disable-next-line @typescript-eslint/no-for-in-array
      for (const index in signatureRawObject) {
        const signatureLine = signatureRawObject[index];
        const jobTitle = 'jobTitle' in signatureLine ? signatureLine.jobTitle : null;
        const signerName = 'name' in signatureLine ? signatureLine.name : null;
        const signatureObject = new SignatureImage(signatureLine.image, jobTitle, signerName);
        signatureImageObjects.push(signatureObject);
      }
    } else {
      const signatureObject = new SignatureImage(signatureRawObject, null, null);
      signatureImageObjects.push(signatureObject);
    }
  } else {
    for (const index in signatureRawObject) {
      const signatureLine = signatureRawObject[index];
      const signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
      signatureImageObjects.push(signatureObject);
    }
  }

  return signatureImageObjects;
}
