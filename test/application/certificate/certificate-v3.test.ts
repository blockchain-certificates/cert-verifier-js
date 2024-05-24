import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { Certificate } from '../../../src';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import fixtureIssuerProfile from '../../fixtures/issuer-profile.json';
import BlockcertsV3 from '../../fixtures/v3/testnet-v3-did.json';
import notAnIssuerProfile from '../../fixtures/v3/testnet-v3--no-did.json';

const errorIssuerProfileRejectsURL = 'https://failing.url';
const notAnIssuerProfileURL = 'https://not.issuer.profile.url';

describe('Certificate entity test suite', function () {
  const fixture = BlockcertsV3;

  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`) {
            return JSON.stringify({ didDocument });
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }

          if (url === errorIssuerProfileRejectsURL) {
            return await Promise.reject(new Error('Error fetching url:' + url + '; status code:404'));
          }

          if (url === notAnIssuerProfileURL) {
            return JSON.stringify(notAnIssuerProfile);
          }
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  describe('constructor method', function () {
    describe('given it is called with valid v3 certificate data', function () {
      let certificate;

      beforeEach(async function () {
        certificate = new Certificate(fixture);
        await certificate.init();
      });

      afterEach(function () {
        certificate = null;
      });

      it('should set the expires property', function () {
        // not currently set in the fixture
        expect(certificate.expires).toEqual((fixture as any).expirationDate);
      });

      it('should set the metadataJson property', function () {
        expect(certificate.metadataJson).toEqual(fixture.metadata);
      });

      it('should set the issuer property', function () {
        const expectedOutput = JSON.parse(JSON.stringify(fixtureIssuerProfile));
        expectedOutput.didDocument = didDocument;
        expect(certificate.issuer).toEqual(expectedOutput);
      });

      it('should set the issuedOn property', function () {
        expect(certificate.issuedOn).toEqual(fixture.issuanceDate);
      });

      it('should set the id property', function () {
        expect(certificate.id).toEqual(fixture.id);
      });

      it('should set the recordLink property', function () {
        expect(certificate.recordLink).toEqual(fixture.id);
      });

      it('should set the recipientFullName property', function () {
        expect(certificate.recipientFullName).toEqual(fixture.credentialSubject.name);
      });
    });

    describe('retrieving the issuer profile - failing cases', function () {
      describe('when the issuer profile is undefined', function () {
        it('should throw an error', async function () {
          const failingFixture = JSON.parse(JSON.stringify(fixture));
          delete failingFixture.issuer;
          const certificate = new Certificate(failingFixture);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile - no issuer address given');
        });
      });

      describe('when the issuer profile is null', function () {
        it('should throw an error', async function () {
          const failingFixture = JSON.parse(JSON.stringify(fixture));
          failingFixture.issuer = null;
          const certificate = new Certificate(failingFixture);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile - no issuer address given');
        });
      });

      describe('when the issuer profile is an empty string', function () {
        it('should throw an error', async function () {
          const failingFixture = JSON.parse(JSON.stringify(fixture));
          failingFixture.issuer = '';
          const certificate = new Certificate(failingFixture);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile - no issuer address given');
        });
      });

      describe('when the issuer profile is not a valid URL', function () {
        it('should throw an error', async function () {
          const failingFixture = JSON.parse(JSON.stringify(fixture));
          failingFixture.issuer = 'this is not a URL';
          const certificate = new Certificate(failingFixture);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile - no issuer address given');
        });
      });

      describe('when the issuer profile URL yields a server error', function () {
        it('should throw an error', async function () {
          const errorIssuerCertificate = JSON.parse(JSON.stringify(fixture));
          errorIssuerCertificate.issuer = errorIssuerProfileRejectsURL;
          const certificate = new Certificate(errorIssuerCertificate);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile');
        });
      });

      describe('when the issuer profile URL is not of a issuer profile', function () {
        it('should throw an error', async function () {
          const notAnIssuerProfileCertificate = JSON.parse(JSON.stringify(fixture));
          notAnIssuerProfileCertificate.issuer = notAnIssuerProfileURL;
          const certificate = new Certificate(notAnIssuerProfileCertificate);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile - retrieved file does not seem to be a valid profile');
        });
      });
    });
  });
});
