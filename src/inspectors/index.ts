import computeLocalHash from './computeLocalHash';
import confirmDidSignature from './confirmDidSignature';
import ensureHashesEqual from './ensureHashesEqual';
import ensureMerkleRootEqual from './ensureMerkleRootEqual';
import ensureNotExpired from './ensureNotExpired';
import ensureNotRevoked from './ensureNotRevoked';
import ensureValidIssuingKey from './ensureValidIssuingKey';
import ensureValidReceipt from './ensureValidReceipt';
import isTransactionIdValid from './isTransactionIdValid';
import compareIssuingAddress from './did/compareIssuingAddress';
import controlVerificationMethod from './did/controlVerificationMethod';
import deriveIssuingAddressFromPublicKey from './did/deriveIssuingAddressFromPublicKey';
import retrieveVerificationMethodPublicKey from './did/retrieveVerificationMethodPublicKey';

export {
  compareIssuingAddress,
  computeLocalHash,
  confirmDidSignature,
  controlVerificationMethod,
  deriveIssuingAddressFromPublicKey,
  ensureHashesEqual,
  ensureMerkleRootEqual,
  ensureNotExpired,
  ensureNotRevoked,
  ensureValidIssuingKey,
  ensureValidReceipt,
  isTransactionIdValid,
  retrieveVerificationMethodPublicKey
};
