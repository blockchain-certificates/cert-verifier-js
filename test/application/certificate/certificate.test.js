import FIXTURES from '../../fixtures';
import { Certificate } from '../../../src';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is not invoked with a JSON string', function () {
      let certificate;

      it('should coerce certificateJson to an object', function () {
        certificate = new Certificate(JSON.stringify(FIXTURES.MainnetV2Valid));
        expect(certificate.certificateJson).toEqual(FIXTURES.MainnetV2Valid);
      });
    });

    describe('given it is invoked with invalid certificate data', function () {
      it('should return an error', function () {
        expect(function () {
          /* eslint no-new: "off" */
          new Certificate('invalid-certificate-data');
        }).toThrowError('This is not a valid certificate');
      });
    });

    describe('given it is invoked with no certificate data', function () {
      it('should throw an error', function () {
        expect(function () {
          /* eslint no-new: "off" */
          new Certificate();
        }).toThrowError('This is not a valid certificate');
      });
    });

    describe('given no options is passed', function () {
      let instance;
      const assertionDefaultOptions = { locale: 'en-US' };

      afterEach(function () {
        instance = null;
      });

      it('should set the default options', function () {
        instance = new Certificate(FIXTURES.MainnetV2Valid);
        expect(instance.options).toEqual(assertionDefaultOptions);
      });
    });

    describe('given options object is passed', function () {
      let instance;
      const fixtureOptions = { locale: 'en-US' };

      afterEach(function () {
        instance = null;
      });

      it('should override the default options', function () {
        instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
        expect(instance.options).toEqual(fixtureOptions);
      });
    });

    describe('given no locale option is passed', function () {
      let instance;

      afterEach(function () {
        instance = null;
      });

      it('should set the locale on the certificate object to en-US', function () {
        instance = new Certificate(FIXTURES.MainnetV2Valid);
        expect(instance.locale).toBe('en-US');
      });
    });

    describe('given locale option is passed', function () {
      let instance;
      const fixtureOptions = { locale: 'es' };
      const fixtureInvalidLocaleOptions = { locale: 'az-az' };

      afterEach(function () {
        instance = null;
      });

      it('should set the locale on the certificate object', function () {
        instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
        expect(instance.locale).toBe(fixtureOptions.locale);
      });

      describe('given the locale is invalid', () => {
        it('should set the locale to the default one', () => {
          instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureInvalidLocaleOptions);
          expect(instance.locale).toBe('en-US');
        });
      });
    });

    describe('given auto locale option is passed', function () {
      let instance;
      const fixtureOptions = { locale: 'auto' };

      beforeEach(function () {
        navigator.__defineGetter__('language', function () {
          return 'en-US';
        });
      });

      it('should set the locale on the certificate object', function () {
        instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
        expect(instance.locale).toBe('en-US');
      });
    });
  });
});
