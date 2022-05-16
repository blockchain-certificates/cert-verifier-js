import { VerificationSteps, SUB_STEPS } from '../../../../../../src/constants/verificationSteps';
import type { IVerificationMapItem } from '../../../../../../src/domain/certificates/useCases/getVerificationMap';
import i18n from '../../../../../../src/data/i18n.json';
import currentLocale from '../../../../../../src/constants/currentLocale';

const defaultLanguageSet = i18n[currentLocale.locale];

const mainnetStepMapAssertion: IVerificationMapItem[] = [
  {
    code: VerificationSteps.formatValidation,
    label: defaultLanguageSet.steps.formatValidationLabel,
    labelPending: defaultLanguageSet.steps.formatValidationLabelPending,
    subSteps: [
      // {
      //   code: SUB_STEPS.getIssuerProfile,
      //   label: defaultLanguageSet.subSteps.getIssuerProfileLabel,
      //   labelPending: defaultLanguageSet.subSteps.getIssuerProfileLabelPending,
      //   parentStep: VerificationSteps.formatValidation
      // },
      // {
      //   code: SUB_STEPS.parseIssuerKeys,
      //   label: defaultLanguageSet.subSteps.parseIssuerKeysLabel,
      //   labelPending: defaultLanguageSet.subSteps.parseIssuerKeysLabelPending,
      //   parentStep: VerificationSteps.formatValidation
      // },
      {
        code: SUB_STEPS.checkImagesIntegrity,
        label: defaultLanguageSet.subSteps.checkImagesIntegrityLabel,
        labelPending: defaultLanguageSet.subSteps.checkImagesIntegrityLabelPending,
        parentStep: VerificationSteps.formatValidation
      }
    ]
  },
  {
    code: VerificationSteps.proofVerification,
    label: defaultLanguageSet.steps.signatureVerificationLabel,
    labelPending: defaultLanguageSet.steps.signatureVerificationLabelPending,
    subSteps: [
      // {
      //   code: SUB_STEPS.getTransactionId,
      //   label: defaultLanguageSet.subSteps.getTransactionIdLabel,
      //   labelPending: defaultLanguageSet.subSteps.getTransactionIdLabelPending,
      //   parentStep: VerificationSteps.signatureVerification
      // },
      // {
      //   code: SUB_STEPS.computeLocalHash,
      //   label: defaultLanguageSet.subSteps.computeLocalHashLabel,
      //   labelPending: defaultLanguageSet.subSteps.computeLocalHashLabelPending,
      //   parentStep: VerificationSteps.signatureVerification
      // },
      // {
      //   code: SUB_STEPS.fetchRemoteHash,
      //   label: defaultLanguageSet.subSteps.fetchRemoteHashLabel,
      //   labelPending: defaultLanguageSet.subSteps.fetchRemoteHashLabelPending,
      //   parentStep: VerificationSteps.signatureVerification
      // },
      // {
      //   code: SUB_STEPS.compareHashes,
      //   label: defaultLanguageSet.subSteps.compareHashesLabel,
      //   labelPending: defaultLanguageSet.subSteps.compareHashesLabelPending,
      //   parentStep: VerificationSteps.signatureVerification
      // },
      // {
      //   code: SUB_STEPS.checkMerkleRoot,
      //   label: defaultLanguageSet.subSteps.checkMerkleRootLabel,
      //   labelPending: defaultLanguageSet.subSteps.checkMerkleRootLabelPending,
      //   parentStep: VerificationSteps.signatureVerification
      // },
      // {
      //   code: SUB_STEPS.checkReceipt,
      //   label: defaultLanguageSet.subSteps.checkReceiptLabel,
      //   labelPending: defaultLanguageSet.subSteps.checkReceiptLabelPending,
      //   parentStep: VerificationSteps.signatureVerification
      // }
    ]
  },
  {
    code: VerificationSteps.identityVerification,
    label: defaultLanguageSet.steps.identityVerificationLabel,
    labelPending: defaultLanguageSet.steps.identityVerificationLabelPending,
    subSteps: []
  },
  {
    code: VerificationSteps.statusCheck,
    label: defaultLanguageSet.steps.statusCheckLabel,
    labelPending: defaultLanguageSet.steps.statusCheckLabelPending,
    subSteps: [
      {
        code: SUB_STEPS.checkRevokedStatus,
        label: defaultLanguageSet.subSteps.checkRevokedStatusLabel,
        labelPending: defaultLanguageSet.subSteps.checkRevokedStatusLabelPending,
        parentStep: VerificationSteps.statusCheck
      },
      // {
      //   code: SUB_STEPS.checkAuthenticity,
      //   label: defaultLanguageSet.subSteps.checkAuthenticityLabel,
      //   labelPending: defaultLanguageSet.subSteps.checkAuthenticityLabelPending,
      //   parentStep: VerificationSteps.statusCheck
      // },
      {
        code: SUB_STEPS.checkExpiresDate,
        label: defaultLanguageSet.subSteps.checkExpiresDateLabel,
        labelPending: defaultLanguageSet.subSteps.checkExpiresDateLabelPending,
        parentStep: VerificationSteps.statusCheck
      }
    ]
  }
];

export default mainnetStepMapAssertion;
