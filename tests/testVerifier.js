'use strict';

import 'babel-polyfill';
import { assert, expect } from 'chai';
import { Status } from '../config/default';
import { CertificateVerifier } from '../lib/index';
import { readFileAsync } from '../lib/promisifiedRequests';

describe('Certificate verifier', async () => {
  // Disabling this test; issuer profile call is hanging -- need to allow redirect?
  /*
  describe('should', async () => {
    it('verify a v1 certificate', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-valid-1.2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, statusMessage => {
          console.log(statusMessage);
        });
        var result = await certVerifier.verify(finalMessage => {
          console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });
  });*/

  describe('should', () => {
    it('verify an ethereum mainnet v2 certificate', async () => {
      try {
        var data = await readFileAsync('tests/data/sample_ethereum_cert-mainnet-valid-2.0.json');
        var certVerifier = new CertificateVerifier(data, statusMessage => {
          console.log(statusMessage);
        });
        var result = await certVerifier.verify(finalMessage => {
          console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('verify a v2 certificate', async () => {
      try {
        var data = await readFileAsync('tests/data/sample_cert-valid-2.0.json');
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        console.log(err);
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('verify an ethereum ropsten v2 certificate', async () => {
          try {
              var data = await readFileAsync('tests/data/sample_ethereum_cert-valid-2.0.json');
              var certVerifier = new CertificateVerifier(data, statusMessage => {
                  console.log(statusMessage);
              });
              var result = await certVerifier.verify(finalMessage => {
                  console.log(finalMessage);
              });
              assert.equal(result, Status.success);
          } catch (err) {
              assert.fail(err, null, 'This should not fail');
          }
      });

    it('verify an ethereum v2 certificate uppercase issuing address', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_ethereum_cert-uppercase-address-valid-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('verify v2 alpha certificate', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-valid-2.0-alpha.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('ensure a tampered v2 certificate fails', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-unmapped-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(
          returnMessage,
          'Found unmapped fields during JSON-LD normalization: <http://fallback.org/someUnmappedField>,someUnmappedField',
        );
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it('ensure a revoked v2 certificate fails', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-revoked-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(
          returnMessage,
          'This certificate has been revoked by the issuer.',
        );
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it('ensure a revoked ethereum v2 certificate fails', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_ethereum_cert-revoked-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(
          returnMessage,
          'This certificate has been revoked by the issuer.',
        );
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it('ensure a v2 certificate with a revoked issuing key fails', async () => {
      // In other words, transaction happened after issuing key was revoked
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-with-revoked-key-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(
          returnMessage,
          'Transaction occurred at time when issuing address was not considered valid.',
        );
      } catch (err) {
        console.log(err);
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it('ensures a v2 certificate with an invalid merkle proof fails', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-merkle-proof-fail-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(
          returnMessage,
          "Invalid Merkle Receipt. Proof hash didn't match Merkle root",
        );
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it("ensures a v2 certificate that's been tampered with fails", async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-tampered-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, 'Computed hash does not match remote hash');
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it("ensures a v2 ethereum certificate that's been tampered with fails", async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_ethereum_cert-tampered-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, 'Computed hash does not match remote hash');
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it("ensures a v2 certificate that doesn't match blockchain value fails", async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-root-does-not-match-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, 'Merkle root does not match remote hash.');
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it("ensures a v2 ethereum certificate that doesn't match blockchain value fails", async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_ethereum_cert-root-does-not-match-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var returnMessage;
        var result = await certVerifier.verify((status, message) => {
          returnMessage = message;
        });
        assert.equal(result, Status.failure);
        assert.equal(returnMessage, 'Merkle root does not match remote hash.');
      } catch (err) {
        assert.fail(err, null, 'Caught unexpected exception');
      }
    });

    it('ensures a v2 certificate with a v1 issuer passes', async () => {
      try {
        var data = await readFileAsync(
          'tests/data/sample_cert-with_v1_issuer-2.0.json',
        );
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('ensure a v2 mocknet passes', async () => {
      try {
        var data = await readFileAsync('tests/data/mocknet-2.0.json');
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.mockSuccess);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('ensure a v2 regtest passes', async () => {
      try {
        var data = await readFileAsync('tests/data/regtest-2.0.json');
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.mockSuccess);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
    });

    it('ensure a v2 testnet passes', async () => {
      try {
        var data = await readFileAsync('tests/data/testnet-2.0.json');
        var certVerifier = new CertificateVerifier(data, (status, message) => {
          // console.log(status, message);
        });
        var result = await certVerifier.verify(finalMessage => {
          // console.log(finalMessage);
        });
        assert.equal(result, Status.success);
      } catch (err) {
        assert.fail(err, null, 'This should not fail');
      }
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
