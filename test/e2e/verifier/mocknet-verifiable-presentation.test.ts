import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import VerifiablePresentationFixture from '../../fixtures/v3/mocknet-verifiable-presentation.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';
import fixtureCredentialSchema from '../../fixtures/credential-schema-example-id-card.json';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';

describe('Verifiable Presentation test suite', function () {
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

  it('should verify successfully', async function () {
    const certificate = new Certificate(VerifiablePresentationFixture);
    await certificate.init();
    const result = await certificate.verify();
    console.log(result.message);
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });
});
