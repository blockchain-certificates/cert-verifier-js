import { STEPS, SUB_STEPS } from '../../../../../../src';

export default [{
  step: STEPS.formatValidation,
  action: STEPS.language.formatValidation,
  substeps: [{
    step: SUB_STEPS.computeLocalHash,
    label: SUB_STEPS.language.computeLocalHash.label,
    actionLabel: SUB_STEPS.language.computeLocalHash.actionLabel,
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
    step: SUB_STEPS.checkReceipt,
    label: SUB_STEPS.language.checkReceipt.label,
    actionLabel: SUB_STEPS.language.checkReceipt.actionLabel,
    parentStep: STEPS.hashComparison
  }]
}, {
  step: STEPS.statusCheck,
  action: STEPS.language.statusCheck,
  substeps: [{
    step: SUB_STEPS.checkExpiresDate,
    label: SUB_STEPS.language.checkExpiresDate.label,
    actionLabel: SUB_STEPS.language.checkExpiresDate.actionLabel,
    parentStep: STEPS.statusCheck
  }]
}];
