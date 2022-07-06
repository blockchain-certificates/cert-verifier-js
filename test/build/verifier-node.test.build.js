import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';

describe('verifier build test suite', function () {
  it('works as expected with a v2 certificate', async function () {
    const verificationStatus = await fetch('http://localhost:4000/verification', {
      body: JSON.stringify({
        blockcerts: FIXTURES.MainnetV2Valid,
        version: 'v2'
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then((res) => res.json());
    expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });

  it('works as expected with a v3 certificate', async function () {
    const verificationStatus = await fetch('http://localhost:4000/verification', {
      body: JSON.stringify({
        blockcerts: FIXTURES.BlockcertsV3NoDid,
        version: 'v3'
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then((res) => res.json());
    expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.FAILURE);
    expect(verificationStatus.message).toBe('Computed hash does not match remote hash');
  });
});
