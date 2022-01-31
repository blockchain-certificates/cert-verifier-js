import { STEPS } from '../../../../../../src';
import { VerificationSteps } from '../../../../../../src/constants/verificationSteps';
import { IVerificationMapItem } from '../../../../../../src/domain/certificates/useCases/getVerificationMap';
import { SUB_STEPS, substepsList } from '../../../../../../src/constants/verificationSubSteps';

const mainnetStepMapAssertion: IVerificationMapItem[] = [
  {
    code: VerificationSteps.formatValidation,
    label: STEPS.language.formatValidation.label,
    labelPending: STEPS.language.formatValidation.labelPending,
    subSteps: [
      {
        code: SUB_STEPS.getTransactionId,
        label: substepsList.getTransactionId.label,
        labelPending: substepsList.getTransactionId.labelPending,
        parentStep: VerificationSteps.formatValidation
      },
      {
        code: SUB_STEPS.computeLocalHash,
        label: substepsList.computeLocalHash.label,
        labelPending: substepsList.computeLocalHash.labelPending,
        parentStep: VerificationSteps.formatValidation
      },
      {
        code: SUB_STEPS.fetchRemoteHash,
        label: substepsList.fetchRemoteHash.label,
        labelPending: substepsList.fetchRemoteHash.labelPending,
        parentStep: VerificationSteps.formatValidation
      },
      {
        code: SUB_STEPS.getIssuerProfile,
        label: substepsList.getIssuerProfile.label,
        labelPending: substepsList.getIssuerProfile.labelPending,
        parentStep: VerificationSteps.formatValidation
      },
      {
        code: SUB_STEPS.parseIssuerKeys,
        label: substepsList.parseIssuerKeys.label,
        labelPending: substepsList.parseIssuerKeys.labelPending,
        parentStep: VerificationSteps.formatValidation
      }
    ]
  },
  {
    code: VerificationSteps.hashComparison,
    label: STEPS.language.hashComparison.label,
    labelPending: STEPS.language.hashComparison.labelPending,
    subSteps: [
      {
        code: SUB_STEPS.compareHashes,
        label: substepsList.compareHashes.label,
        labelPending: substepsList.compareHashes.labelPending,
        parentStep: VerificationSteps.hashComparison
      },
      {
        code: SUB_STEPS.checkMerkleRoot,
        label: substepsList.checkMerkleRoot.label,
        labelPending: substepsList.checkMerkleRoot.labelPending,
        parentStep: VerificationSteps.hashComparison
      },
      {
        code: SUB_STEPS.checkReceipt,
        label: substepsList.checkReceipt.label,
        labelPending: substepsList.checkReceipt.labelPending,
        parentStep: VerificationSteps.hashComparison
      }
    ]
  },
  {
    code: VerificationSteps.statusCheck,
    label: STEPS.language.statusCheck.label,
    labelPending: STEPS.language.statusCheck.labelPending,
    subSteps: [
      {
        code: SUB_STEPS.checkRevokedStatus,
        label: substepsList.checkRevokedStatus.label,
        labelPending: substepsList.checkRevokedStatus.labelPending,
        parentStep: VerificationSteps.statusCheck
      },
      {
        code: SUB_STEPS.checkAuthenticity,
        label: substepsList.checkAuthenticity.label,
        labelPending: substepsList.checkAuthenticity.labelPending,
        parentStep: VerificationSteps.statusCheck
      },
      {
        code: SUB_STEPS.checkExpiresDate,
        label: substepsList.checkExpiresDate.label,
        labelPending: substepsList.checkExpiresDate.labelPending,
        parentStep: VerificationSteps.statusCheck
      }
    ]
  }
];

export default mainnetStepMapAssertion;
