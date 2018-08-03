import { STEPS, SUB_STEPS } from '../../../../../../src';

export default [{
  code: STEPS.formatValidation,
  label: STEPS.language.formatValidation.label,
  labelPending: STEPS.language.formatValidation.labelPending,
  subSteps: [{
    code: SUB_STEPS.computeLocalHash,
    label: SUB_STEPS.language.computeLocalHash.label,
    labelPending: SUB_STEPS.language.computeLocalHash.labelPending,
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
    code: SUB_STEPS.checkExpiresDate,
    label: SUB_STEPS.language.checkExpiresDate.label,
    labelPending: SUB_STEPS.language.checkExpiresDate.labelPending,
    parentStep: STEPS.statusCheck
  }]
}];
