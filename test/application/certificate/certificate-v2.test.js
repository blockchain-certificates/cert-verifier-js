import fixture from '../../fixtures/mainnet-valid-2.0';
import Certificate from '../../../src/certificate';
import { BLOCKCHAINS } from '../../../src/index';
import documentToVerifyAssertion from './assertions/documentToVerify-v2';

describe('Certificate entity test suite', () => {
  describe('constructor method', () => {
    describe('given it is called with valid v2 certificate data', () => {
      let certificate;

      beforeEach(() => {
        certificate = new Certificate(fixture);
      });

      afterEach(() => {
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', () => {
        expect(certificate.certificateJson).toEqual(fixture);
      });

      it('should set certificateImage of the certificate object', () => {
        expect(certificate.certificateImage).toEqual(fixture.badge.image);
      });

      it('should set chain of the certificate object', () => {
        expect(certificate.chain).toEqual(BLOCKCHAINS.bitcoin);
      });

      it('should set description of the certificate object', () => {
        expect(certificate.description).toEqual(fixture.badge.description);
      });

      it('should set expires of the certificate object', () => {
        expect(certificate.expires).toEqual(fixture.expires);
      });

      it('should set id of the certificate object', () => {
        expect(certificate.id).toEqual(fixture.id);
      });

      it('should set issuer of the certificate object', () => {
        expect(certificate.issuer).toEqual(fixture.badge.issuer);
      });

      it('should set publicKey of the certificate object', () => {
        expect(certificate.publicKey).toEqual(fixture.recipientProfile.publicKey);
      });

      it('should set receipt of the certificate object', () => {
        expect(certificate.receipt).toEqual(fixture.signature);
      });

      it('should set recipientFullName of the certificate object', () => {
        const fullNameAssertion = fixture.recipientProfile.name;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set revocationKey of the certificate object', () => {
        expect(certificate.revocationKey).toEqual(null);
      });

      it('should set sealImage of the certificate object', () => {
        expect(certificate.sealImage).toEqual(fixture.badge.issuer.image);
      });

      it('should set signature of the certificate object', () => {
        expect(certificate.signature).toEqual(null);
      });

      it('should set 1 signatureImage to the certificate object', () => {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set subtitle to the certificate object', () => {
        expect(certificate.subtitle).toEqual(fixture.badge.subtitle);
      });

      it('should set name to the certificate object', () => {
        expect(certificate.name).toEqual(fixture.badge.name);
      });

      it('should set transactionId to the certificate object', () => {
        expect(certificate.transactionId).toEqual(fixture.signature.anchors[0].sourceId);
      });

      it('should set rawTransactionLink to the certificate object', () => {
        const rawTransactionLinkAssertion = `https://blockchain.info/rawtx/${fixture.signature.anchors[0].sourceId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set transactionLink to the certificate object', () => {
        const transactionLinkAssertion = `https://blockchain.info/tx/${fixture.signature.anchors[0].sourceId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });

      it('should set verificationSteps to the certificate object', () => {
        expect(certificate.verificationSteps).toEqual([]);
      });

      it('should set isFormatValid to the certificate object', () => {
        expect(certificate.isFormatValid).toEqual(true);
      });

      it('should set documentToVerify accordingly', () => {
        expect(certificate.documentToVerify).toEqual(documentToVerifyAssertion);
      });
    });
  });
});
