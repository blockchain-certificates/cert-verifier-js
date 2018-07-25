import fixture from '../../fixtures/mainnet-valid-2.0';
import { BLOCKCHAINS, CERTIFICATE_VERSIONS } from '../../../src/constants';
import parseJSON from '../../../src/parser';

describe('Parser test suite', function () {
  describe('given it is called with valid v2 certificate data', () => {
    let parsedCertificate;

    beforeEach(() => {
      parsedCertificate = parseJSON(fixture);
    });

    afterEach(() => {
      parsedCertificate = null;
    });

    it('should set the certificateImage of the certificate object', () => {
      expect(parsedCertificate.certificateImage).toEqual(fixture.badge.image);
    });

    it('should set the chain of the certificate object', () => {
      expect(parsedCertificate.chain).toEqual(BLOCKCHAINS.bitcoin);
    });

    it('should set the description of the certificate object', () => {
      expect(parsedCertificate.description).toEqual(fixture.badge.description);
    });

    it('should set the expires of the certificate object', () => {
      expect(parsedCertificate.expires).toEqual(fixture.expires);
    });

    it('should set the id of the certificate object', () => {
      expect(parsedCertificate.id).toEqual(fixture.id);
    });

    it('should set the issuer of the certificate object', () => {
      expect(parsedCertificate.issuer).toEqual(fixture.badge.issuer);
    });

    it('should set the name of the certificate object', () => {
      expect(parsedCertificate.name).toEqual(fixture.badge.name);
    });

    it('should set the publicKey of the certificate object', () => {
      expect(parsedCertificate.publicKey).toEqual(fixture.recipientProfile.publicKey);
    });

    it('should set the receipt of the certificate object', () => {
      expect(parsedCertificate.receipt).toEqual(fixture.signature);
    });

    it('should set the recipientFullName of the certificate object', () => {
      const fullNameAssertion = fixture.recipientProfile.name;
      expect(parsedCertificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set the revocationKey of the certificate object', () => {
      expect(parsedCertificate.revocationKey).toEqual(null);
    });

    it('should set the sealImage of the certificate object', () => {
      expect(parsedCertificate.sealImage).toEqual(fixture.badge.issuer.image);
    });

    it('should set the signature of the certificate object', () => {
      expect(parsedCertificate.signature).toEqual(null);
    });

    it('should set 1 signatureImage to the certificate object', () => {
      expect(parsedCertificate.signatureImage.length).toEqual(1);
    });

    it('should set the subtitle of the certificate object', () => {
      expect(parsedCertificate.subtitle).toEqual(fixture.badge.subtitle);
    });

    it('should set the the version of the certificate object', function () {
      expect(parsedCertificate.version).toEqual(CERTIFICATE_VERSIONS.V2_0);
    });
  });
});
