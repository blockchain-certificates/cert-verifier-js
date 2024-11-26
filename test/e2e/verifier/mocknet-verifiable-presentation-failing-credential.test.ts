import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import VerifiablePresentationFixture from '../../fixtures/v3/mocknet-verifiable-presentation-failing-credential.json';
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

  describe('given one of the credentials is failing', function () {
    let result;
    beforeAll(async function () {
      const certificate = new Certificate(VerifiablePresentationFixture);
      await certificate.init();
      result = await certificate.verify();
    });

    it('should fail verification', function () {
      expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
    });

    it('should provide the error message', function () {
      expect(result.message).toBe('Credential with id urn:uuid:4f5f0100-ccbf-4ca9-9cfc-4f5fc3052d28 failed verification. Error: This certificate does not conform with the provided credential schema');
    });
  });
});
