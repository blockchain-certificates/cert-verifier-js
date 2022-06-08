import { Certificate } from '../../../src';
import FIXTURES from '../../fixtures';
import didDocument from '../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../src/domain/did/valueObjects/didResolver';
import fixtureIssuerProfile from '../../fixtures/issuer-profile.json';
import notAnIssuerProfile from '../../fixtures/v3/testnet-v3--no-did.json';

describe('Certificate entity test suite', function () {
  const fixture = FIXTURES.BlockcertsV3;
  let requestStub;

  beforeEach(function () {
    requestStub = sinon.stub(ExplorerLookup, 'request');
    requestStub.withArgs({
      url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ`
    }).resolves(JSON.stringify({ didDocument }));
    requestStub.withArgs({
      url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
    }).resolves(JSON.stringify(fixtureIssuerProfile));
  });

  afterEach(function () {
    sinon.restore();
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
          requestStub.withArgs({
            url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
          }).rejects();
          const certificate = new Certificate(fixture);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile');
        });
      });

      describe('when the issuer profile URL is not of a issuer profile', function () {
        it('should throw an error', async function () {
          requestStub.withArgs({
            url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
          }).resolves(JSON.stringify(notAnIssuerProfile));
          const certificate = new Certificate(fixture);
          await expect(certificate.init())
            .rejects
            .toThrow('Unable to get issuer profile - retrieved file does not seem to be a valid profile');
        });
      });
    });
  });
});
