'use strict';

import 'babel-polyfill';
import { assert, expect } from 'chai';
import { Status } from '../config/default';
import { CertificateVerifier } from '../lib/index';
import { readFileAsync } from './utils/readFile';

describe('Certificate verifier', async () => {
  // Disabling this test; issuer profile call is hanging -- need to allow redirect?
  xdescribe('should', async () => {
    it('verify a v1 certificate', async () => {
      const data = await readFileAsync('tests/data/sample_cert-valid-1.2.0.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });
  });

  describe.only('should', () => {
    it('verify an ethereum mainnet v2 certificate', async () => {
      const data = await readFileAsync('tests/data/sample_ethereum_cert-mainnet-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });

    it('verify a v2 certificate', async () => {
      const data = await readFileAsync('tests/data/sample_cert-valid-2.0.json');
      // const data = await readFileAsync('tests/data/certificate-mocknet-invalid.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });

    it('verify an ethereum v2 certificate', async () => {
      const data = await readFileAsync(
        'tests/data/sample_ethereum_cert-valid-2.0.json',
      );
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });

    it('verify an ethereum ropsten v2 certificate', async () => {
      const data = await readFileAsync('tests/data/sample_ethereum_cert-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });

    it('verify an ethereum v2 certificate uppercase issuing address', async () => {
      const data = await readFileAsync('tests/data/sample_ethereum_cert-uppercase-address-valid-2.0.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });

    it('verify v2 alpha certificate', async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-valid-2.0-alpha.json',
      );
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.success);
    });

    it('return a failure when issuer profile URL does not exist (404)', async () => {
      const data = await readFileAsync('tests/data/sample_cert-invalid-issuer-url.json');
      const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
        // console.log(stepCode, message, status);
        if (stepCode === 'gettingIssuerProfile' && status !== Status.starting) {
          assert.equal(status, Status.failure);
        }
      });
      const result = await certVerifier.verify((stepCode, message, status) => {
        // console.log(stepCode, message, status);
      });
      assert.equal(result, Status.failure);
    });

    it('ensure a tampered v2 certificate fails', async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-unmapped-2.0.json',
      );

      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'computingLocalHash' && status !== Status.starting) {
            assert.equal(status, Status.failure);
          }
        },
      );

      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
      });
    });

    it('ensure a revoked v2 certificate fails', async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-revoked-2.0.json',
      );

      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (
            stepCode === 'checkingRevokedStatus' &&
            status !== Status.starting
          ) {
            assert.equal(status, Status.failure);
          }
        },
      );

      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
      });
    });

    it('ensure a revoked ethereum v2 certificate fails', async () => {
      const data = await readFileAsync(
        'tests/data/sample_ethereum_cert-revoked-2.0.json',
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (
            stepCode === 'checkingRevokedStatus' &&
            status !== Status.starting
          ) {
            assert.equal(status, Status.failure);
          }
        },
      );

      await certVerifier.verify((status, message) => {
        assert.equal(status, Status.failure);
        assert.equal(
          message,
          'This certificate has been revoked by the issuer.',
        );
      });
    });

    it('ensure a v2 certificate with a revoked issuing key fails', async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-with-revoked-key-2.0.json',
      );

      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (
            stepCode === 'checkingAuthenticity' &&
            status !== Status.starting
          ) {
            assert.strictEqual(status, 'failure');
          }
        },
      );

      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
      });
    });

    it('ensures a v2 certificate with an invalid merkle proof fails', async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-merkle-proof-fail-2.0.json',
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'checkingReceipt' && status !== Status.starting) {
            assert.strictEqual(status, 'failure');
          }
        },
      );

      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
        assert.equal(
          message,
          "Invalid Merkle Receipt. Proof hash didn't match Merkle root",
        );
      });
    });

    it("ensures a v2 certificate that's been tampered with fails", async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-tampered-2.0.json',
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'comparingHashes' && status !== Status.starting) {
            assert.strictEqual(status, 'failure');
          }
        },
      );

      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
        assert.equal(message, 'Computed hash does not match remote hash');
      });
    });

    it("ensures a v2 ethereum certificate that's been tampered with fails", async () => {
      const data = await readFileAsync(
        'tests/data/sample_ethereum_cert-tampered-2.0.json',
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'comparingHashes' && status !== Status.starting) {
            assert.strictEqual(status, 'failure');
          }
        },
      );
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
        assert.equal(message, 'Computed hash does not match remote hash');
      });
    });

    it("ensures a v2 certificate that doesn't match blockchain value fails", async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-root-does-not-match-2.0.json',
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'fetchingRemoteHash' && status !== Status.starting) {
            assert.strictEqual(status, 'failure');
          }
        },
      );
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
        assert.equal(message, 'Merkle root does not match remote hash.');
      });
    });

    it("ensures a v2 ethereum certificate that doesn't match blockchain value fails", async () => {
      const data = await readFileAsync(
        'tests/data/sample_ethereum_cert-root-does-not-match-2.0.json',
      );
      const certVerifier = new CertificateVerifier(
        data,
        (stepCode, message, status) => {
          if (stepCode === 'fetchingRemoteHash' && status !== Status.starting) {
            assert.strictEqual(status, 'failure');
          }
        },
      );
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.failure);
        assert.equal(message, 'Merkle root does not match remote hash.');
      });
    });

    it('ensures a v2 certificate with a v1 issuer passes', async () => {
      const data = await readFileAsync(
        'tests/data/sample_cert-with_v1_issuer-2.0.json',
      );
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.success);
      });
    });

    it('ensure a v2 mocknet passes', async () => {
      const data = await readFileAsync('tests/data/mocknet-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.mockSuccess);
      });
    });

    it('ensure a v2 regtest passes', async () => {
      const data = await readFileAsync('tests/data/regtest-2.0.json');
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.mockSuccess);
      });
    });

    it('ensure a v2 certificate\' dates get transformed to right timezone', async () => {
      const data = await readFileAsync('tests/data/sample_cert-breaking-timezone.json');
      const certVerifier = new CertificateVerifier(data);
      await certVerifier.verify((stepCode, message, status) => {
        assert.equal(status, Status.success);
      });
    });

    /*it('ensure a v2 certificate\' dates get transformed to right timezone', async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-breaking-timezone.json');
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });*/
  });
});
