import fixture from '../../fixtures/testnet-valid-1.2';
import { BLOCKCHAINS, Certificate } from '../../../src';
import mainnetMapAssertion from '../domain/certificates/useCases/assertions/mainnetMapAssertion';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is called with valid v1 certificate data', function () {
      let certificate;

      beforeEach(function () {
        certificate = new Certificate(fixture);
      });

      afterEach(function () {
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', function () {
        expect(certificate.certificateJson).toEqual(fixture);
      });

      it('should set certificateImage of the certificate object', function () {
        expect(certificate.certificateImage).toEqual(fixture.document.certificate.image);
      });

      it('should set chain of the certificate object', function () {
        expect(certificate.chain).toEqual(BLOCKCHAINS.testnet);
      });

      it('should set description of the certificate object', function () {
        expect(certificate.description).toEqual(fixture.document.certificate.description);
      });

      it('should set expires of the certificate object', function () {
        expect(certificate.expires).toEqual(fixture.expires);
      });

      it('should set id of the certificate object', function () {
        expect(certificate.id).toEqual(fixture.document.assertion.uid);
      });

      it('should set issuer of the certificate object', function () {
        expect(certificate.issuer).toEqual(fixture.document.certificate.issuer);
      });

      it('should set publicKey of the certificate object', function () {
        expect(certificate.publicKey).toEqual(fixture.document.recipient.publicKey);
      });

      it('should set receipt of the certificate object', function () {
        expect(certificate.receipt).toEqual(fixture.receipt);
      });

      it('should set recipientFullName of the certificate object', function () {
        const fullNameAssertion = fixture.document.recipient.givenName + ' ' + fixture.document.recipient.familyName;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set revocationKey of the certificate object', function () {
        expect(certificate.revocationKey).toEqual(fixture.document.recipient.revocationKey);
      });

      it('should set sealImage of the certificate object', function () {
        expect(certificate.sealImage).toEqual(fixture.document.certificate.issuer.image);
      });

      it('should set signature of the certificate object', function () {
        expect(certificate.signature).toEqual(fixture.document.signature);
      });

      it('should set 1 signatureImage to the certificate object', function () {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set subtitle to the certificate object', function () {
        expect(certificate.subtitle).toEqual(fixture.document.certificate.subtitle);
      });

      it('should set name to the certificate object', function () {
        expect(certificate.name).toEqual(fixture.document.certificate.name);
      });

      it('should set transactionId to the certificate object', function () {
        expect(certificate.transactionId).toEqual(fixture.receipt.anchors[0].sourceId);
      });

      it('should set rawTransactionLink to the certificate object', function () {
        const rawTransactionLinkAssertion = `https://testnet.blockchain.info/rawtx/${fixture.receipt.anchors[0].sourceId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set transactionLink to the certificate object', function () {
        const transactionLinkAssertion = `https://testnet.blockchain.info/tx/${fixture.receipt.anchors[0].sourceId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });

      it('should set verificationSteps to the certificate object', function () {
        expect(certificate.verificationSteps).toEqual(mainnetMapAssertion);
      });
    });
  });
});
