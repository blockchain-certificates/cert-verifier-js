import FIXTURES from '../../fixtures';
import { Certificate } from '../../../src';
import { CertificateOptions } from '../../../src/certificate';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('certificate definition', function () {
      describe('given it is not invoked with a JSON string', function () {
        let certificate: Certificate;

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
    });

    describe('options argument', function () {
      describe('given no options is passed', function () {
        it('should set the default options', function () {
          const assertionDefaultOptions: CertificateOptions = { locale: 'en-US' };
          const instance = new Certificate(FIXTURES.MainnetV2Valid);
          expect(instance.options).toEqual(assertionDefaultOptions);
        });
      });

      describe('given the options object is passed', function () {
        it('should override the default options', function () {
          const fixtureOptions: CertificateOptions = { locale: 'fr-FR' };
          const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
          expect(instance.options).toEqual(fixtureOptions);
        });

        describe('and no locale option is passed', function () {
          it('should set the locale on the certificate object to en-US', function () {
            const instance = new Certificate(FIXTURES.MainnetV2Valid);
            expect(instance.locale).toBe('en-US');
          });
        });

        describe('and locale option is passed', function () {
          describe('and the locale is supported', function () {
            it('should set the locale on the certificate object', function () {
              const fixtureOptions: CertificateOptions = { locale: 'es' };
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
              expect(instance.locale).toBe(fixtureOptions.locale);
            });
          });

          describe('and the locale is not supported', function () {
            it('should set the locale to the default one', function () {
              const fixtureUnsupportedLocaleOptions: CertificateOptions = { locale: 'az-az' };
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureUnsupportedLocaleOptions);
              expect(instance.locale).toBe('en-US');
            });
          });

          describe('and auto locale option is passed', function () {
            beforeEach(function () {
              interface ExtendedNavigator extends Navigator {
                __defineGetter__ (prop: string, cb: Function): any;
              }
              (window.navigator as ExtendedNavigator).__defineGetter__('language', function () {
                return 'it';
              });
            });

            it('should set the locale on the certificate object', function () {
              const fixtureOptions: CertificateOptions = { locale: 'auto' };
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
              expect(instance.locale).toBe('it-IT');
            });
          });
        });
      });
    });
  });
});
