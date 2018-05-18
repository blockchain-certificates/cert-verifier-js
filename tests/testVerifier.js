'use strict';

import 'babel-polyfill';
import { assert, expect } from 'chai';
import { Status } from '../config/default';
import { CertificateVerifier } from '../lib/index';
import { readFileAsync } from '../lib/promisifiedRequests';

describe('Certificate verifier should', async () => {
  it('verify a v1 certificate', async () => {
    const data = await readFileAsync(
      'tests/data/sample_cert-valid-1.2.0.json',
    );
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.success);
    });
  });

  it('verify a v2 certificate', async () => {
    const data = await readFileAsync('tests/data/sample_cert-valid-2.0.json');
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.success);
    });
  });

  it('verify v2 alpha certificate', async () => {
    const data = await readFileAsync(
      'tests/data/sample_cert-valid-2.0-alpha.json',
    );
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.success);
    });  
  });

  it('ensure a tampered v2 certificate fails', async () => {
    const data = await readFileAsync(
      'tests/data/sample_cert-unmapped-2.0.json',
    );
    
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log(stepCode, message, status);
      if (stepCode === 'computingLocalHash' && status !== Status.starting) {
        assert.equal(status, Status.failure);
      }
    });

    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.failure);
    });
  });

  it('ensure a revoked v2 certificate fails', async () => {
    const data = await readFileAsync(
      'tests/data/sample_cert-revoked-2.0.json',
    );

    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log(stepCode, message, status);
      if (stepCode === 'checkingRevokedStatus' && status !== Status.starting) {
        assert.equal(status, Status.failure);
      }
    });

    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.failure);
    });
  });

  it('ensure a v2 certificate with a revoked issuing key fails', async () => {
    // In other words, transaction happened after issuing key was revoked
    const data = await readFileAsync(
      'tests/data/sample_cert-with-revoked-key-2.0.json',
    );

    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log(stepCode, message, status);
      if (stepCode === 'checkingAuthenticity' && status !== Status.starting) {
        assert.strictEqual(status, 'failure');
      }
    });

    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.failure);
    });
  });

  it('ensure a v2 certificate with a v1 issuer passes', async () => {
    const data = await readFileAsync(
      'tests/data/sample_cert-with_v1_issuer-2.0.json',
    );
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.success);
    });
  });

  it('ensure a v2 mocknet passes', async () => {
    const data = await readFileAsync('tests/data/mocknet-2.0.json');
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.mockSuccess);
    });
  });

  it('ensure an invalid v2 mocknet fails', async () => {
    const data = await readFileAsync(
      'tests/data/mocknet-weird.json',
    );

    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      console.log(stepCode, message, status);
      if (stepCode === 'computingLocalHash' && status !== Status.starting) {
        assert.strictEqual(status, 'failure');
      }
    });

    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.failure);
    });
  });

  it('ensure a v2 regtest passes', async () => {
    const data = await readFileAsync('tests/data/regtest-2.0.json');
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.mockSuccess);
    });
  });

  it('ensure a v2 testnet passes', async () => {
    const data = await readFileAsync('tests/data/testnet-2.0.json');
    const certVerifier = new CertificateVerifier(data, (stepCode, message, status) => {
      // console.log('update status:', stepCode, message, status);
    });
    await certVerifier.verify((finalStep, message, status) => {
      // console.log('FINAL', finalStep, message, status);
      assert.equal(status, Status.success);
    });
  });
});
