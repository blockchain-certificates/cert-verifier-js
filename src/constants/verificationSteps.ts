import i18n from '../data/i18n.json';
import currentLocale from './currentLocale';

const defaultLanguageSet = i18n[currentLocale.locale];

export const final = 'final';

export enum VerificationSteps {
  formatValidation = 'formatValidation',
  signatureVerification = 'signatureVerification',
  identityVerification = 'identityVerification',
  statusCheck = 'statusCheck',
  final = 'final'
}

export enum SUB_STEPS {
  getTransactionId = 'getTransactionId', // MerkleProof2019 specific
  computeLocalHash = 'computeLocalHash', // MerkleProof2019 specific
  fetchRemoteHash = 'fetchRemoteHash', // MerkleProof2019 specific
  getIssuerProfile = 'getIssuerProfile',
  parseIssuerKeys = 'parseIssuerKeys',
  compareHashes = 'compareHashes', // MerkleProof2019 specific
  checkImagesIntegrity = 'checkImagesIntegrity',
  checkMerkleRoot = 'checkMerkleRoot', // MerkleProof2019 specific
  checkReceipt = 'checkReceipt', // MerkleProof2019 specific
  checkRevokedStatus = 'checkRevokedStatus',
  checkAuthenticity = 'checkAuthenticity',
  checkExpiresDate = 'checkExpiresDate',
  controlVerificationMethod = 'controlVerificationMethod',
  retrieveVerificationMethodPublicKey = 'retrieveVerificationMethodPublicKey',
  deriveIssuingAddressFromPublicKey = 'deriveIssuingAddressFromPublicKey', // MerkleProof2019 specific
  compareIssuingAddress = 'compareIssuingAddress' // MerkleProof2019 specific
}

export interface IVerificationSubstep {
  code: SUB_STEPS;
  label: string;
  labelPending: string;
  parentStep: VerificationSteps;
}

export type TVerificationStepsList = {
  [key in VerificationSteps]?: {
    code: string;
    label: string;
    labelPending: string;
    subSteps: IVerificationSubstep[];
  };
};

export default function getParentVerificationSteps (): TVerificationStepsList {
  return {
    [VerificationSteps.formatValidation]: {
      code: VerificationSteps.formatValidation,
      label: defaultLanguageSet.steps.formatValidationLabel,
      labelPending: defaultLanguageSet.steps.formatValidationLabelPending,
      subSteps: []
    },
    [VerificationSteps.signatureVerification]: {
      code: VerificationSteps.signatureVerification,
      label: defaultLanguageSet.steps.signatureVerificationLabel,
      labelPending: defaultLanguageSet.steps.signatureVerificationLabelPending,
      subSteps: []
    },
    [VerificationSteps.identityVerification]: {
      code: VerificationSteps.identityVerification,
      label: defaultLanguageSet.steps.identityVerificationLabel,
      labelPending: defaultLanguageSet.steps.identityVerificationLabelPending,
      subSteps: []
    },
    [VerificationSteps.statusCheck]: {
      code: VerificationSteps.statusCheck,
      label: defaultLanguageSet.steps.statusCheckLabel,
      labelPending: defaultLanguageSet.steps.statusCheckLabelPending,
      subSteps: []
    }
  };
}
