import 'babel-polyfill';
import sinon from 'sinon';
import { getVerboseMessage, Status } from '../../config/default';
import { VERIFICATION_STATUSES } from '../../src/index';
import { readFileAsync } from '../application/utils/readFile';
import Certificate from '../../src/certificate';

import EthereumMainV2Valid from '../fixtures/ethereum-main-valid-2.0';
import EthereumRopstenV2Valid from '../fixtures/ethereum-ropsten-valid-2.0';
import EthereumMainRevoked from '../fixtures/ethereum-revoked-2.0';
import EthereumMainInvalidMerkleRoot from '../fixtures/ethereum-merkle-root-unmatch-2.0';
import MainnetV2Valid from '../fixtures/mainnet-valid-2.0';
import MainnetV2AlphaValid from '../fixtures/mainnet-valid-2.0-alpha';
import MocknetV2Valid from '../fixtures/mocknet-valid-2.0';
import RegtestV2Valid from '../fixtures/regtest-valid-2.0';
import TestnetV1Valid from '../fixtures/testnet-valid-1.2';
import TestnetV2ValidV1Issuer from '../fixtures/testnet-valid-v1-issuer-2.0';

describe('End-to-end verification', () => {
  describe('given the certificate is a valid ethereum main', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(EthereumMainV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is an ethereum main with an invalid merkle root', () => {
    it('should fail', async () => {
      const certificate = new Certificate(EthereumMainInvalidMerkleRoot);
      const result = await certificate.verify((step, text, status, errorMessage) => {
        if (step === Status.checkingMerkleRoot && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Merkle root does not match remote hash.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a revoked ethereum main', () => {
    it('should fail', async () => {
      const certificate = new Certificate(EthereumMainRevoked);
      const result = await certificate.verify((step, text, status, errorMessage) => {
        if (step === Status.checkingRevokedStatus && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('This certificate has been revoked by the issuer. Reason given: Accidentally issued to Ethereum.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a valid ethereum ropsten', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(EthereumRopstenV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(MainnetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0 alpha)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(MainnetV2AlphaValid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mocknet (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(MocknetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
    });
  });

  describe('given the certificate is a valid regtest (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(RegtestV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
    });
  });

  describe('given the certificate is a valid testnet (v1.2)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(TestnetV1Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0) issued by v1 issuer', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(TestnetV2ValidV1Issuer);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });


});

xdescribe('Certificate verifier', () => {
  describe('should', () => {
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
