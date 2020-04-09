import fixture from '../../fixtures/v2/mainnet-valid-2.0';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS } from '../../../src/constants';
import parseJSON from '../../../src/parser';

describe('Parser test suite', function () {
  describe('given it is called with a invalid format v2 certificate data', function () {
    it('should set whether or not the certificate format is valid', async function () {
      const fixtureCopy = JSON.parse(JSON.stringify(fixture));
      delete fixtureCopy.verification;
      const parsedCertificate = await parseJSON(fixtureCopy);
      expect(parsedCertificate.isFormatValid).toBe(false);
    });
  });

  describe('given it is called with valid v2 certificate data', function () {
    let parsedCertificate;

    beforeEach(async function () {
      parsedCertificate = await parseJSON(fixture);
    });

    afterEach(function () {
      parsedCertificate = null;
    });

    it('should set the certificateImage of the certificate object', function () {
      expect(parsedCertificate.certificateImage).toEqual(fixture.badge.image);
    });

    it('should set the chain of the certificate object', function () {
      expect(parsedCertificate.chain).toEqual(BLOCKCHAINS.bitcoin);
    });

    it('should set the description of the certificate object', function () {
      expect(parsedCertificate.description).toEqual(fixture.badge.description);
    });

    it('should set the expires of the certificate object', function () {
      expect(parsedCertificate.expires).toEqual(fixture.expires);
    });

    it('should set the id of the certificate object', function () {
      expect(parsedCertificate.id).toEqual(fixture.id);
    });

    it('should set issuedOn of the certificate object', function () {
      expect(parsedCertificate.issuedOn).toBe(fixture.issuedOn);
    });

    it('should set the issuer of the certificate object', function () {
      expect(parsedCertificate.issuer).toEqual(fixture.badge.issuer);
    });

    it('should set metadataJson of the certificate object', function () {
      expect(parsedCertificate.metadataJson).toEqual(fixture.metadataJson);
    });

    it('should set the name of the certificate object', function () {
      expect(parsedCertificate.name).toEqual(fixture.badge.name);
    });

    it('should set the publicKey of the certificate object', function () {
      expect(parsedCertificate.publicKey).toEqual(fixture.recipientProfile.publicKey);
    });

    it('should set the receipt of the certificate object', function () {
      expect(parsedCertificate.receipt).toEqual(fixture.signature);
    });

    it('should set the recipientFullName of the certificate object', function () {
      const fullNameAssertion = fixture.recipientProfile.name;
      expect(parsedCertificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set recordLink of the certificate object', function () {
      expect(parsedCertificate.recordLink).toBe(fixture.id);
    });

    it('should set the revocationKey of the certificate object', function () {
      expect(parsedCertificate.revocationKey).toEqual(null);
    });

    it('should set the sealImage of the certificate object', function () {
      expect(parsedCertificate.sealImage).toEqual(fixture.badge.issuer.image);
    });

    it('should set the signature of the certificate object', function () {
      expect(parsedCertificate.signature).toEqual(null);
    });

    it('should set 1 signatureImage to the certificate object', function () {
      expect(parsedCertificate.signatureImage.length).toEqual(1);
    });

    it('should set the subtitle of the certificate object', function () {
      expect(parsedCertificate.subtitle).toEqual(fixture.badge.subtitle);
    });

    it('should set the the version of the certificate object', function () {
      expect(parsedCertificate.version).toEqual(CERTIFICATE_VERSIONS.V2_0);
    });
  });
});
