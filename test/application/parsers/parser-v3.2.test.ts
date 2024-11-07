import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import parseJSON from '../../../src/parsers';
import MonolingualBlockcertsV3 from '../../fixtures/v3/mocknet-vc-v2-name-description.json';
import MultilingualBlockcertsV3 from '../../fixtures/v3/mocknet-vc-v2-name-description-multilingual.json';
import MultipleCredentialSubjectsBlockcertsV3 from '../../fixtures/v3/mocknet-vc-v2-credential-subject-array.json';
import v3IssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('Parser v3 test suite', function () {
  describe('given it is called with valid v3.2 certificate data', function () {
    beforeAll(function () {
      vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
        const explorerLookup = await importOriginal();
        return {
          ...explorerLookup,
          // replace some exports
          request: async function ({ url }) {
            if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
              return JSON.stringify(v3IssuerProfile);
            }
          }
        };
      });
    });

    afterAll(function () {
      vi.restoreAllMocks();
    });

    describe('getting the name of the certificate', function () {
      describe('given the certificate is not multilingual', function () {
        it('should return the name property', async function () {
          const parsedCertificate = await parseJSON(MonolingualBlockcertsV3);
          expect(parsedCertificate.name).toBe('Canadian Id Card');
        });
      });

      describe('given the certificate is multilingual', function () {
        describe('and the current language is not supported by the certificate', function () {
          it('should return the first value available in the field', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'ru');
            expect(parsedCertificate.name).toBe('Canadian Id Card');
          });
        });

        describe('and the current language is set to English', function () {
          it('should return the correct language (en)', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'en');
            expect(parsedCertificate.name).toBe('Canadian Id Card');
          });
        });

        describe('and the current language is set to French (Canadian)', function () {
          it('should return the correct language (fr)', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'fr-CA');
            expect(parsedCertificate.name).toBe('Carte d\'Identité Canadienne');
          });
        });

        describe('and the current language is set to Arabic', function () {
          it('should return the correct language (ar)', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'ar');
            expect(parsedCertificate.name).toBe('بطاقة الهوية الكندية');
          });
        });
      });
    });

    describe('getting the description of the certificate', function () {
      describe('given the certificate is not multilingual', function () {
        it('should return the description property', async function () {
          const parsedCertificate = await parseJSON(MonolingualBlockcertsV3);
          expect(parsedCertificate.description).toBe('A Blockcerts example (not an official document) highlighting various VC v2 spec items');
        });
      });

      describe('given the certificate is multilingual', function () {
        describe('and the current language is not supported by the certificate', function () {
          it('should return the first value available in the field', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'ru');
            expect(parsedCertificate.description).toBe('A Blockcerts example (not an official document) highlighting various VC v2 spec items');
          });
        });

        describe('and the current language is set to English', function () {
          it('should return the correct language (en)', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'en');
            expect(parsedCertificate.description).toBe('A Blockcerts example (not an official document) highlighting various VC v2 spec items');
          });
        });

        describe('and the current language is set to French (Canadian)', function () {
          it('should return the correct language (fr)', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'fr-CA');
            expect(parsedCertificate.description).toBe('Un example Blockcerts (document non officiel) démontrant différents éléments de la spécification VC v2');
          });
        });

        describe('and the current language is set to Arabic', function () {
          it('should return the correct language (ar)', async function () {
            const parsedCertificate = await parseJSON(MultilingualBlockcertsV3, 'ar');
            expect(parsedCertificate.description).toBe('مثال على Blockcerts (ليس مستندًا رسميًا) يسلط الضوء على عناصر مواصفات VC v2 المختلفة');
          });
        });
      });
    });

    describe('Getting the recipient full name', function () {
      describe('when the credential subject is not an array', function () {
        it('should return the recipient full name', async function () {
          const parsedCertificate = await parseJSON(MonolingualBlockcertsV3);
          expect(parsedCertificate.recipientFullName).toBe('John Smith');
        });
      });

      describe('when the credential subject is an array', function () {
        describe('and the current language is specified in the certificate', function () {
          it('should return the recipient full name according to the language', async function () {
            const parsedCertificate = await parseJSON(MultipleCredentialSubjectsBlockcertsV3, 'fr');
            expect(parsedCertificate.recipientFullName).toBe('Jean Forgeron');
          });

          it('should return the recipient full name according to the language if a subset', async function () {
            const parsedCertificate = await parseJSON(MultipleCredentialSubjectsBlockcertsV3, 'fr-CA');
            expect(parsedCertificate.recipientFullName).toBe('Jean Forgeron');
          });
        });

        describe('and the current language is not specified in the certificate', function () {
          it('should return the first recipient full name', async function () {
            const parsedCertificate = await parseJSON(MultipleCredentialSubjectsBlockcertsV3, 'it');
            expect(parsedCertificate.recipientFullName).toBe('John Smith');
          });
        });
      });
    });
  });
});
