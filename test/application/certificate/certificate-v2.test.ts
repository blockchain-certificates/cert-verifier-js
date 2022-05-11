import { BLOCKCHAINS, Certificate, CERTIFICATE_VERSIONS } from '../../../src';
import fixture from '../../fixtures/v2/mainnet-valid-2.0.json';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is called with valid v2 certificate data', function () {
      let certificate;

      beforeEach(async function () {
        certificate = new Certificate(fixture);
        await certificate.init();
      });

      afterEach(function () {
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', function () {
        expect(certificate.certificateJson).toEqual(fixture);
      });

      it('should set certificateImage of the certificate object', function () {
        expect(certificate.certificateImage).toEqual(fixture.badge.image);
      });

      it('should set chain of the certificate object', function () {
        expect(certificate.chain).toEqual(BLOCKCHAINS.bitcoin);
      });

      it('should set description of the certificate object', function () {
        expect(certificate.description).toEqual(fixture.badge.description);
      });

      it('should set id of the certificate object', function () {
        expect(certificate.id).toEqual(fixture.id);
      });

      it('should set issuedOn of the certificate object', function () {
        expect(certificate.issuedOn).toBe(fixture.issuedOn);
      });

      it('should set issuer of the certificate object', function () {
        expect(certificate.issuer).toEqual(fixture.badge.issuer);
      });

      it('should set metadataJson of the certificate object', function () {
        expect(certificate.metadataJson).toEqual(fixture.metadataJson);
      });

      it('should set name to the certificate object', function () {
        expect(certificate.name).toEqual(fixture.badge.name);
      });

      it('should set receipt of the certificate object', function () {
        expect(certificate.receipt).toEqual(fixture.signature);
      });

      it('should set recipientFullName of the certificate object', function () {
        const fullNameAssertion = fixture.recipientProfile.name;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set recordLink of the certificate object', function () {
        expect(certificate.recordLink).toBe(fixture.id);
      });

      it('should set revocationKey of the certificate object', function () {
        expect(certificate.revocationKey).toEqual(null);
      });

      it('should set sealImage of the certificate object', function () {
        expect(certificate.sealImage).toEqual(fixture.badge.issuer.image);
      });

      it('should set 1 signatureImage to the certificate object', function () {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set transactionId to the certificate object', function () {
        expect(certificate.transactionId).toEqual(fixture.signature.anchors[0].sourceId);
      });

      it('should set rawTransactionLink to the certificate object', function () {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const rawTransactionLinkAssertion = `https://blockchain.info/rawtx/${fixture.signature.anchors[0].sourceId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set transactionLink to the certificate object', function () {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const transactionLinkAssertion = `https://blockchain.info/tx/${fixture.signature.anchors[0].sourceId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });

      it('should set version to the certificate object', function () {
        expect(certificate.version).toBe(CERTIFICATE_VERSIONS.V2_0);
      });
    });
  });
});
