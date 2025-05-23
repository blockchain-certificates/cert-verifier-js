import { describe, it, expect } from 'vitest';
import domain from '../../../../../src/domain';
import verificationMapAssertion from '../../certificates/useCases/assertions/verificationMapAssertion';
import { SUB_STEPS, VerificationSteps } from '../../../../../src/domain/verifier/entities/verificationSteps';
import i18n from '../../../../../src/data/i18n.json';
import currentLocale from '../../../../../src/constants/currentLocale';
import type { IVerificationMapItem } from '../../../../../src/models/VerificationMap';
import { VERIFICATION_STATUSES } from '../../../../../src';

const defaultLanguageSet = i18n[currentLocale.locale];

describe('domain certificates get verification map use case test suite', function () {
  describe('given it is called', function () {
    it('should return a verification map', function () {
      const result: IVerificationMapItem[] = domain.verifier.getVerificationMap().verificationMap;
      expect(result).toEqual(verificationMapAssertion);
    });

    describe('and the blockcerts issuer shared their DID', function () {
      it('should add the identityVerification step', function () {
        const result: IVerificationMapItem[] = domain.verifier.getVerificationMap({
          hasDid: true
        }).verificationMap;
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(verificationMapAssertion));

        // add because did
        expectedOutput.find(step => step.code === VerificationSteps.identityVerification).subSteps = [
          {
            code: SUB_STEPS.controlVerificationMethod,
            label: defaultLanguageSet.subSteps.controlVerificationMethodLabel,
            labelPending: defaultLanguageSet.subSteps.controlVerificationMethodLabelPending,
            parentStep: VerificationSteps.identityVerification,
            status: VERIFICATION_STATUSES.DEFAULT
          }
        ];

        expect(result).toEqual(expectedOutput);
      });
    });

    describe('and the certificate has hashlinks', function () {
      it('should add the checkImageIntegrity step', function () {
        const result: IVerificationMapItem[] = domain.verifier
          .getVerificationMap({ hasHashlinks: true }).verificationMap;
        const expectedOutput: IVerificationMapItem[] = JSON.parse(JSON.stringify(verificationMapAssertion));

        expectedOutput.find(step => step.code === VerificationSteps.formatValidation).subSteps = [
          {
            code: SUB_STEPS.checkImagesIntegrity,
            label: defaultLanguageSet.subSteps.checkImagesIntegrityLabel,
            labelPending: defaultLanguageSet.subSteps.checkImagesIntegrityLabelPending,
            parentStep: VerificationSteps.formatValidation,
            status: VERIFICATION_STATUSES.DEFAULT
          }
        ];

        expect(result).toEqual(expectedOutput);
      });
    });

    describe('and the certificate has a validFrom property', function () {
      it('should add the ensureValidityPeriodStarted step', function () {
        const result: IVerificationMapItem[] = domain.verifier
          .getVerificationMap({ hasValidFrom: true }).verificationMap;
        const resultEnsureValidityPeriodStartedStep = result
          .find(step => step.code === VerificationSteps.statusCheck).subSteps
          .find(subStep => subStep.code === SUB_STEPS.ensureValidityPeriodStarted);

        const expectedStep = {
          code: SUB_STEPS.ensureValidityPeriodStarted,
          label: defaultLanguageSet.subSteps.ensureValidityPeriodStartedLabel,
          labelPending: defaultLanguageSet.subSteps.ensureValidityPeriodStartedLabelPending,
          parentStep: VerificationSteps.statusCheck,
          status: VERIFICATION_STATUSES.DEFAULT
        };

        expect(resultEnsureValidityPeriodStartedStep).toEqual(expectedStep);
      });
    });

    describe('and the certificate has a credentialSchema property', function () {
      it('should add the checkCredentialSchemaConformity step', function () {
        const result: IVerificationMapItem[] = domain.verifier
          .getVerificationMap({ hasCredentialSchema: true }).verificationMap;
        const resultEnsureValidityPeriodStartedStep = result
          .find(step => step.code === VerificationSteps.formatValidation).subSteps
          .find(subStep => subStep.code === SUB_STEPS.checkCredentialSchemaConformity);

        const expectedStep = {
          code: SUB_STEPS.checkCredentialSchemaConformity,
          label: defaultLanguageSet.subSteps.checkCredentialSchemaConformityLabel,
          labelPending: defaultLanguageSet.subSteps.checkCredentialSchemaConformityLabelPending,
          parentStep: VerificationSteps.formatValidation,
          status: VERIFICATION_STATUSES.DEFAULT
        };

        expect(resultEnsureValidityPeriodStartedStep).toEqual(expectedStep);
      });
    });

    describe('and the certificate is a Verifiable Presentation', function () {
      it('should not add the ensureValidityPeriodStarted step', function () {
        const result: IVerificationMapItem[] = domain.verifier
          .getVerificationMap({ isVerifiablePresentation: true }).verificationMap;
        const resultEnsureValidityPeriodStartedStep = result
          .find(step => step.code === VerificationSteps.statusCheck).subSteps
          .find(subStep => subStep.code === SUB_STEPS.ensureValidityPeriodStarted);

        expect(resultEnsureValidityPeriodStartedStep).toBeUndefined();
      });
    });

    describe('and the certificate is a VC V2 credential', function () {
      it('should add the validateDateFormat step', function () {
        const result: IVerificationMapItem[] = domain.verifier
          .getVerificationMap({ isVCV2: true }).verificationMap;
        const resultEnsureValidityPeriodStartedStep = result
          .find(step => step.code === VerificationSteps.formatValidation).subSteps
          .find(subStep => subStep.code === SUB_STEPS.validateDateFormat);

        const expectedStep = {
          code: SUB_STEPS.validateDateFormat,
          label: defaultLanguageSet.subSteps.validateDateFormatLabel,
          labelPending: defaultLanguageSet.subSteps.validateDateFormatLabelPending,
          parentStep: VerificationSteps.formatValidation,
          status: VERIFICATION_STATUSES.DEFAULT
        };

        expect(resultEnsureValidityPeriodStartedStep).toEqual(expectedStep);
      });
    });

    describe('and the certificate is not a VC V2 credential', function () {
      it('should not add the validateDateFormat step', function () {
        const result: IVerificationMapItem[] = domain.verifier
          .getVerificationMap({ isVCV2: false }).verificationMap;
        const resultEnsureValidityPeriodStartedStep = result
          .find(step => step.code === VerificationSteps.formatValidation).subSteps
          .find(subStep => subStep.code === SUB_STEPS.validateDateFormat);

        expect(resultEnsureValidityPeriodStartedStep).toBeUndefined();
      });
    });
  });
});
