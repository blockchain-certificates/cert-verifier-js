import FIXTURES from '../../fixtures';
import { Certificate } from '../../../src';

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
});
