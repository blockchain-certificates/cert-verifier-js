import MainnetV2Certificate from '../../fixtures/mainnet-valid-2.0';
import MainnetV2Revoked from '../../fixtures/mainnet-revoked-2.0';
import Certificate from '../../../src/certificate';
import { VERIFICATION_STATUSES } from '../../../src';
import { getVerboseMessage } from '../../../config/default';
import sinon from 'sinon';

describe('Certificate entity test suite', () => {
  describe('constructor method', () => {
    describe('given is is not called with a JSON object', () => {
      let certificate;

      beforeEach(() => {
        certificate = new Certificate(JSON.stringify(MainnetV2Certificate));
      });

      afterEach(() => {
        certificate = null;
      });

      it('should coerce certificateJson to an object', () => {
        expect(certificate.certificateJson).toEqual(MainnetV2Certificate);
      });
    });

    describe('given it is called with invalid certificate data', () => {
      it('should return an error', () => {
        expect(() => {
          new Certificate('invalid-certificate-data');
        }).toThrowError('This is not a valid certificate');
      });
    });

    describe('given it is called with no certificate data', () => {
      it('should throw an error', () => {
        expect(() => {
          new Certificate();
        }).toThrowError('This is not a valid certificate');
      });
    });
  });

  describe('verify method', () => {
    describe('given the callback parameter is passed', () => {
      let certificate;
      let callbackSpy;
      let assertionStep;

      beforeEach(() => {
        assertionStep = {
          step: '',
          action: '',
          status: ''
        };
        callbackSpy = sinon.spy();
      });

      afterEach(() => {
        certificate = null;
        callbackSpy = null;
        assertionStep = null;
      });

      describe('when the certificate is valid', () => {
        it('should call it with the step, the text and the status', async () => {
          assertionStep.step = 'getTransactionId';
          assertionStep.action = getVerboseMessage(assertionStep.step);
          assertionStep.status = VERIFICATION_STATUSES.SUCCESS;

          certificate = new Certificate(MainnetV2Certificate);
          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(sinon.match(assertionStep))).toBe(true);
        });
      });

      describe('when the certificate is valid', () => {
        it('should return an object for the final step', async () => {
          const assertionFinalStep = {
            status: VERIFICATION_STATUSES.SUCCESS
          };
          certificate = new Certificate(MainnetV2Certificate);
          const finalStep = await certificate.verify();
          expect(finalStep).toEqual(assertionFinalStep);
        });
      });

      describe('when the certificate is invalid', () => {
        it('should call it with the step, the text, the status & the error message', async () => {
          assertionStep.step = 'checkingRevokedStatus';
          assertionStep.action = getVerboseMessage(assertionStep.step);
          assertionStep.status = VERIFICATION_STATUSES.FAILURE;
          assertionStep.errorMessage = 'This certificate has been revoked by the issuer. Reason given: Issued in error.';

          certificate = new Certificate(MainnetV2Revoked);
          await certificate.verify(callbackSpy);
          expect(callbackSpy.calledWith(assertionStep)).toBe(true);
        });
      });
    });
  });
});
