import type { IDidDocument } from '../../models/DidDocument';
import type { IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';
import { VerifierError } from '../../models';
import { SUB_STEPS } from '../../constants';
import domain from '../../domain';
import { baseError } from './index';

export default function retrieveVerificationMethodPublicKey (didDocument: IDidDocument, verificationMethod: string): IDidDocumentPublicKey {
  const verificationMethodId = verificationMethod.split('#')[1];
  const verificationMethodFromDocument = didDocument.verificationMethod;
  const verificationMethodPublicKey = verificationMethodFromDocument
    .filter(verificationMethod => verificationMethod.id === `#${verificationMethodId}`)[0];
  if (!verificationMethodPublicKey) {
    throw new VerifierError(SUB_STEPS.retrieveVerificationMethodPublicKey, `${baseError} - ${domain.i18n.getText('errors', 'retrieveVerificationMethodPublicKey')}`);
  }
  return verificationMethodPublicKey;
}
