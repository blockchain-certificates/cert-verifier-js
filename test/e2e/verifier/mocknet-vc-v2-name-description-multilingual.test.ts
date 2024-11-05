import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import MocknetVCV2Multilingual from '../../fixtures/v3/mocknet-vc-v2-name-description-multilingual.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import fixtureCredentialSchema from '../../fixtures/credential-schema-example-id-card.json';

describe('given the certificate is a valid mocknet (v3.2)', function () {
  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureBlockcertsIssuerProfile);
          }

          if (url === 'https://www.blockcerts.org/samples/3.0/example-id-card-schema.json') {
            return JSON.stringify(fixtureCredentialSchema);
          }
        }
      };
    });
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  describe('where name and description are root level properties and support multilingual representation', function () {
    // this test will expire in 2039
    it('should verify successfully', async function () {
      const certificate = new Certificate(MocknetVCV2Multilingual);
      await certificate.init();
      const result = await certificate.verify();
      expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    });
  });
});
