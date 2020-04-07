import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';
const verifier = require('../../lib');

describe('verifier build test suite', function () {
  it('works as expected', async function () {
    const certificate = new verifier.Certificate(FIXTURES.MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
