import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import v2TestnetIssuerProfile from '../../assertions/v2-testnet-issuer-profile.json';
import v2TestnetRevocationList from '../../assertions/v2-testnet-revocation-list.json';
import MocknetV2Valid from '../../fixtures/v2/mocknet-valid-2.0.json';

describe('given the certificate is a valid mocknet (v2.0)', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://www.blockcerts.org/samples/2.0/issuer-testnet.json') {
            return JSON.stringify(v2TestnetIssuerProfile);
          }

          if (url === 'https://www.blockcerts.org/samples/2.0/revocation-list-testnet.json?assertionId=urn:uuid:bbba8553-8ec1-445f-82c9-a57251dd731c') {
            return JSON.stringify(v2TestnetRevocationList);
          }
        }
      };
    });

    const certificate = new Certificate(MocknetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
