import 'babel-polyfill';
import sinon from 'sinon';
import { getVerboseMessage } from '../config/default';
import { CertificateVerifier, VERIFICATION_STATUSES } from '../src/index';
import { readFileAsync } from './utils/readFile';

describe('Certificate verifier', async () => {
  // Disabling this test; issuer profile call is hanging -- need to allow redirect?
  xdescribe('should', async () => {
    it('verify a v1 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-valid-1.2.0.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {});
      const result = await certVerifier.verify((stepCode, message, status) => {});
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('should', () => {
    it('verify an ethereum mainnet v2 certificate', async function () {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-mainnet-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify a v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify an ethereum v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify an ethereum ropsten v2 certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify an ethereum v2 certificate uppercase issuing address', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-uppercase-address-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('verify v2 alpha certificate', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-valid-2.0-alpha.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('return a failure when issuer profile URL does not exist (404)', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-invalid-issuer-url.json');
      const certVerifier = new CertificateVerifier(data);
      const result = await certVerifier.verify();
      expect(result).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('ensure a tampered v2 certificate fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-unmapped-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'computingLocalHash' && status !== VERIFICATION_STATUSES.STARTING) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );

      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
      });
    });

    it('ensure a revoked v2 certificate fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-revoked-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (
            stepCode === 'checkingRevokedStatus' &&
            status !== VERIFICATION_STATUSES.STARTING
          ) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );

      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
      });
    });

    it('ensure a revoked ethereum v2 certificate fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-revoked-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (
            stepCode === 'checkingRevokedStatus' &&
            status !== VERIFICATION_STATUSES.STARTING
          ) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );

      await certVerifier.verify((status, message) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(message).toBe('This certificate has been revoked by the issuer.');
      });
    });

    it('ensure a v2 certificate with a revoked issuing key fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-with-revoked-key-2.0.json');

      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (
            stepCode === 'checkingAuthenticity' &&
            status !== VERIFICATION_STATUSES.STARTING
          ) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );

      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
      });
    });

    it('ensures a v2 certificate with an invalid merkle proof fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-merkle-proof-fail-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'checkingReceipt' && status !== VERIFICATION_STATUSES.STARTING) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );

      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(message).toBe('Invalid Merkle Receipt. Proof hash didn\'t match Merkle root');
      });
    });

    it('ensures a v2 certificate that\'s been tampered with fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-tampered-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'comparingHashes' && status !== VERIFICATION_STATUSES.STARTING) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );

      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(message).toBe('Computed hash does not match remote hash');
      });
    });

    it('ensures a v2 ethereum certificate that\'s been tampered with fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_ethereum_cert-tampered-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'comparingHashes' && status !== VERIFICATION_STATUSES.STARTING) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(message).toBe('Computed hash does not match remote hash');
      });
    });

    it('ensures a v2 certificate that doesn\'t match blockchain value fails', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-root-does-not-match-2.0.json');
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'fetchingRemoteHash' && status !== VERIFICATION_STATUSES.STARTING) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(message).toBe('Merkle root does not match remote hash.');
      });
    });

    it('ensures a v2 ethereum certificate that doesn\'t match blockchain value fails', async () => {
      const data = await readFileAsync(
        'test/fixtures/sample_ethereum_cert-root-does-not-match-2.0.json'
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'fetchingRemoteHash' && status !== VERIFICATION_STATUSES.STARTING) {
            expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          }
        }
      );
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
        expect(message).toBe('Merkle root does not match remote hash.');
      });
    });

    it('ensures a v2 certificate with a v1 issuer passes', async () => {
      const data = await readFileAsync(
        'test/fixtures/sample_cert-with_v1_issuer-2.0.json'
      );
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.SUCCESS);
      });
    });

    it('ensure a v2 mocknet passes', async () => {
      const data = await readFileAsync('test/fixtures/mocknet-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
      });
    });

    it('ensure a v2 regtest passes', async () => {
      const data = await readFileAsync('test/fixtures/regtest-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
      });
    });

    it('ensure a v2 certificate\' dates get transformed to right timezone', async () => {
      const data = await readFileAsync('test/fixtures/sample_cert-breaking-timezone.json');
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        expect(status).toBe(VERIFICATION_STATUSES.SUCCESS);
      });
    });
  });

  describe('the step callback function', function () {
    let data;
    let callbackSpy;
    let verifierInstance;
    let testCode;
    let expectedName;

    beforeEach(async function () {
      data = await readFileAsync('test/fixtures/mocknet-2.0.json');
      callbackSpy = sinon.spy();
      verifierInstance = new CertificateVerifier(data, callbackSpy);

      testCode = 'getTransactionId';
      expectedName = getVerboseMessage(testCode);
    });

    afterEach(function () {
      data = null;
      callbackSpy = null;
      verifierInstance = null;

      testCode = null;
      expectedName = null;
    });

    xdescribe('when there is no failure', function () {
      it('should be called with the code, the name and the status of the step', function () {
        verifierInstance.doAction(testCode, () => {});

        expect(callbackSpy.calledWithExactly(testCode, expectedName, VERIFICATION_STATUSES.SUCCESS, undefined)).toBe(true);
      });
    });

    xdescribe('when there is a failure', function () {
      it('should be called with the code, the name, the status and the error message', function () {
        const errorMessage = 'Testing the test';
        verifierInstance.doAction(testCode, () => { throw new Error(errorMessage); });

        expect(callbackSpy.calledWithExactly(testCode, expectedName, VERIFICATION_STATUSES.FAILURE, errorMessage)).toBe(true);
      });
    });
  });
});
