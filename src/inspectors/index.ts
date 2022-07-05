import computeLocalHash from './computeLocalHash.js';
import confirmDidSignature from './confirmDidSignature.js';
import ensureHashesEqual from './ensureHashesEqual.js';
import ensureMerkleRootEqual from './ensureMerkleRootEqual.js';
import ensureNotExpired from './ensureNotExpired.js';
import ensureNotRevoked from './ensureNotRevoked.js';
import ensureValidIssuingKey from './ensureValidIssuingKey.js';
import ensureValidReceipt from './ensureValidReceipt.js';
import isTransactionIdValid from './isTransactionIdValid.js';
import compareIssuingAddress from './did/compareIssuingAddress.js';
import controlVerificationMethod from './did/controlVerificationMethod.js';
import deriveIssuingAddressFromPublicKey from './did/deriveIssuingAddressFromPublicKey.js';
import retrieveVerificationMethodPublicKey from './did/retrieveVerificationMethodPublicKey.js';

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
