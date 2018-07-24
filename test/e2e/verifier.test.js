import 'babel-polyfill';
import { Status } from '../../config/default';
import { VERIFICATION_STATUSES } from '../../src/index';
import Certificate from '../../src/certificate';
import FIXTURES from '../fixtures';

describe('End-to-end verification', () => {
  describe('given the certificate is a valid ethereum main', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.EthereumMainV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is an ethereum main with an invalid merkle root', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.EthereumMainInvalidMerkleRoot);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
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
      const certificate = new Certificate(FIXTURES.EthereumMainRevoked);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
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
      const certificate = new Certificate(FIXTURES.EthereumRopstenV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a tampered ethereum', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.EthereumTampered);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.comparingHashes && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Computed hash does not match remote hash');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a mainnet with an invalid merkle receipt', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.MainnetInvalidMerkleReceipt);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.checkingReceipt && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Invalid Merkle Receipt. Proof hash did not match Merkle root');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a mainnet with a not matching merkle root', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.MainnetMerkleRootUmmatch);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.checkingMerkleRoot && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Merkle root does not match remote hash.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a revoked mainnet', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.MainnetV2Revoked);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.checkingRevokedStatus && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('This certificate has been revoked by the issuer. Reason given: Issued in error.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.MainnetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mainnet (v2.0 alpha)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.MainnetV2AlphaValid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid mocknet (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.MocknetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
    });
  });

  describe('given the certificate is a valid regtest (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.RegtestV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.MOCK_SUCCESS);
    });
  });

  describe('given the certificate\'s issuer returns a 404', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.Testnet404IssuerUrl);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.parsingIssuerKeys && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Unable to parse JSON out of issuer identification data.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate\'s issuer profile no longer exists', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.TestnetV1NoIssuerProfile);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        console.log(step, action, status, errorMessage);
        if (step === Status.parsingIssuerKeys && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Unable to parse JSON out of issuer identification data.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    }, 10000);
  });

  describe('given the certificate is a revoked testnet', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.TestnetRevokedV2);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.checkingAuthenticity && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Transaction occurred at time when issuing address was not considered valid.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a testnet with tampered hashes', () => {
    it('should fail', async () => {
      const certificate = new Certificate(FIXTURES.TestnetTamperedHashes);
      const result = await certificate.verify(({step, action, status, errorMessage}) => {
        if (step === Status.comparingHashes && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Computed hash does not match remote hash');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a valid testnet (v1.2)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.TestnetV1Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid testnet (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.TestnetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(FIXTURES.TestnetV2ValidV1Issuer);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });
});
