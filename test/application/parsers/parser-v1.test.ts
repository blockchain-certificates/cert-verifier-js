import { CERTIFICATE_VERSIONS } from '../../../src/constants';
import parseJSON from '../../../src/parsers';
import sinon from 'sinon';
import * as ExplorerLookup from '@blockcerts/explorer-lookup';
import issuerProfileV1JsonFixture from '../../fixtures/v1/got-issuer_live.json';
import fixture from '../../fixtures/v1/mainnet-valid-1.2.json';

describe('Parser test suite', function () {
  let stubRequest;

  beforeEach(function () {
    stubRequest = sinon.stub(ExplorerLookup, 'request');
    stubRequest.withArgs({
      url: 'http://www.blockcerts.org/mockissuer/issuer/got-issuer_live.json'
    }).resolves(JSON.stringify(issuerProfileV1JsonFixture));
  });

  afterEach(function () {
    stubRequest.restore();
  });

  describe('given it is called with a invalid format v2 certificate data', function () {
    it('should set whether or not the certificate format is valid', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixture));
      delete fixtureCopy.document.assertion;
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate.isFormatValid).toBe(false);
    });
  });

  describe('given it is called with valid v1 certificate data', function () {
    let parsedCertificate;

    beforeEach(async function () {
      parsedCertificate = await parseJSON(fixture);
    });

    afterEach(function () {
      parsedCertificate = null;
    });

    it('should set the isFormatValid of the certificate object', function () {
      expect(parsedCertificate.isFormatValid).toEqual(true);
    });

    it('should set the certificateImage of the certificate object', function () {
      expect(parsedCertificate.certificateImage).toEqual(fixture.document.certificate.image);
    });

    it('should set the description of the certificate object', function () {
      expect(parsedCertificate.description).toEqual(fixture.document.certificate.description);
    });

    it('should set the id of the certificate object', function () {
      expect(parsedCertificate.id).toEqual(fixture.document.assertion.uid);
    });

    it('should set issuedOn of the certificate object', function () {
      expect(parsedCertificate.issuedOn).toBe(fixture.document.assertion.issuedOn);
    });

    it('should set the issuer of the certificate object', function () {
      expect(parsedCertificate.issuer).toEqual(issuerProfileV1JsonFixture);
    });

    it('should set the name of the certificate object', function () {
      expect(parsedCertificate.name).toEqual(fixture.document.certificate.name);
    });

    it('should set the publicKey of the certificate object', function () {
      expect(parsedCertificate.publicKey).toEqual(fixture.document.recipient.publicKey);
    });

    it('should set the receipt of the certificate object', function () {
      expect(parsedCertificate.receipt).toEqual(fixture.receipt);
    });

    it('should set the recipientFullName of the certificate object', function () {
      const fullNameAssertion = fixture.document.recipient.givenName + ' ' + fixture.document.recipient.familyName;
      expect(parsedCertificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set recordLink of the certificate object', function () {
      expect(parsedCertificate.recordLink).toBe(fixture.document.assertion.id);
    });

    it('should set the revocationKey of the certificate object', function () {
      expect(parsedCertificate.revocationKey).toEqual(fixture.document.recipient.revocationKey);
    });

    it('should set the sealImage of the certificate object', function () {
      expect(parsedCertificate.sealImage).toEqual(fixture.document.certificate.issuer.image);
    });

    it('should set the signature of the certificate object', function () {
      expect(parsedCertificate.signature).toEqual(fixture.document.signature);
    });

    it('should set 1 signatureImage to the certificate object', function () {
      expect(parsedCertificate.signatureImage.length).toEqual(1);
    });

    it('should set the version of the certificate object', function () {
      expect(parsedCertificate.version).toEqual(CERTIFICATE_VERSIONS.V1_2);
    });
  });
});
