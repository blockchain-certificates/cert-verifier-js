import FIXTURES from '../../fixtures';
import { Certificate, BLOCKCHAINS } from '../../../src';
import mainnetMapAssertion from '../domain/certificates/useCases/assertions/mainnetMapAssertion';

describe('Certificate entity test suite', function () {
  describe('constructor method', function () {
    describe('given it is called with valid v2 certificate data', function () {
      let certificate;

      beforeEach(function () {
        certificate = new Certificate(FIXTURES.MainnetV2Valid);
      });

      afterEach(function () {
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', function () {
        expect(certificate.certificateJson).toEqual(FIXTURES.MainnetV2Valid);
      });

      it('should set certificateImage of the certificate object', function () {
        expect(certificate.certificateImage).toEqual(FIXTURES.MainnetV2Valid.badge.image);
      });

      it('should set chain of the certificate object', function () {
        expect(certificate.chain).toEqual(BLOCKCHAINS.bitcoin);
      });

      it('should set description of the certificate object', function () {
        expect(certificate.description).toEqual(FIXTURES.MainnetV2Valid.badge.description);
      });

      it('should set expires of the certificate object', function () {
        expect(certificate.expires).toEqual(FIXTURES.MainnetV2Valid.expires);
      });

      it('should set id of the certificate object', function () {
        expect(certificate.id).toEqual(FIXTURES.MainnetV2Valid.id);
      });

      it('should set issuer of the certificate object', function () {
        expect(certificate.issuer).toEqual(FIXTURES.MainnetV2Valid.badge.issuer);
      });

      it('should set publicKey of the certificate object', function () {
        expect(certificate.publicKey).toEqual(FIXTURES.MainnetV2Valid.recipientProfile.publicKey);
      });

      it('should set receipt of the certificate object', function () {
        expect(certificate.receipt).toEqual(FIXTURES.MainnetV2Valid.signature);
      });

      it('should set recipientFullName of the certificate object', function () {
        const fullNameAssertion = FIXTURES.MainnetV2Valid.recipientProfile.name;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set revocationKey of the certificate object', function () {
        expect(certificate.revocationKey).toEqual(null);
      });

      it('should set sealImage of the certificate object', function () {
        expect(certificate.sealImage).toEqual(FIXTURES.MainnetV2Valid.badge.issuer.image);
      });

      it('should set signature of the certificate object', function () {
        expect(certificate.signature).toEqual(null);
      });

      it('should set 1 signatureImage to the certificate object', function () {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set subtitle to the certificate object', function () {
        expect(certificate.subtitle).toEqual(FIXTURES.MainnetV2Valid.badge.subtitle);
      });

      it('should set name to the certificate object', function () {
        expect(certificate.name).toEqual(FIXTURES.MainnetV2Valid.badge.name);
      });

      it('should set transactionId to the certificate object', function () {
        expect(certificate.transactionId).toEqual(FIXTURES.MainnetV2Valid.signature.anchors[0].sourceId);
      });

      it('should set rawTransactionLink to the certificate object', function () {
        const rawTransactionLinkAssertion = `https://blockchain.info/rawtx/${FIXTURES.MainnetV2Valid.signature.anchors[0].sourceId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set transactionLink to the certificate object', function () {
        const transactionLinkAssertion = `https://blockchain.info/tx/${FIXTURES.MainnetV2Valid.signature.anchors[0].sourceId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });

      it('should set verificationSteps to the certificate object', function () {
        expect(certificate.verificationSteps).toEqual(mainnetMapAssertion);
      });
    });
  });
});
