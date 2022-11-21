import computeLocalHash from './computeLocalHash';
import ensureHashesEqual from './ensureHashesEqual';
import ensureMerkleRootEqual from './ensureMerkleRootEqual';
import ensureNotExpired from './ensureNotExpired';
import ensureNotRevoked from './ensureNotRevoked';
import ensureValidIssuingKey from './ensureValidIssuingKey';
import ensureValidReceipt from './ensureValidReceipt';
import isTransactionIdValid from './isTransactionIdValid';
import controlVerificationMethod from './did/controlVerificationMethod';
import retrieveVerificationMethodPublicKey from './did/retrieveVerificationMethodPublicKey';

export {
  computeLocalHash,
  controlVerificationMethod,
  ensureHashesEqual,
  ensureMerkleRootEqual,
  ensureNotExpired,
  ensureNotRevoked,
  ensureValidIssuingKey,
  ensureValidReceipt,
  isTransactionIdValid,
  retrieveVerificationMethodPublicKey
};
