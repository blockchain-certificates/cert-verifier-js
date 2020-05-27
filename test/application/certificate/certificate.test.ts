import FIXTURES from '../../fixtures';
import { Certificate } from '../../../src';
import { CertificateOptions } from '../../../src/certificate';
import { TransactionData } from '../../../src/models/TransactionData';

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
            new Certificate(undefined);
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

        it('should set the locale to the default value', function () {
          const assertionDefaultOptions: CertificateOptions = { locale: 'en-US' };
          const instance = new Certificate(FIXTURES.MainnetV2Valid);
          expect(instance.locale).toEqual(assertionDefaultOptions.locale);
        });
      });

      describe('given the options object is passed', function () {
        describe('locale option', function () {
          it('should override the default options', function () {
            const fixtureOptions: CertificateOptions = { locale: 'fr-FR' };
            const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
            expect(instance.options).toEqual(fixtureOptions);
          });

          describe('when it is not set', function () {
            it('should set the locale on the certificate object to en-US', function () {
              const fixtureOptions: CertificateOptions = {};
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
              expect(instance.locale).toBe('en-US');
            });
          });

          describe('when the locale is supported', function () {
            it('should set the locale on the certificate object', function () {
              const fixtureOptions: CertificateOptions = { locale: 'es' };
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
              expect(instance.locale).toBe(fixtureOptions.locale);
            });
          });

          describe('when the locale is not supported', function () {
            it('should set the locale to the default one', function () {
              const fixtureUnsupportedLocaleOptions: CertificateOptions = { locale: 'az-az' };
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureUnsupportedLocaleOptions);
              expect(instance.locale).toBe('en-US');
            });
          });

          describe('when the locale is set to auto', function () {
            beforeEach(function () {
              interface ExtendedNavigator extends Navigator {
                __defineGetter__: (prop: string, cb: Function) => any;
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

        describe('explorerAPIs option', function () {
          describe('when it is not set', function () {
            it('should set the certificate explorerAPIs property to an empty array', function () {
              const fixtureOptions: CertificateOptions = {};
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
              expect(instance.explorerAPIs).toEqual([]);
            });
          });

          describe('when it is set', function () {
            it('should set the certificate explorerAPIs property to the options explorerAPIs', function () {
              const fixtureOptions: CertificateOptions = {
                explorerAPIs: [{
                  serviceURL: 'https://explorer-example.com',
                  priority: 0,
                  parsingFunction: (): TransactionData => ({
                    remoteHash: 'a',
                    issuingAddress: 'b',
                    time: 'c',
                    revokedAddresses: ['d']
                  })
                }]
              };
              const instance = new Certificate(FIXTURES.MainnetV2Valid, fixtureOptions);
              expect(instance.explorerAPIs).toEqual(fixtureOptions.explorerAPIs);
            });
          });
        });
      });
    });
  });
});
