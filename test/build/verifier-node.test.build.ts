import { describe, it, expect } from 'vitest';
import { VERIFICATION_STATUSES } from '../../src';
import FIXTURES from '../fixtures';

describe('verifier build test suite', function () {
  it('works as expected with a v2 certificate', async function () {
    const verificationStatus = await fetch('http://localhost:4000/verification', {
      body: JSON.stringify({
        blockcerts: FIXTURES.MainnetV2Valid,
        version: 'v2',
        useMockInternet: true
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(async (res) => await res.json());
    expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });

  it('works as expected with a v3 certificate', async function () {
    const verificationStatus = await fetch('http://localhost:4000/verification', {
      body: JSON.stringify({
        blockcerts: FIXTURES.BlockcertsV3,
        version: 'v3',
        useMockInternet: true
      }),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(async (res) => await res.json());
    expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
