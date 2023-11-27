import verificationMapFixture from '../../../../assertions/verification-steps-v1-mainnet';
import domain from '../../../../../src/domain';
import { VerificationSteps } from '../../../../../src/constants/verificationSteps';
import i18n from '../../../../../src/data/i18n.json';
import currentLocale from '../../../../../src/constants/currentLocale';
import { VERIFICATION_STATUSES } from '../../../../../src';
import type { IVerificationMapItem } from '../../../../../src/models/VerificationMap';

const defaultLanguageSet = i18n[currentLocale.locale];

describe('Domain verifier test suite', function () {
  describe('findVerificationSubstep method', function () {
    describe('given a step code and a verification map', function () {
      it('should retrieve the step object', function () {
        const fixtureCode = 'getTransactionId';
        const fixtureMap: IVerificationMapItem[] = verificationMapFixture;
        const output = domain.verifier.findVerificationSubstep(fixtureCode, fixtureMap, 'MerkleProof2017');
        expect(output).toEqual({
          code: 'getTransactionId',
          label: defaultLanguageSet.subSteps.getTransactionIdLabel,
          labelPending: defaultLanguageSet.subSteps.getTransactionIdLabelPending,
          parentStep: VerificationSteps.proofVerification,
          status: VERIFICATION_STATUSES.DEFAULT
        });
      });
    });
  });
});
