import FIXTURES from '../../fixtures';
import { Certificate } from '../../../src';

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
});
