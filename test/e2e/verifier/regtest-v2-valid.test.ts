import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import v2TestnetIssuerProfile from '../../assertions/v2-testnet-issuer-profile.json';
import v2TestnetRevocationList from '../../assertions/v2-testnet-revocation-list.json';
import RegtestV2Valid from '../../fixtures/v2/regtest-valid-2.0.json';

describe('given the certificate is a valid regtest (v2.0)', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json') {
            return JSON.stringify(v2TestnetIssuerProfile);
          }

          if (url === 'https://www.blockcerts.org/samples/2.0/revocation-list-testnet.json?assertionId=urn:uuid:3bc1a96a-3501-46ed-8f75-49612bbac257') {
            return JSON.stringify(v2TestnetRevocationList);
          }
        }
      };
    });

    const certificate = new Certificate(RegtestV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);

    vi.restoreAllMocks();
  });
});
