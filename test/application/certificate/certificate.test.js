import FIXTURES from '../../fixtures';
import { Certificate } from '../../../src';
import { VERIFICATION_STATUSES } from '../../../src/constants';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is not called with a JSON object', function () {
      let certificate;

      beforeEach(function () {
        certificate = new Certificate(JSON.stringify(FIXTURES.MainnetV2Valid));
      });

      afterEach(function () {
        certificate = null;
      });

      it('should coerce certificateJson to an object', function () {
        expect(certificate.certificateJson).toEqual(FIXTURES.MainnetV2Valid);
      });
    });

    describe('given it is called with invalid certificate data', function () {
      it('should return an error', function () {
        expect(function () {
          /* eslint no-new: "off" */
          new Certificate('invalid-certificate-data');
        }).toThrowError('This is not a valid certificate');
      });
    });

    describe('given it is called with no certificate data', function () {
      it('should throw an error', function () {
        expect(function () {
          /* eslint no-new: "off" */
          new Certificate();
        }).toThrowError('This is not a valid certificate');
      });
    });
  });

  describe('isFailing method', function () {
    describe('when all checks are successful', function () {
      it('should return false', function () {
        const certificate = new Certificate(FIXTURES.MainnetV2Valid);
        certificate._stepsStatuses.push({step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1'});
        certificate._stepsStatuses.push({step: 'testStep 2', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 2'});

        expect(certificate._isFailing()).toBe(false);
      });
    });
    describe('when one check is failing', function () {
      it('should return true', function () {
        const certificate = new Certificate(FIXTURES.MainnetV2Valid);
        certificate._stepsStatuses.push({step: 'testStep 1', status: VERIFICATION_STATUSES.SUCCESS, action: 'Test Step 1'});
        certificate._stepsStatuses.push({step: 'testStep 2', status: VERIFICATION_STATUSES.FAILURE, action: 'Test Step 2'});

        expect(certificate._isFailing()).toBe(true);
      });
    });
  });
});
