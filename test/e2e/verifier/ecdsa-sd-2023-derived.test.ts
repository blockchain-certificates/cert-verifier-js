import { describe, it, expect, vi, beforeAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixture from '../../fixtures/v3/ecdsa-sd-2023-derived-credential.json';
import fixtureIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('ecdsa-sd-2023 signed and derived document test suite', function () {
  beforeAll(function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }
        }
      };
    });
  });

  it('should verify successfully', async function () {
    const certificate = new Certificate(fixture as any);
    await certificate.init();
    const result = await certificate.verify();

    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
  });

  // TODO: uncomment the following if jsonld-signatures follows the spec https://github.com/digitalbazaar/jsonld-signatures/issues/185
  // describe('when the verifier\'s proofPurpose does not match the document\'s proof purpose', function () {
  //   it('should fail verification', async function () {
  //     const certificate = new Certificate(fixture as any, { proofPurpose: 'authentication' });
  //     await certificate.init();
  //     const result = await certificate.verify();
  //
  //     expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  //     expect(result.message).toBe(VERIFICATION_STATUSES.FAILURE);
  //   });
  // });
});
