import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';
import FIXTURES from '../../fixtures';

describe('Certificate test suite', function () {
  describe('verify method', function () {
    describe('given the callback parameter is passed', function () {
      describe('when the certificate is valid', function () {
        let finalStep;
        let certificate;
        let callbackSpy = sinon.spy();
        let assertionStep = {
          code: SUB_STEPS.getTransactionId,
          label: SUB_STEPS.language.getTransactionId.labelPending,
          status: VERIFICATION_STATUSES.SUCCESS
        };
        const assertionFinalStep = {
          status: VERIFICATION_STATUSES.SUCCESS
        };

        beforeEach(async function () {
          certificate = new Certificate(FIXTURES.MainnetV2Valid);
        });

        afterEach(function () {
          callbackSpy = null;
          certificate = null;
        });

        it('should call it with the step, the text and the status', async function () {
          finalStep = await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
          expect(finalStep).toEqual(assertionFinalStep);
        });
      });

      describe('when the certificate is invalid', function () {
        let certificate;
        let updates = [];
        let assertionStep = {
          code: SUB_STEPS.checkRevokedStatus,
          label: SUB_STEPS.language.checkRevokedStatus.labelPending,
          status: VERIFICATION_STATUSES.FAILURE,
          errorMessage: 'This certificate has been revoked by the issuer. Reason given: Issued in error.'
        };

        it('should call it with the step, the text, the status & the error message', async function () {
          certificate = new Certificate(FIXTURES.MainnetV2Revoked);
          await certificate.verify(update => {
            updates.push(update);
          });
          const updateToLook = updates.find(update => update.code === SUB_STEPS.checkRevokedStatus && update.status === VERIFICATION_STATUSES.FAILURE);
          expect(updateToLook).toEqual(assertionStep);
        });
      });
    });
  });
});
