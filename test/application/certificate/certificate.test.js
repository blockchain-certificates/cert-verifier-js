import FIXTURES from '../../fixtures';
import Certificate from '../../../src/certificate';
import { VERIFICATION_STATUSES } from '../../../src/index';
import { readFileAsync } from '../utils/readFile';
import { getVerboseMessage } from '../../../config/default';
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
    xdescribe('the step callback function', () => {
      let data;
      let callbackSpy;
      let testCode;
      let expectedName;
      let certificateInstance;

      beforeEach(async () => {
        data = await readFileAsync('test/fixtures/mocknet-2.0.json');
        callbackSpy = sinon.spy();
        certificateInstance = new Certificate(JSON.parse(data));

        testCode = 'getTransactionId';
        expectedName = getVerboseMessage(testCode);
      });

      afterEach(() => {
        data = null;
        callbackSpy = null;

        testCode = null;
        expectedName = null;
      });

      describe('when there is no failure', () => {
        it('should be called with the code, the name and the status of the step', async () => {
          await certificateInstance.verify(callbackSpy);
          // verifierInstance._doAction(testCodefunction () => {});
          expect(callbackSpy.calledWithExactly(testCode, expectedName, VERIFICATION_STATUSES.SUCCESS, undefined)).toBe(true);
        });
      });

      describe('when there is a failure', () => {
        it('should be called with the code, the name, the status and the error message', async () => {
          const errorMessage = 'Testing the test';
          await certificateInstance.verify(callbackSpy);
          // verifierInstance._doAction(testCodefunction () => { throw new Error(errorMessage); });
          expect(callbackSpy.calledWithExactly(testCode, expectedName, VERIFICATION_STATUSES.FAILURE, errorMessage)).toBe(true);
        });
      });
    });
  });
});
