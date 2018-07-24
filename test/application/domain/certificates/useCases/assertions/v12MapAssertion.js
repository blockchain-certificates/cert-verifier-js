import { STEPS, SUB_STEPS } from '../../../../../../src';

export default [{
  step: STEPS.formatValidation,
  action: STEPS.language.formatValidation,
  substeps: [{
    step: SUB_STEPS.getTransactionId,
    label: SUB_STEPS.language.getTransactionId.label,
    actionLabel: SUB_STEPS.language.getTransactionId.actionLabel,
    parentStep: STEPS.formatValidation
  }, {
    step: SUB_STEPS.computeLocalHash,
    label: SUB_STEPS.language.computeLocalHash.label,
    actionLabel: SUB_STEPS.language.computeLocalHash.actionLabel,
    parentStep: STEPS.formatValidation
  }, {
    step: SUB_STEPS.fetchRemoteHash,
    label: SUB_STEPS.language.fetchRemoteHash.label,
    actionLabel: SUB_STEPS.language.fetchRemoteHash.actionLabel,
    parentStep: STEPS.formatValidation
  }, {
    step: SUB_STEPS.getIssuerProfile,
    label: SUB_STEPS.language.getIssuerProfile.label,
    actionLabel: SUB_STEPS.language.getIssuerProfile.actionLabel,
    parentStep: STEPS.formatValidation
  }, {
    step: SUB_STEPS.parseIssuerKeys,
    label: SUB_STEPS.language.parseIssuerKeys.label,
    actionLabel: SUB_STEPS.language.parseIssuerKeys.actionLabel,
    parentStep: STEPS.formatValidation
  }]
}, {
  step: STEPS.hashComparison,
  action: STEPS.language.hashComparison,
  substeps: [{
    step: SUB_STEPS.compareHashes,
    label: SUB_STEPS.language.compareHashes.label,
    actionLabel: SUB_STEPS.language.compareHashes.actionLabel,
    parentStep: STEPS.hashComparison
  }, {
    step: SUB_STEPS.checkMerkleRoot,
    label: SUB_STEPS.language.checkMerkleRoot.label,
    actionLabel: SUB_STEPS.language.checkMerkleRoot.actionLabel,
    parentStep: STEPS.hashComparison
  }, {
    step: SUB_STEPS.checkReceipt,
    label: SUB_STEPS.language.checkReceipt.label,
    actionLabel: SUB_STEPS.language.checkReceipt.actionLabel,
    parentStep: STEPS.hashComparison
  }]
}, {
  step: STEPS.statusCheck,
  action: STEPS.language.statusCheck,
  substeps: [{
    step: SUB_STEPS.checkRevokedStatus,
    label: SUB_STEPS.language.checkRevokedStatus.label,
    actionLabel: SUB_STEPS.language.checkRevokedStatus.actionLabel,
    parentStep: STEPS.statusCheck
  }, {
    step: SUB_STEPS.checkAuthenticity,
    label: SUB_STEPS.language.checkAuthenticity.label,
    actionLabel: SUB_STEPS.language.checkAuthenticity.actionLabel,
    parentStep: STEPS.statusCheck
  }, {
    step: SUB_STEPS.checkExpiresDate,
    label: SUB_STEPS.language.checkExpiresDate.label,
    actionLabel: SUB_STEPS.language.checkExpiresDate.actionLabel,
    parentStep: STEPS.statusCheck
  }]
}];
