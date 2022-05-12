import { Certificate, STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import FIXTURES from '../../fixtures';
import domain from '../../../src/domain';
import { getText } from '../../../src/domain/i18n/useCases';
import { SUB_STEPS } from '../../../src/constants/verificationSteps';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given it is called with a Blockcerts v3', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(domain.verifier, 'lookForTx').resolves({
            remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
            issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
            time: '2022-04-05T18:45:30.000Z',
            revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
          });
          certificate = new Certificate(FIXTURES.BlockcertsV3);
          await certificate.init();
        });

        afterEach(function () {
          certificate = null;
          sinon.restore();
        });

        it('should call the verification callback with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.checkExpiresDate,
            label: getText('subSteps', `${SUB_STEPS.checkExpiresDate}LabelPending`),
            status: VERIFICATION_STATUSES.SUCCESS
          };

          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
        });

        it('should return the success finalStep', async function () {
          const successMessage = domain.i18n.getText('success', 'blockchain');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.SUCCESS,
            message: successMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });

        xit('should set the publicKey property on the certificate', async function () {
          // TODO: this test needs to be updated in the light of having multiple signatures
          await certificate.verify();
          expect(certificate.publicKey).toBe('mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am');
        });
      });

      describe('when the certificate has been tampered with', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(domain.verifier, 'lookForTx').resolves({
            remoteHash: '68df661ae14f926878aabbe5ca33e46376e8bfb397c1364c2f1fa653ecd8b4b6',
            issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
            time: '2022-04-05T18:45:30.000Z',
            revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
          });
          certificate = new Certificate(FIXTURES.BlockcertsV3Tampered);
          await certificate.init();
        });

        afterEach(function () {
          sinon.restore();
          certificate = null;
        });

        it('should return the error finalStep', async function () {
          const errorMessage = domain.i18n.getText('errors', 'ensureHashesEqual');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.FAILURE,
            message: errorMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });
    });

    describe('given it is called with a Blockcerts v3 with custom contexts', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          sinon.stub(domain.verifier, 'lookForTx').resolves({
            remoteHash: '731225437616acfe1d4d3d671a27afefc15576c7d9911dab4acaf63f8fa09e8d',
            issuingAddress: 'mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am',
            time: '2022-03-24T21:50:16.000Z',
            revokedAddresses: ['mgdWjvq4RYAAP5goUNagTRMx7Xw534S5am']
          });
          certificate = new Certificate(FIXTURES.BlockcertsV3CustomContext);
          await certificate.init();
        });

        afterEach(function () {
          sinon.restore();
          certificate = null;
        });

        it('should call the callback function with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.checkExpiresDate,
            label: getText('subSteps', `${SUB_STEPS.checkExpiresDate}LabelPending`),
            status: VERIFICATION_STATUSES.SUCCESS
          };

          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
        });

        it('should return the success finalStep', async function () {
          const successMessage = domain.i18n.getText('success', 'blockchain');
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.SUCCESS,
            message: successMessage
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });
    });
  });
});
