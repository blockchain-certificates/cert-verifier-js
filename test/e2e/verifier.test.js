import 'babel-polyfill';
import sinon from 'sinon';
import { getVerboseMessage, Status } from '../../config/default';
import { VERIFICATION_STATUSES } from '../../src/index';
import { readFileAsync } from '../application/utils/readFile';
import Certificate from '../../src/certificate';

import EthereumMainV2Valid from '../fixtures/ethereum-main-valid-2.0';
import EthereumMainInvalidMerkleRoot from '../fixtures/ethereum-merkle-root-unmatch-2.0';
import EthereumMainRevoked from '../fixtures/ethereum-revoked-2.0';
import EthereumRopstenV2Valid from '../fixtures/ethereum-ropsten-valid-2.0';
import EthereumTampered from '../fixtures/ethereum-tampered-2.0';
import MainnetInvalidMerkleReceipt from '../fixtures/mainnet-invalid-merkle-receipt-2.0';
import MainnetMerkleRootUmmatch from '../fixtures/mainnet-merkle-root-unmatch-2.0';
import MainnetV2Revoked from '../fixtures/mainnet-revoked-2.0';
import MainnetV2Valid from '../fixtures/mainnet-valid-2.0';
import MainnetV2AlphaValid from '../fixtures/mainnet-valid-2.0-alpha';
import MocknetV2Valid from '../fixtures/mocknet-valid-2.0';
import RegtestV2Valid from '../fixtures/regtest-valid-2.0';
import Testnet404IssuerUrl from '../fixtures/testnet-404-issuer-url';
import TestnetV1NoIssuerProfile from '../fixtures/testnet-no-issuer-profile-1.2';
import TestnetRevokedV2 from '../fixtures/testnet-revoked-key-2.0';
import TestnetTamperedHashes from '../fixtures/testnet-tampered-hashes-2.0';
import TestnetV1Valid from '../fixtures/testnet-valid-1.2';
import TestnetV2Valid from '../fixtures/testnet-valid-2.0';
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

  describe('given the certificate is a tampered ethereum', () => {
    it('should fail', async () => {
      const certificate = new Certificate(EthereumTampered);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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
      const certificate = new Certificate(MainnetInvalidMerkleReceipt);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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
      const certificate = new Certificate(MainnetMerkleRootUmmatch);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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
      const certificate = new Certificate(MainnetV2Revoked);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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

  describe('given the certificate\'s issuer returns a 404', () => {
    it('should fail', async () => {
      const certificate = new Certificate(Testnet404IssuerUrl);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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
      const certificate = new Certificate(TestnetV1NoIssuerProfile);
      const result = await certificate.verify((step, text, status, errorMessage) => {
        if (step === Status.parsingIssuerKeys && status !== Status.starting) {
          expect(status).toBe(Status.failure);
          expect(errorMessage).toBe('Unable to parse JSON out of issuer identification data.');
        }
      });
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });

  describe('given the certificate is a revoked testnet', () => {
    it('should fail', async () => {
      const certificate = new Certificate(TestnetRevokedV2);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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
      const certificate = new Certificate(TestnetTamperedHashes);
      const result = await certificate.verify((step, text, status, errorMessage) => {
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
      const certificate = new Certificate(TestnetV1Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid testnet (v2.0)', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(TestnetV2Valid);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });

  describe('given the certificate is a valid testnet (v2.0) issued by v1 issuer', () => {
    it('should verify successfully', async () => {
      const certificate = new Certificate(TestnetV2ValidV1Issuer);
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });
});
