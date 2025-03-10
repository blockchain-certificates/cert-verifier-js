import { describe, it, expect } from 'vitest';
import verifyIssuerProfile from '../../../src/inspectors/verifyIssuerProfile';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';
describe('verifyIssuerProfile inspector test suite', function () {
  describe('give the issuer profile is signed', function () {
    describe('and the issuer profile has not been modified', function () {
      it('should verify', async function () {
        let failed = false;

        try {
          await verifyIssuerProfile(fixtureIssuerProfile);
        } catch {
          failed = true;
        }

        expect(failed).toBe(false);
      });
    });
  });

  describe('give the issuer profile is signed', function () {
    describe('and the issuer profile has been modified', function () {
      it('should not verify', async function () {
        const modifiedFixture = {
          ...fixtureIssuerProfile,
          name: 'Modified Name'
        };

        await expect(async () => {
          await verifyIssuerProfile(modifiedFixture);
        }).rejects.toThrow('Issuer profile verification failed: The document\'s Ed25519Signature2020 signature could not be confirmed: Invalid signature');
      });
    });
  });
});
