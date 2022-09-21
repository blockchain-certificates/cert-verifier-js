import { VerifierError } from '../../models';
import domain from '../../domain';
import { baseError } from './index';
import type { IDidDocument } from '../../models/DidDocument';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import type { Issuer } from '../../models/Issuer';

export default function retrieveVerificationMethodPublicKey (
  issuerDocument: Issuer | IDidDocument,
  proofVerificationMethod: string
): IDidDocumentPublicKey {
  if (!issuerDocument.verificationMethod) {
    // backwards compatibility with Blockcerts' issuer profile who don't include verification method
    // is this ideal? probably not and we should likely require v3 profiles to include verificationMethod
    console.warn('No verification method found in the issuer document. ' +
      'This will likely become a requirement in the near future');
    return;
  }
  const verificationMethodId = proofVerificationMethod.split('#')[1];
  const verificationMethodFromDocument = issuerDocument.verificationMethod;
  const verificationMethodPublicKey = verificationMethodFromDocument
    .find(verificationMethod =>
      verificationMethod.id === `#${verificationMethodId}` ||
      verificationMethod.id === proofVerificationMethod // if the id is the combination of did + key id
    );

  if (!verificationMethodPublicKey) {
    throw new VerifierError(
      'retrieveVerificationMethodPublicKey',
      `${baseError} - ${domain.i18n.getText('errors', 'retrieveVerificationMethodPublicKey')}`);
  }
  return verificationMethodPublicKey;
}
