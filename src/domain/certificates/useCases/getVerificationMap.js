import { BLOCKCHAINS, CERTIFICATE_VERSIONS } from '../../../constants';
import * as SUB_STEPS from '../../../constants/verificationSubSteps';

const versionVerificationMap = {
  [CERTIFICATE_VERSIONS.V1_2]: [

  ],
  [CERTIFICATE_VERSIONS.V2_0]: [

  ],
  [BLOCKCHAINS.mocknet.code]: [
    SUB_STEPS.computeLocalHash,
    SUB_STEPS.compareHashes,
    SUB_STEPS.checkReceipt,
    SUB_STEPS.checkExpiresDate
  ]
};

export default function getVerificationMap (chain, version) {
  const map = [];

  if (!chain || !version) {
    return map;
  }

  return map;
}
