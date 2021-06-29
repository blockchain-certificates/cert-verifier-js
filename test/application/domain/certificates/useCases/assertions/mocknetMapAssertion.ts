import { STEPS } from '../../../../../../src';
import { VerificationSteps } from '../../../../../../src/constants/verificationSteps';
import { SUB_STEPS, substepsList } from '../../../../../../src/constants/verificationSubSteps';

export default [{
  code: VerificationSteps.formatValidation,
  label: STEPS.language.formatValidation.label,
  labelPending: STEPS.language.formatValidation.labelPending,
  subSteps: [{
    code: SUB_STEPS.computeLocalHash,
    label: substepsList.computeLocalHash.label,
    labelPending: substepsList.computeLocalHash.labelPending,
    parentStep: VerificationSteps.formatValidation
  }]
}, {
  code: VerificationSteps.hashComparison,
  label: STEPS.language.hashComparison.label,
  labelPending: STEPS.language.hashComparison.labelPending,
  subSteps: [{
    code: SUB_STEPS.compareHashes,
    label: substepsList.compareHashes.label,
    labelPending: substepsList.compareHashes.labelPending,
    parentStep: VerificationSteps.hashComparison
  }, {
    code: SUB_STEPS.checkReceipt,
    label: substepsList.checkReceipt.label,
    labelPending: substepsList.checkReceipt.labelPending,
    parentStep: VerificationSteps.hashComparison
  }]
}, {
  code: VerificationSteps.statusCheck,
  label: STEPS.language.statusCheck.label,
  labelPending: STEPS.language.statusCheck.labelPending,
  subSteps: [{
    code: SUB_STEPS.checkExpiresDate,
    label: substepsList.checkExpiresDate.label,
    labelPending: substepsList.checkExpiresDate.labelPending,
    parentStep: VerificationSteps.statusCheck
  }]
}];
