import VerifierError from '../../models/VerifierError.js';
import { SUB_STEPS } from '../../constants/verificationSteps.js';
import domain from '../../domain/index.js';
import { baseError } from './index.js';
import type { IDidDocument } from '../../models/DidDocument.js';

function getDocumentId (didDocument: IDidDocument): string {
  return didDocument.id;
}

export default function controlVerificationMethod (didDocument: IDidDocument, verificationMethod: string = ''): void {
  const documentId = getDocumentId(didDocument);
  const verificationDid = verificationMethod.split('#')[0];
  if (documentId !== verificationDid) {
    throw new VerifierError(SUB_STEPS.controlVerificationMethod, `${baseError} - ${domain.i18n.getText('errors', 'controlVerificationMethod')}`);
  }
}
