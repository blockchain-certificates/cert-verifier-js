import FIXTURES from '../../fixtures';
import { Certificate, BLOCKCHAINS } from '../../../src';
import documentToVerifyAssertion from './assertions/documentToVerify-v2';

describe('Certificate entity test suite', () => {
  describe('constructor method', () => {
    describe('given it is called with valid v2 certificate data', () => {
      let certificate;

      beforeEach(() => {
        certificate = new Certificate(FIXTURES.MainnetV2Valid);
      });

      afterEach(() => {
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', () => {
        expect(certificate.certificateJson).toEqual(FIXTURES.MainnetV2Valid);
      });

      it('should set certificateImage of the certificate object', () => {
        expect(certificate.certificateImage).toEqual(FIXTURES.MainnetV2Valid.badge.image);
      });

      it('should set chain of the certificate object', () => {
        expect(certificate.chain).toEqual(BLOCKCHAINS.bitcoin);
      });

      it('should set description of the certificate object', () => {
        expect(certificate.description).toEqual(FIXTURES.MainnetV2Valid.badge.description);
      });

      it('should set expires of the certificate object', () => {
        expect(certificate.expires).toEqual(FIXTURES.MainnetV2Valid.expires);
      });

      it('should set id of the certificate object', () => {
        expect(certificate.id).toEqual(FIXTURES.MainnetV2Valid.id);
      });

      it('should set issuer of the certificate object', () => {
        expect(certificate.issuer).toEqual(FIXTURES.MainnetV2Valid.badge.issuer);
      });

      it('should set publicKey of the certificate object', () => {
        expect(certificate.publicKey).toEqual(FIXTURES.MainnetV2Valid.recipientProfile.publicKey);
      });

      it('should set receipt of the certificate object', () => {
        expect(certificate.receipt).toEqual(FIXTURES.MainnetV2Valid.signature);
      });

      it('should set recipientFullName of the certificate object', () => {
        const fullNameAssertion = FIXTURES.MainnetV2Valid.recipientProfile.name;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set revocationKey of the certificate object', () => {
        expect(certificate.revocationKey).toEqual(null);
      });

      it('should set sealImage of the certificate object', () => {
        expect(certificate.sealImage).toEqual(FIXTURES.MainnetV2Valid.badge.issuer.image);
      });

      it('should set signature of the certificate object', () => {
        expect(certificate.signature).toEqual(null);
      });

      it('should set 1 signatureImage to the certificate object', () => {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set subtitle to the certificate object', () => {
        expect(certificate.subtitle).toEqual(FIXTURES.MainnetV2Valid.badge.subtitle);
      });

      it('should set name to the certificate object', () => {
        expect(certificate.name).toEqual(FIXTURES.MainnetV2Valid.badge.name);
      });

      it('should set transactionId to the certificate object', () => {
        expect(certificate.transactionId).toEqual(FIXTURES.MainnetV2Valid.signature.anchors[0].sourceId);
      });

      it('should set rawTransactionLink to the certificate object', () => {
        const rawTransactionLinkAssertion = `https://blockchain.info/rawtx/${FIXTURES.MainnetV2Valid.signature.anchors[0].sourceId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set transactionLink to the certificate object', () => {
        const transactionLinkAssertion = `https://blockchain.info/tx/${FIXTURES.MainnetV2Valid.signature.anchors[0].sourceId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });

      it('should set isFormatValid to the certificate object', () => {
        expect(certificate.isFormatValid).toEqual(true);
      });

      it('should set documentToVerify accordingly', () => {
        expect(certificate.documentToVerify).toEqual(documentToVerifyAssertion);
      });

      it('should set verificationMap to the certificate object', () => {
        expect(certificate.verificationMap).toEqual([]);
      });
    });
  });
});
