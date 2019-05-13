import { Certificate, STEPS, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import FIXTURES from '../../fixtures';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given the callback parameter is passed', function () {
      describe('when the certificate is valid', function () {
        let certificate;

        beforeEach(async function () {
          certificate = new Certificate(FIXTURES.MainnetV2Valid);
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
          const expectedFinalStep = {
            code: STEPS.final,
            status: VERIFICATION_STATUSES.SUCCESS
          };

          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(expectedFinalStep);
        });
      });

      describe('when the certificate is invalid', function () {
        it.only('should call it with the step, the text, the status & the error message', async function () {
          const updates = [];
          const certificate = new Certificate(FIXTURES.MainnetV2Revoked);
          await certificate.verify(update => {
            updates.push(update);
          });

          let assertionStep = {
            code: SUB_STEPS.checkRevokedStatus,
            label: SUB_STEPS.language.checkRevokedStatus.labelPending,
            status: VERIFICATION_STATUSES.FAILURE,
            errorMessage: 'This certificate has been revoked by the issuer. Reason given: Issued in error.'
          };

          const comparisonStep = updates.find(update => update.code === SUB_STEPS.checkRevokedStatus);
          expect(comparisonStep).toEqual(assertionStep);
        });
      });
    });
  });
});
