import { SignatureImage } from '../../models';
import { CERTIFICATE_VERSIONS } from '../../constants';

/**
 * _getSignatureImages
 *
 * @param signatureRawObject
 * @param certificateVersion
 * @returns {Array}
 * @private
 */
export default function getSignatureImages (signatureRawObject, certificateVersion) {
  const signatureImageObjects = [];

  switch (certificateVersion) {
    case CERTIFICATE_VERSIONS.V1_1:
    case CERTIFICATE_VERSIONS.V1_2:
      if (signatureRawObject.constructor === Array) {
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
      break;

    case CERTIFICATE_VERSIONS.V2_0:
      for (const index in signatureRawObject) {
        const signatureLine = signatureRawObject[index];
        const signatureObject = new SignatureImage(signatureLine.image, signatureLine.jobTitle, signatureLine.name);
        signatureImageObjects.push(signatureObject);
      }
      break;
  }

  return signatureImageObjects;
}
