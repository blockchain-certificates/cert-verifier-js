/**
 * @jest-environment node
 */

import { Certificate, SUB_STEPS, VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';

describe('End-to-end verification', function () {
  describe('given the certificate is a valid ethereum main', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.EthereumMainV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is an ethereum main with an invalid merkle root', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.EthereumMainInvalidMerkleRoot);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.checkMerkleRoot && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('Merkle root does not match remote hash.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a revoked ethereum main', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.EthereumMainRevoked);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.checkRevokedStatus && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('This certificate has been revoked by the issuer. Reason given: Accidentally issued to Ethereum.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a valid ethereum ropsten', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.EthereumRopstenV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a tampered ethereum', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.EthereumTampered);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.compareHashes && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('Computed hash does not match remote hash');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a mainnet with an invalid merkle receipt', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.MainnetInvalidMerkleReceipt);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.checkReceipt && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('Invalid Merkle Receipt. Proof hash did not match Merkle root');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a mainnet with a not matching merkle root', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.MainnetMerkleRootUmmatch);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.checkMerkleRoot && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('Merkle root does not match remote hash.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a revoked mainnet', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.MainnetV2Revoked);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.checkRevokedStatus && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('This certificate has been revoked by the issuer. Reason given: Issued in error.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0)', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.MainnetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0 alpha)', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.MainnetV2AlphaValid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mocknet (v2.0)', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.MocknetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid regtest (v2.0)', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.RegtestV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate\'s issuer returns a 404', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.TestnetV1IssuerUrl404);
      let failingStep = {};
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.getIssuerProfile && status === VERIFICATION_STATUSES.FAILURE) {
          failingStep = { code, label, status, errorMessage };
        }
      });
      expect(failingStep).toEqual({ code: SUB_STEPS.getIssuerProfile, label: 'Getting issuer profile', status: VERIFICATION_STATUSES.FAILURE, errorMessage: 'Unable to get issuer profile' });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate\'s issuer profile no longer exists', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.TestnetV1NoIssuerProfile);
      let failingStep = {};
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.getIssuerProfile && status === VERIFICATION_STATUSES.FAILURE) {
          failingStep = { code, label, status, errorMessage };
        }
      });
      expect(failingStep).toEqual({ code: SUB_STEPS.getIssuerProfile, label: 'Getting issuer profile', status: VERIFICATION_STATUSES.FAILURE, errorMessage: 'Unable to get issuer profile' });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a revoked testnet', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.TestnetRevokedV2);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.checkAuthenticity && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('Transaction occurred at time when issuing address was not considered valid.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a testnet with tampered hashes', function () {
    it('should fail', async function () {
      const certificate = new Certificate(FIXTURES.TestnetTamperedHashes);
      const result = await certificate.verify(({ code, label, status, errorMessage }) => {
        if (code === SUB_STEPS.compareHashes && status !== VERIFICATION_STATUSES.STARTING) {
          expect(status).toBe(VERIFICATION_STATUSES.FAILURE);
          expect(errorMessage).toBe('Computed hash does not match remote hash');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a valid testnet (v1.2)', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.TestnetV1Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid testnet (v2.0)', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.TestnetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  // TODO test is always failing, but passing when run by itself. To investigate
  xdescribe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', function () {
    it('should verify successfully', async function () {
      const certificate = new Certificate(FIXTURES.TestnetV2ValidV1Issuer);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });
});
