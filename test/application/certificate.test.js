import MainnetV2Certificate from '../fixtures/mainnet-valid-2.0.json';
import Certificate from '../../src/certificate';
import { BLOCKCHAINS, VERIFICATION_STATUSES } from '../../src';
import { readFileAsync } from './utils/readFile';
import { getVerboseMessage } from '../../config/default';
import sinon from 'sinon';

describe('Certificate entity test suite', () => {
  describe('constructor method', () => {
    describe('given is is not called with a JSON object', () => {
      let certificate;

      beforeEach(() => {
        certificate = new Certificate(JSON.stringify(MainnetV2Certificate));
      });

      afterEach(() => {
        certificate = null;
      });

      it('should coerce certificateJson to an object', () => {
        expect(certificate.certificateJson).toEqual(MainnetV2Certificate);
      });
    });

    describe('given it is called with valid certificate data', () => {
      let certificate;

      beforeEach(() => {
        certificate = new Certificate(MainnetV2Certificate);
      });

      afterEach(() => {
        certificate = null;
      });

      it('should set the certificateJson of the certificate object', () => {
        expect(certificate.certificateJson).toEqual(MainnetV2Certificate);
      });

      it('should set certificateImage of the certificate object', () => {
        expect(certificate.certificateImage).toEqual(MainnetV2Certificate.badge.image);
      });

      it('should set chain of the certificate object', () => {
        expect(certificate.chain).toEqual(BLOCKCHAINS.bitcoin);
      });

      it('should set description of the certificate object', () => {
        expect(certificate.description).toEqual(MainnetV2Certificate.badge.description);
      });

      it('should set expires of the certificate object', () => {
        expect(certificate.expires).toEqual(MainnetV2Certificate.expires);
      });

      it('should set id of the certificate object', () => {
        expect(certificate.id).toEqual(MainnetV2Certificate.id);
      });

      it('should set issuer of the certificate object', () => {
        expect(certificate.issuer).toEqual(MainnetV2Certificate.badge.issuer);
      });

      it('should set publicKey of the certificate object', () => {
        expect(certificate.publicKey).toEqual(MainnetV2Certificate.recipientProfile.publicKey);
      });

      it('should set receipt of the certificate object', () => {
        expect(certificate.receipt).toEqual(MainnetV2Certificate.signature);
      });

      it('should set recipientFullName of the certificate object', () => {
        const fullNameAssertion = MainnetV2Certificate.recipientProfile.name;
        expect(certificate.recipientFullName).toEqual(fullNameAssertion);
      });

      it('should set revocationKey of the certificate object', () => {
        expect(certificate.revocationKey).toEqual(null);
      });

      it('should set sealImage of the certificate object', () => {
        expect(certificate.sealImage).toEqual(MainnetV2Certificate.badge.issuer.image);
      });

      it('should set signature of the certificate object', () => {
        expect(certificate.signature).toEqual(null);
      });

      it('should set 1 signatureImage to the certificate object', () => {
        expect(certificate.signatureImage.length).toEqual(1);
      });

      it('should set subtitle to the certificate object', () => {
        expect(certificate.subtitle).toEqual(MainnetV2Certificate.badge.subtitle);
      });

      it('should set name to the certificate object', () => {
        expect(certificate.name).toEqual(MainnetV2Certificate.badge.name);
      });

      it('should set transactionId to the certificate object', () => {
        expect(certificate.transactionId).toEqual(MainnetV2Certificate.signature.anchors[0].sourceId);
      });

      it('should set rawTransactionLink to the certificate object', () => {
        const rawTransactionLinkAssertion = `https://blockchain.info/rawtx/${MainnetV2Certificate.signature.anchors[0].sourceId}`;
        expect(certificate.rawTransactionLink).toEqual(rawTransactionLinkAssertion);
      });

      it('should set transactionLink to the certificate object', () => {
        const transactionLinkAssertion = `https://blockchain.info/tx/${MainnetV2Certificate.signature.anchors[0].sourceId}`;
        expect(certificate.transactionLink).toEqual(transactionLinkAssertion);
      });

      it('should set verificationSteps to the certificate object', () => {
        expect(certificate.verificationSteps).toEqual([]);
      });

      it('should set isFormatValid to the certificate object', () => {
        expect(certificate.isFormatValid).toEqual(true);
      });

      it('should set documentToVerify accordingly', () => {
        const assertion = Object.assign({}, MainnetV2Certificate);
        delete assertion['signature'];
        expect(certificate.documentToVerify).toEqual(assertion);
      });
    });

    describe('given it is called with invalid certificate data', () => {
      it('should return an error', () => {
        expect(() => {
          /* eslint no-unused-vars: "off" */
          let certificate = new Certificate('invalid-certificate-data');
        }).toThrowError('This is not a valid certificate');
      });
    });

    describe('given it is called with no certificate data', () => {
      it('should throw an error', () => {
        expect(() => {
          /* eslint no-unused-vars: "off" */
          let certificate = new Certificate();
        }).toThrowError('This is not a valid certificate');
      });
    });
  });

  describe('verify method', () => {
    xdescribe('the step callback function', () => {
      let data;
      let callbackSpy;
      let testCode;
      let expectedName;
      let certificateInstance;

      beforeEach(async () => {
        data = await readFileAsync('test/fixtures/mocknet-2.0.json');
        callbackSpy = sinon.spy();
        certificateInstance = new Certificate(JSON.parse(data));

        testCode = 'getTransactionId';
        expectedName = getVerboseMessage(testCode);
      });

      afterEach(() => {
        data = null;
        callbackSpy = null;

        testCode = null;
        expectedName = null;
      });

      describe('when there is no failure', () => {
        it('should be called with the code, the name and the status of the step', async () => {
          await certificateInstance.verify(callbackSpy);
          // verifierInstance._doAction(testCodefunction () => {});
          expect(callbackSpy.calledWithExactly(testCode, expectedName, VERIFICATION_STATUSES.SUCCESS, undefined)).toBe(true);
        });
      });

      describe('when there is a failure', () => {
        it('should be called with the code, the name, the status and the error message', async () => {
          const errorMessage = 'Testing the test';
          await certificateInstance.verify(callbackSpy);
          // verifierInstance._doAction(testCodefunction () => { throw new Error(errorMessage); });
          expect(callbackSpy.calledWithExactly(testCode, expectedName, VERIFICATION_STATUSES.FAILURE, errorMessage)).toBe(true);
        });
      });
    });
  });
});
