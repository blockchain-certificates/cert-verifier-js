import { STEPS, SUB_STEPS } from '../../../../../../src';

export default [{
  code: STEPS.formatValidation,
  label: STEPS.language.formatValidation.label,
  labelPending: STEPS.language.formatValidation.labelPending,
  subSteps: [{
    code: SUB_STEPS.getTransactionId,
    label: SUB_STEPS.language.getTransactionId.label,
    labelPending: SUB_STEPS.language.getTransactionId.labelPending,
    parentStep: STEPS.formatValidation
  }, {
    code: SUB_STEPS.computeLocalHash,
    label: SUB_STEPS.language.computeLocalHash.label,
    labelPending: SUB_STEPS.language.computeLocalHash.labelPending,
    parentStep: STEPS.formatValidation
  }, {
    code: SUB_STEPS.fetchRemoteHash,
    label: SUB_STEPS.language.fetchRemoteHash.label,
    labelPending: SUB_STEPS.language.fetchRemoteHash.labelPending,
    parentStep: STEPS.formatValidation
  }, {
    code: SUB_STEPS.getIssuerProfile,
    label: SUB_STEPS.language.getIssuerProfile.label,
    labelPending: SUB_STEPS.language.getIssuerProfile.labelPending,
    parentStep: STEPS.formatValidation
  }, {
    code: SUB_STEPS.parseIssuerKeys,
    label: SUB_STEPS.language.parseIssuerKeys.label,
    labelPending: SUB_STEPS.language.parseIssuerKeys.labelPending,
    parentStep: STEPS.formatValidation
  }]
}, {
  code: STEPS.hashComparison,
  label: STEPS.language.hashComparison.label,
  labelPending: STEPS.language.hashComparison.labelPending,
  subSteps: [{
    code: SUB_STEPS.compareHashes,
    label: SUB_STEPS.language.compareHashes.label,
    labelPending: SUB_STEPS.language.compareHashes.labelPending,
    parentStep: STEPS.hashComparison
  }, {
    code: SUB_STEPS.checkMerkleRoot,
    label: SUB_STEPS.language.checkMerkleRoot.label,
    labelPending: SUB_STEPS.language.checkMerkleRoot.labelPending,
    parentStep: STEPS.hashComparison
  }, {
    code: SUB_STEPS.checkReceipt,
    label: SUB_STEPS.language.checkReceipt.label,
    labelPending: SUB_STEPS.language.checkReceipt.labelPending,
    parentStep: STEPS.hashComparison
  }]
}, {
  code: STEPS.statusCheck,
  label: STEPS.language.statusCheck.label,
  labelPending: STEPS.language.statusCheck.labelPending,
  subSteps: [{
    code: SUB_STEPS.checkRevokedStatus,
    label: SUB_STEPS.language.checkRevokedStatus.label,
    labelPending: SUB_STEPS.language.checkRevokedStatus.labelPending,
    parentStep: STEPS.statusCheck
  }, {
    code: SUB_STEPS.checkAuthenticity,
    label: SUB_STEPS.language.checkAuthenticity.label,
    labelPending: SUB_STEPS.language.checkAuthenticity.labelPending,
    parentStep: STEPS.statusCheck
  }, {
    code: SUB_STEPS.checkExpiresDate,
    label: SUB_STEPS.language.checkExpiresDate.label,
    labelPending: SUB_STEPS.language.checkExpiresDate.labelPending,
    parentStep: STEPS.statusCheck
  }]
}];
