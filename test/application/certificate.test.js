import SampleValidCertificate from '../fixtures/sample-cert-mainnet-valid-2.0.json';
import Certificate from '../../src/certificate';
import { BLOCKCHAINS } from '../../src';

describe('Certificate entity test suite', () => {
  describe('given is is not instantiated with a JSON object', () => {
    let certificate;

    beforeEach(() => {
      certificate = new Certificate(JSON.stringify(SampleValidCertificate));
    });

    afterEach(() => {
      certificate = null;
    });

    it('should coerce certificateJson to an object', () => {
      expect(certificate.certificateJson).toEqual(SampleValidCertificate);
    });
  });

  describe('given it is instantiated with valid certificate data', () => {
    let certificate;

    beforeEach(() => {
      certificate = new Certificate(SampleValidCertificate);
    });

    afterEach(() => {
      certificate = null;
    });

    it('should set the certificateJson of the certificate object', () => {
      expect(certificate.certificateJson).toEqual(SampleValidCertificate);
    });

    it('should set certificateImage of the certificate object', () => {
      expect(certificate.certificateImage).toEqual(SampleValidCertificate.badge.image);
    });

    it('should set chain of the certificate object', () => {
      expect(certificate.chain).toEqual(BLOCKCHAINS.bitcoin);
    });

    it('should set description of the certificate object', () => {
      expect(certificate.description).toEqual(SampleValidCertificate.badge.description);
    });

    it('should set expires of the certificate object', () => {
      expect(certificate.expires).toEqual(SampleValidCertificate.expires);
    });

    it('should set expires of the certificate object', () => {
      expect(certificate.expires).toEqual(SampleValidCertificate.expires);
    });

    it('should set id of the certificate object', () => {
      expect(certificate.id).toEqual(SampleValidCertificate.id);
    });

    it('should set issuer of the certificate object', () => {
      expect(certificate.issuer).toEqual(SampleValidCertificate.badge.issuer);
    });

    it('should set publicKey of the certificate object', () => {
      expect(certificate.publicKey).toEqual(SampleValidCertificate.recipientProfile.publicKey);
    });

    it('should set receipt of the certificate object', () => {
      expect(certificate.receipt).toEqual(SampleValidCertificate.signature);
    });

    it('should set recipientFullName of the certificate object', () => {
      const fullNameAssertion = SampleValidCertificate.recipientProfile.name;
      expect(certificate.recipientFullName).toEqual(fullNameAssertion);
    });

    it('should set revocationKey of the certificate object', () => {
      expect(certificate.revocationKey).toEqual(null);
    });

    it('should set sealImage of the certificate object', () => {
      expect(certificate.sealImage).toEqual(SampleValidCertificate.badge.issuer.image);
    });

    it('should set signature of the certificate object', () => {
      expect(certificate.signature).toEqual(null);
    });

    it('should set 1 signatureImage to the certificate object', () => {
      expect(certificate.signatureImage.length).toEqual(1);
    });

    it('should set subtitle to the certificate object', () => {
      expect(certificate.subtitle).toEqual(SampleValidCertificate.badge.subtitle);
    });

    it('should set title to the certificate object', () => {
      expect(certificate.title).toEqual(SampleValidCertificate.badge.name);
    });

    it('should set transactionId to the certificate object', () => {
      expect(certificate.transactionId).toEqual(SampleValidCertificate.signature.anchors[0].sourceId);
    });

    it('should set rawTransactionLink to the certificate object', () => {
      const rawTransactionLinkAssertion = `https://blockchain.info/rawtx/${SampleValidCertificate.signature.anchors[0].sourceId}`;
      expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
    });

    it('should set transactionLink to the certificate object', () => {
      const transactionLinkAssertion = `https://blockchain.info/tx/${SampleValidCertificate.signature.anchors[0].sourceId}`;
      expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
    });

    it('should set verificationSteps to the certificate object', () => {
      expect(certificate.verificationSteps).toEqual([]);
    });

    it('should set isFormatValid to the certificate object', () => {
      expect(certificate.isFormatValid).toEqual(true);
    });
  });

  describe('given it is instantiated with invalid certificate data', () => {
    it('should return an error', () => {
      expect(() => {
        /* eslint no-unused-vars: "off" */
        let certificate = new Certificate('invalid-certificate-data');
      }).toThrowError('This is not a valid certificate');
    });
  });

  describe('given it is instantiated with no certificate data', () => {
    it('should throw an error', () => {
      expect(() => {
        /* eslint no-unused-vars: "off" */
        let certificate = new Certificate();
      }).toThrowError('This is not a valid certificate');
    });
  });
});
