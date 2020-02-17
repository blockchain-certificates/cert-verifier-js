import '../../dist/verifier-iife';
import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';

// TODO: this test would be better as a browser based (ie: run mocha in a browser test suite, like we do in Blockcerts Verifier)
describe('verifier build test suite', function () {
  it.todo('works as expected', async function () {
    const certificate = new Verifier.Certificate(FIXTURES.MainnetV2Valid);
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});