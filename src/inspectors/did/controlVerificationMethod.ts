import type { IDidDocument } from '../../models/DidDocument';
import { VerifierError } from '../../models';
import { SUB_STEPS } from '../../constants';
import domain from '../../domain';
import { baseError } from './index';

function getDocumentId (didDocument: IDidDocument): string {
  return didDocument.id;
}

export default function controlVerificationMethod (didDocument: IDidDocument, verificationMethod: string): void {
  const documentId = getDocumentId(didDocument);
  const verificationDid = verificationMethod.split('#')[0];
  if (documentId !== verificationDid) {
    throw new VerifierError(SUB_STEPS.controlVerificationMethod, `${baseError} - ${domain.i18n.getText('errors', 'controlVerificationMethod')}`);
  }
}
