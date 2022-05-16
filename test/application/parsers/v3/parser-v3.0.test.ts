import FIXTURES from '../../../fixtures';
import parseJSON from '../../../../src/parsers/index';
import v3IssuerProfile from '../../../assertions/v3.0-issuer-profile.json';
import didDocument from '../../../fixtures/did/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ.json';
import assertionProofValue from '../../../assertions/testnet-v3.0-did-signature-merkle2019.json';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import { universalResolverUrl } from '../../../../src/domain/did/valueObjects/didResolver';

const fixture = FIXTURES.BlockcertsV3;
const assertionIssuerProfile = {
  ...v3IssuerProfile,
  didDocument
};

describe('Parser v3 test suite', function () {
  describe('given it is called with a invalid format v3 certificate data', function () {
    it('should set whether or not the certificate format is valid', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixture));
      delete fixtureCopy.proof;
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate.isFormatValid).toBe(false);
    });
  });

  describe('given it is called with valid v3 certificate data', function () {
    let parsedCertificate;
    let requestStub;

    beforeEach(async function () {
      requestStub = sinon.stub(ExplorerLookup, 'request');
      requestStub.withArgs({ url: `${universalResolverUrl}/did:ion:EiA_Z6LQILbB2zj_eVrqfQ2xDm4HNqeJUw5Kj2Z7bFOOeQ` })
        .resolves(JSON.stringify({ didDocument }));
      requestStub.withArgs({
        url: 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json'
      }).resolves(JSON.stringify(v3IssuerProfile));
      parsedCertificate = await parseJSON(fixture);
    });

    afterEach(function () {
      parsedCertificate = null;
      requestStub.restore();
    });

    it('should set the id of the certificate object', function () {
      expect(parsedCertificate.id).toEqual(fixture.id);
    });

    it('should set issuedOn of the certificate object', function () {
      expect(parsedCertificate.issuedOn).toBe(fixture.issuanceDate);
    });

    it('should retrieve the issuer profile of the certificate object', function () {
      expect(parsedCertificate.issuer).toEqual(assertionIssuerProfile);
    });

    it('should set metadataJson of the certificate object', function () {
      expect(parsedCertificate.metadataJson).toEqual(fixture.metadata);
    });

    it('should set the receipt of the certificate object', function () {
      expect(parsedCertificate.receipt).toEqual(assertionProofValue);
    });

    it('should set the recipientFullName of the certificate object', function () {
      const fullNameAssertion = fixture.credentialSubject.name;
      expect(parsedCertificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set recordLink of the certificate object', function () {
      expect(parsedCertificate.recordLink).toBe(fixture.id);
    });

    it('should return the display property', function () {
      expect(parsedCertificate.display).toEqual(fixture.display);
    });

    describe('when the expirationDate is set', function () {
      it('should set the expires property', async function () {
        const fixtureCopy = JSON.parse(JSON.stringify(fixture));
        fixtureCopy.expirationDate = '2022-04-27T00:00:00Z';
        const parsedCertificate = await parseJSON(fixtureCopy);
        expect(parsedCertificate.expires).toEqual(fixtureCopy.expirationDate);
      });
    });
  });
});
