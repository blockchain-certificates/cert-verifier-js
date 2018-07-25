import { BLOCKCHAINS, CERTIFICATE_VERSIONS } from '../../../constants';
import * as SUB_STEPS from '../../../constants/verificationSubSteps';
import isTestChain from '../../chains/useCases/isTestChain';

const versionVerificationMap = {
  [CERTIFICATE_VERSIONS.V1_2]: [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.getIssuerProfile,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.checkAuthenticity,
    SUB_STEPS.checkExpiresDate
  ],
  [CERTIFICATE_VERSIONS.V2_0]: [
    SUB_STEPS.getTransactionId,
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.fetchRemoteHash,
    SUB_STEPS.parseIssuerKeys,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkMerkleRoot,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkRevokedStatus,
    SUB_STEPS.checkAuthenticity,
    SUB_STEPS.checkExpiresDate
  ],
  [BLOCKCHAINS.mocknet.code]: [
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkExpiresDate
  ]
};

export default function getVerificationMap (chain, version) {
  let map = [];
  let key;

  // If not a chain or test chain and no version
  if (!chain) {
    return map;
  }

  // If v1.2
  if (version === CERTIFICATE_VERSIONS.V1_2) {
    key = version;
  } else {
    if (isTestChain(chain)) {
      key = BLOCKCHAINS.mocknet.code;
    } else {
      key = CERTIFICATE_VERSIONS.V2_0;
    }
  }

  return key ? versionVerificationMap[version].slice() : map;
}
