import { type IDidDocumentPublicKey } from '@decentralized-identity/did-common-typescript';

export default interface IVerificationMethod extends IDidDocumentPublicKey {
  // based on https://www.w3.org/TR/cid-1.0/#verification-methods
  expires?: string;
  revoked?: string;
}
