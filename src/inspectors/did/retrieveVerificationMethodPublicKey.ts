import VerifierError from '../../models/VerifierError.js';
import domain from '../../domain/index.js';
import { baseError } from './index.js';
import type { IDidDocument } from '../../models/DidDocument.js';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

export default function retrieveVerificationMethodPublicKey (didDocument: IDidDocument, verificationMethod: string): IDidDocumentPublicKey {
  const verificationMethodId = verificationMethod.split('#')[1];
  const verificationMethodFromDocument = didDocument.verificationMethod;
  const verificationMethodPublicKey = verificationMethodFromDocument
    .filter(verificationMethod => verificationMethod.id === `#${verificationMethodId}`)[0];

  if (!verificationMethodPublicKey) {
    throw new VerifierError(
      'retrieveVerificationMethodPublicKey',
      `${baseError} - ${domain.i18n.getText('errors', 'retrieveVerificationMethodPublicKey')}`);
  }
  return verificationMethodPublicKey;
}
