import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';
const verifier = require('../../dist/verifier');

describe('verifier build test suite', function () {
  it('works as expected with a v1 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.TestnetV1Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    expect(result.message).toBe('Unable to get issuer profile');
  });

  it('works as expected with a v2 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
  });

  it('works as expected with a v3 certificate', async function () {
    const certificate = new verifier.Certificate(FIXTURES.BlockcertsV3AlphaCustomContext);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    if (result.status === VERIFICATION_STATUSES.FAILURE) {
      console.log(result.message);
    }
  });
});
