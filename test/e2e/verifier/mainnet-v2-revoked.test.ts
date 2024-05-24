import { describe, it, expect, afterAll, beforeAll, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import v2IssuerProfile from '../../assertions/v2-issuer-profile-5a4fe9931f607f0f3452a65e.json';
import v2RevocationList from '../../assertions/v2-revocation-list';
import MainnetV2Revoked from '../../fixtures/v2/mainnet-revoked-2.0.json';

describe('given the certificate is a revoked mainnet', function () {
  let certificate;
  let result;

  beforeAll(async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json') {
            return JSON.stringify(v2IssuerProfile);
          }

          if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39') {
            return JSON.stringify(v2RevocationList);
          }
        },
        lookForTx: () => ({
          remoteHash: '4f877ca8cf3029c248e53cc93b6929ca28af2f11092785efcbc99127c9695d9d',
          issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
          time: '2020-09-02T16:39:43.000Z',
          revokedAddresses: ['1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo']
        })
      };
    });
    certificate = new Certificate(MainnetV2Revoked);
    await certificate.init();
    result = await certificate.verify();
  });

  afterAll(function () {
    vi.restoreAllMocks();
  });

  it('should fail', function () {
    expect(result.status).toBe(VERIFICATION_STATUSES.FAILURE);
  });

  it('should expose the error message', function () {
    expect(result.message).toBe('This certificate has been revoked by the issuer. Reason given: Incorrect Issue Date. New credential to be issued.');
  });
});
