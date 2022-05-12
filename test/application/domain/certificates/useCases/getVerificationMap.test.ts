import domain from '../../../../../src/domain';
import { BLOCKCHAINS } from '../../../../../src';
import mocknetMapAssertion from './assertions/mocknetMapAssertion';
import mainnetMapAssertion from './assertions/mainnetMapAssertion';
import Versions from '../../../../../src/constants/certificateVersions';
import type { IVerificationMapItem } from '../../../../../src/domain/certificates/useCases/getVerificationMap';
import { SUB_STEPS, VerificationSteps } from '../../../../../src/constants/verificationSteps';
import i18n from '../../../../../src/data/i18n.json';
import currentLocale from '../../../../../src/constants/currentLocale';

const defaultLanguageSet = i18n[currentLocale.locale];

describe('domain certificates get verification map use case test suite', function () {
  describe('given it is called with the mocknet chain', function () {
    it('should return a mocknet verification map', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.mocknet, Versions.V2_0).verificationMap;
      expect(result).toEqual(mocknetMapAssertion);
    });
  });

  describe('given it is called with the bitcoin chain', function () {
    it('should return a mainnet verification map', function () {
      const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, Versions.V2_0).verificationMap;
      expect(result).toEqual(mainnetMapAssertion);
    });

    describe('and the blockcerts version is v3', function () {
      it('should return a mainnet verification map without the getIssuerProfile step', function () {
        const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, Versions.V3_0).verificationMap;
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(mainnetMapAssertion));
        // const getIssuerProfileIndex = expectedOutput[0].subSteps.findIndex(subStep => subStep.code === SUB_STEPS.getIssuerProfile);
        // expectedOutput[0].subSteps.splice(getIssuerProfileIndex, 1);
        expect(result).toEqual(expectedOutput);
      });
    });

    describe('and the blockcerts issuer shared their DID', function () {
      it('should add the identityVerification step', function () {
        const result: IVerificationMapItem[] = domain.certificates.getVerificationMap(BLOCKCHAINS.bitcoin, Versions.V3_0_beta, true).verificationMap;
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(mainnetMapAssertion));
        // remove because v3
        // const getIssuerProfileIndex = expectedOutput[0].subSteps.findIndex(subStep => subStep.code === SUB_STEPS.getIssuerProfile);
        // expectedOutput[0].subSteps.splice(getIssuerProfileIndex, 1);

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
