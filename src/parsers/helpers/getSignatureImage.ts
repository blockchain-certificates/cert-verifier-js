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
export default function getSignatureImages (signatureRawObject, certificateVersion): SignatureImage[] {
  const signatureImageObjects = [];

  switch (certificateVersion) {
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
