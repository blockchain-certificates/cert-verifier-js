import { describe, it, expect } from 'vitest';
import EddsaRdfc2022 from '../../../src/suites/EddsaRdfc2022';
import type { SuiteAPI } from '../../../src/models/Suite';
import type { Issuer } from '../../../src/models/Issuer';
import fixture from '../../fixtures/v3/eddsa-rdfc-2022-multikey-issuer-profile-credential.json';
import issuerProfile from '../../fixtures/eddsa-rdfc-2022-multikey-issuer-profile.json';

function getSuiteProps (overrides: Partial<SuiteAPI> = {}): SuiteAPI {
  return {
    executeStep: async (step, action) => await action(),
    document: JSON.parse(JSON.stringify(fixture)),
    proof: fixture.proof as any,
    issuer: JSON.parse(JSON.stringify(issuerProfile)) as Issuer,
    ...overrides
  } as SuiteAPI;
}

describe('EddsaRdfc2022 suite test suite', function () {
  describe('given the issuer profile publishes a Multikey verification method with publicKeyMultibase only', function () {
    it('should verify the credential signature', async function () {
      const suite = new EddsaRdfc2022(getSuiteProps());
      await expect(suite.verifyProof()).resolves.toBeUndefined();
      expect(suite.getIssuerPublicKey()).toBe(issuerProfile.verificationMethod[0].publicKeyMultibase);
    });

    it('should reject a credential whose content was altered after signing', async function () {
      const document = JSON.parse(JSON.stringify(fixture));
      document.validFrom = '2020-01-01T00:00:00Z';
      const suite = new EddsaRdfc2022(getSuiteProps({ document }));
      await expect(suite.verifyProof()).rejects.toThrow('signature could not be confirmed');
    });
  });
});
