import { Certificate, STEPS, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import FIXTURES from '../../fixtures';
import domain from '../../../src/domain';

xdescribe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given it is called with a Blockcerts v3', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          certificate = new Certificate(FIXTURES.BlockcertsV3Alpha);
        });

        afterEach(function () {
          certificate = null;
        });

        it('should call it with the step, the text and the status', async function () {
          const callbackSpy = sinon.spy();
          const assertionStep = {
            code: SUB_STEPS.getTransactionId,
            label: SUB_STEPS.language.getTransactionId.labelPending,
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

      describe('when the certificate has been tampered with', function () {
        let certificate;

        beforeEach(async function () {
          certificate = new Certificate(FIXTURES.BlockcertsV3AlphaTampered);
        });

        afterEach(function () {
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

      describe('when the certificate does not have an issuer profile', function () {
        let certificate;

        beforeEach(async function () {
          certificate = new Certificate(FIXTURES.BlockcertsV3AlphaNoIssuerProfile);
        });

        afterEach(function () {
          certificate = null;
        });

        it('should return the error finalStep', async function () {
          const errorMessage = domain.i18n.getText('errors', 'getIssuerProfile');
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
  });
});
