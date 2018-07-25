import FIXTURES from '../../fixtures';
import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../../src';
import sinon from 'sinon';

describe('Certificate entity test suite', () => {
  describe('constructor method', () => {
    describe('given is is not called with a JSON object', () => {
      let certificate;

      beforeEach(() => {
        certificate = new Certificate(JSON.stringify(FIXTURES.MainnetV2Valid));
      });

      afterEach(() => {
        certificate = null;
      });

      it('should coerce certificateJson to an object', () => {
        expect(certificate.certificateJson).toEqual(FIXTURES.MainnetV2Valid);
      });
    });

    describe('given it is called with invalid certificate data', () => {
      it('should return an error', () => {
        expect(() => {
          /* eslint no-new: "off" */
          new Certificate('invalid-certificate-data');
        }).toThrowError('This is not a valid certificate');
      });
    });

    describe('given it is called with no certificate data', () => {
      it('should throw an error', () => {
        expect(() => {
          /* eslint no-new: "off" */
          new Certificate();
        }).toThrowError('This is not a valid certificate');
      });
    });
  });

  describe('verify method', () => {
    describe('given the callback parameter is passed', () => {
      describe('when the certificate is valid', () => {
        let finalStep;
        let certificate;
        let callbackSpy = sinon.spy();
        let assertionStep = {
          step: SUB_STEPS.getTransactionId,
          action: SUB_STEPS.language.getTransactionId.actionLabel,
          status: VERIFICATION_STATUSES.SUCCESS
        };
        const assertionFinalStep = {
          status: VERIFICATION_STATUSES.SUCCESS
        };

        beforeEach(async () => {
          certificate = new Certificate(FIXTURES.MainnetV2Valid);
        });

        afterEach(() => {
          callbackSpy = null;
          certificate = null;
        });

        it('should call it with the step, the text and the status', async () => {
          finalStep = await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
          expect(finalStep).toEqual(assertionFinalStep);
        });
      });

      describe('when the certificate is invalid', () => {
        let certificate;
        let updates = [];
        let assertionStep = {
          step: SUB_STEPS.checkRevokedStatus,
          action: SUB_STEPS.language.checkRevokedStatus.actionLabel,
          status: VERIFICATION_STATUSES.FAILURE,
          errorMessage: 'This certificate has been revoked by the issuer. Reason given: Issued in error.'
        };

        it('should call it with the step, the text, the status & the error message', async () => {
          certificate = new Certificate(FIXTURES.MainnetV2Revoked);
          await certificate.verify(update => {
            updates.push(update);
          });
          const updateToLook = updates.find(update => update.step === SUB_STEPS.checkRevokedStatus && update.status === VERIFICATION_STATUSES.FAILURE);
          expect(updateToLook).toEqual(assertionStep);
        });
      });
    });
  });
});
