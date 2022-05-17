import domain from '../../../../../src/domain';
import mocknetMapAssertion from './assertions/mocknetMapAssertion';
import mainnetMapAssertion from './assertions/mainnetMapAssertion';
import { SUB_STEPS, VerificationSteps } from '../../../../../src/constants/verificationSteps';
import i18n from '../../../../../src/data/i18n.json';
import currentLocale from '../../../../../src/constants/currentLocale';
import type { IVerificationMapItem } from '../../../../../src/models/VerificationMap';

const defaultLanguageSet = i18n[currentLocale.locale];

describe('domain certificates get verification map use case test suite', function () {
  describe('given it is called with the mocknet chain', function () {
    it('should return a mocknet verification map', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap().verificationMap;
      expect(result).toEqual(mocknetMapAssertion);
    });
  });

  describe('given it is called with the bitcoin chain', function () {
    it('should return a mainnet verification map', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap().verificationMap;
      expect(result).toEqual(mainnetMapAssertion);
    });

    describe('and the blockcerts version is v3', function () {
      it('should return a mainnet verification map without the getIssuerProfile step', function () {
        const result: IVerificationMapItem[] = domain.certificates.getVerificationMap().verificationMap;
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(mainnetMapAssertion));
        expect(result).toEqual(expectedOutput);
      });
    });

    describe('and the blockcerts issuer shared their DID', function () {
      it('should add the identityVerification step', function () {
        const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(true).verificationMap;
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(mainnetMapAssertion));

        // add because did
        expectedOutput.find(step => step.code === VerificationSteps.identityVerification).subSteps = [
          {
            code: SUB_STEPS.controlVerificationMethod,
            label: defaultLanguageSet.subSteps.controlVerificationMethodLabel,
            labelPending: defaultLanguageSet.subSteps.controlVerificationMethodLabelPending,
            parentStep: VerificationSteps.identityVerification
          }
        ];

        expect(result).toEqual(expectedOutput);
      });
    });
  });
});
