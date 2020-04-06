import { Certificate, STEPS, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import FIXTURES from '../../fixtures';
import domain from '../../../src/domain';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given the callback parameter is passed', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          certificate = new Certificate(FIXTURES.MainnetV2Valid);
          await certificate.init();
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

      describe('when the certificate is invalid', function () {
        let certificate;

        it('should call it with the step, the text, the status & the error message', async function () {
          const updates = [];
          const assertionStep = {
            code: SUB_STEPS.checkRevokedStatus,
            label: SUB_STEPS.language.checkRevokedStatus.labelPending,
            status: VERIFICATION_STATUSES.FAILURE,
            errorMessage: 'This certificate has been revoked by the issuer. Reason given: Issued in error.'
          };

          certificate = new Certificate(FIXTURES.MainnetV2Revoked);
          await certificate.init();

          await certificate.verify(update => {
            updates.push(update);
          });

          const comparisonStep = updates.find(update => update.code === SUB_STEPS.checkRevokedStatus && update.status === VERIFICATION_STATUSES.FAILURE);
          expect(comparisonStep).toEqual(assertionStep);
        });

        it('should return the failure finalStep', async function () {
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.FAILURE,
            message: 'This certificate has been revoked by the issuer. Reason given: Issued in error.'
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });
    });
  });
});
