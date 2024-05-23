import { describe, it, expect, vi } from 'vitest';
import { Certificate, VERIFICATION_STATUSES } from '../../../src';
import fixtureIssuerProfile from '../../fixtures/issuer-profile-mainnet-example.json';
import MainnetV2Valid from '../../fixtures/v2/mainnet-valid-2.0.json';
import v2RevocationList from '../../assertions/v2-revocation-list';

describe('given the certificate is a valid mainnet (v2.0)', function () {
  it('should verify successfully', async function () {
    vi.mock('@blockcerts/explorer-lookup', async (importOriginal) => {
      const explorerLookup = await importOriginal();
      return {
        ...explorerLookup,
        // replace some exports
        request: async function ({ url }) {
          if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e.json') {
            return JSON.stringify(fixtureIssuerProfile);
          }

          if (url === 'https://blockcerts.learningmachine.com/issuer/5a4fe9931f607f0f3452a65e/revocation.json?assertionId=https%3A%2F%2Fblockcerts.learningmachine.com%2Fcertificate%2Fc4e09dfafc4a53e8a7f630df7349fd39') {
            return JSON.stringify(v2RevocationList);
          }
        },
        lookForTx: () => ({
          remoteHash: 'b2ceea1d52627b6ed8d919ad1039eca32f6e099ef4a357cbb7f7361c471ea6c8',
          issuingAddress: '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo',
          time: '2018-02-08T00:23:34.000Z',
          revokedAddresses: [
            '1AwdUWQzJgfDDjeKtpPzMfYMHejFBrxZfo'
          ]
        })
      };
    });

    const certificate = new Certificate(MainnetV2Valid);
    await certificate.init();
    const result = await certificate.verify();
    expect(result.status).toBe(VERIFICATION_STATUSES.SUCCESS);
    vi.restoreAllMocks();
  });
});
