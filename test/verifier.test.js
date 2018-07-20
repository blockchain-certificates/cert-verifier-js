import 'babel-polyfill';
import sinon from 'sinon';
import { getVerboseMessage } from '../config/default';
import { VERIFICATION_STATUSES } from '../src/index';
import { readFileAsync } from './application/utils/readFile';
import Certificate from '../src/certificate';

xdescribe('Certificate verifier', () => {
  // Disabling this test; issuer profile call is hanging -- need to allow redirect?
  describe('should', () => {
    it('verify a v1 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-valid-1.2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('should', () => {
    it('verify an ethereum mainnet v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-mainnet-valid-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify a v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-valid-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify an ethereum v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-valid-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify an ethereum ropsten v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-valid-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify an ethereum v2 certificate uppercase issuing address', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-uppercase-address-valid-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify v2 alpha certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-valid-2.0-alpha.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('return a failure when issuer profile URL does not exist (404)', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-invalid-issuer-url.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('ensure a tampered v2 certificate fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-unmapped-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'computingLocalHash' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('ensure a revoked v2 certificate fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-revoked-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'checkingRevokedStatus' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('ensure a revoked ethereum v2 certificate fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-revoked-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'checkingRevokedStatus' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('This certificate has been revoked by the issuer. Reason given: Accidentally issued to Ethereum.');
    });

    it('ensure a v2 certificate with a revoked issuing key fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-with-revoked-key-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'checkingAuthenticity' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('ensures a v2 certificate with an invalid merkle proof fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-merkle-proof-fail-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'checkingReceipt' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('Invalid Merkle Receipt. Proof hash did not match Merkle root');
    });

    it('ensures a v2 certificate that has been tampered with fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-tampered-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'comparingHashes' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('Computed hash does not match remote hash');
    });

    it('ensures a v2 ethereum certificate that has been tampered with fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-tampered-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'comparingHashes' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('Computed hash does not match remote hash');
    });

    it('ensures a v2 certificate that does not match blockchain value fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-root-does-not-match-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'fetchingRemoteHash' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('Merkle root does not match remote hash.');
    });

    it('ensures a v2 ethereum certificate that does not match blockchain value fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-root-does-not-match-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify((stepCode, message, status) => {
        if (stepCode === 'fetchingRemoteHash' && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        }
      });

      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
      expect(result.message).toBe('Merkle root does not match remote hash.');
    });

    it('ensures a v2 certificate with a v1 issuer passes', async () => {
      const data = await readFileAsync(
        'test/fixtures/sample_cert-with_v1_issuer-2.0.json'
      );
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('ensure a v2 mocknet passes', async () => {
      const data = await readFileAsync('test/fixtures/mocknet-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
    });

    it('ensure a v2 regtest passes', async () => {
      const data = await readFileAsync('test/fixtures/regtest-2.0.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
    });

    it('ensure a v2 certificate dates get transformed to right timezone', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-breaking-timezone.json');
      const certificate = new Certificate(JSON.parse(data));
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

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
