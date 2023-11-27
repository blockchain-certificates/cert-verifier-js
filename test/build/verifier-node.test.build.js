import v1Fixture from '../fixtures/v1/mainnet-valid-1.2.json';
import v2Fixture from '../fixtures/v2/ethereum-main-valid-2.0.json';
import v3Fixture from '../fixtures/v3/proof-chain-example-secp256k1.json';
import { VERIFICATION_STATUSES } from '../../src';

describe('verifier build test suite', function () {
  describe('verifier build test suite', function () {
    it('verifies v1 certificate', async function () {
      const verificationStatus = await fetch('http://localhost:4000/verification', {
        body: JSON.stringify({
          blockcerts: v1Fixture,
          version: 'v1'
        }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => await res.json());
      expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });

    it('does not support v2 verification', async function () {
      const verificationStatus = await fetch('http://localhost:4000/verification', {
        body: JSON.stringify({
          blockcerts: v2Fixture,
          version: 'v2'
        }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => await res.json());
      expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('does not support v3 verification', async function () {
      const verificationStatus = await fetch('http://localhost:4000/verification', {
        body: JSON.stringify({
          blockcerts: v3Fixture,
          version: 'v3'
        }),
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).then(async (res) => await res.json());
      expect(verificationStatus.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });
  });
});
