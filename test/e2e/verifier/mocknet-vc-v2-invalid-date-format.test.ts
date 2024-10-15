import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import MocknetVCV2InvalidDateFormat from '../../fixtures/v3/mocknet-vc-v2-invalid-date-format.json';
import fixtureBlockcertsIssuerProfile from '../../fixtures/issuer-blockcerts.json';

describe('given the certificate is an invalid mocknet (v3.0) - invalid date format', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/3.0/issuer-blockcerts.json') {
            return JSON.stringify(fixtureBlockcertsIssuerProfile);
          }
        }
      };
    });

    afterAll(function () {
      vi.restoreAllMocks();
    });

    certificate = new Certificate(MocknetVCV2InvalidDateFormat);
    await certificate.init();
    result = await certificate.verify();
  });

  // this test will expire in 2039
  it('should fail verification', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('return the correct error message', function () {
    expect(result.message).toBe('The date format specified does not conform with the spec requirements (RFC3339). Property: proof MerkleProof2019 created');
  });
});
